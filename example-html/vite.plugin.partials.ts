/**
 * Vite Plugin: HTML Partials
 *
 * Allows including HTML partials in your HTML files to avoid duplication.
 * Supports nested includes and works in both dev and build modes.
 *
 * Usage in HTML:
 * <include src="./partials/navbar.html"></include>
 *
 * Or with attributes:
 * <include src="./partials/navbar.html" data-page="home"></include>
 */

import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

interface HtmlPartialsOptions {
  /**
   * Root directory for resolving partial paths.
   * Defaults to project root.
   */
  root?: string;

  /**
   * Directory where partials are stored.
   * Defaults to 'src/partials'
   */
  partialsDir?: string;

  /**
   * Custom tag name for includes.
   * Defaults to 'include'
   */
  tagName?: string;

  /**
   * Whether to minify the included HTML.
   * Defaults to false
   */
  minify?: boolean;
}

export function htmlPartials(options: HtmlPartialsOptions = {}): Plugin {
  const {
    root = process.cwd(),
    partialsDir = "src/partials",
    tagName = "include",
    minify = false,
  } = options;

  // Track processed files to detect circular includes
  const processingStack: string[] = [];

  /**
   * Resolves a partial path relative to the current file
   */
  function resolvePartialPath(src: string, fromFile: string): string {
    // If src is relative, resolve from the current file's directory
    if (src.startsWith("./") || src.startsWith("../")) {
      return path.resolve(path.dirname(fromFile), src);
    }

    // If src starts with /, resolve from root
    if (src.startsWith("/")) {
      return path.join(root, src);
    }

    // Otherwise, resolve from partials directory
    return path.join(root, partialsDir, src);
  }

  /**
   * Extracts attributes from an include tag
   */
  function extractAttributes(tag: string): Record<string, string> {
    const attrs: Record<string, string> = {};

    // Match all attributes (key="value" or key='value' or key=value)
    const attrRegex = /(\w+)(?:=["']([^"']*)["']|=([^\s>]+))?/g;
    let match;

    while ((match = attrRegex.exec(tag)) !== null) {
      const [, key, quotedValue, unquotedValue] = match;
      if (key !== "src") {
        attrs[key] = quotedValue || unquotedValue || "true";
      }
    }

    return attrs;
  }

  /**
   * Replaces attribute placeholders in the partial content
   */
  function replaceAttributePlaceholders(
    content: string,
    attrs: Record<string, string>,
  ): string {
    let result = content;

    // Replace {{attribute-name}} with attribute values
    for (const [key, value] of Object.entries(attrs)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(placeholder, value);
    }

    return result;
  }

  /**
   * Processes HTML content and includes partials
   */
  function processHtml(html: string, filePath: string): string {
    // Check for circular includes
    if (processingStack.includes(filePath)) {
      throw new Error(
        `Circular include detected: ${processingStack.join(" -> ")} -> ${filePath}`,
      );
    }

    processingStack.push(filePath);

    try {
      // Match include tags with src attribute
      const includeRegex = new RegExp(
        `<${tagName}\\s+([^>]*src=["']([^"']+)["'][^>]*)\\s*\\/?>(?:<\\/${tagName}>)?`,
        "gi",
      );

      let result = html;
      let match;

      while ((match = includeRegex.exec(html)) !== null) {
        const [fullMatch, attributes, src] = match;

        try {
          // Resolve the partial path
          const partialPath = resolvePartialPath(src, filePath);

          // Read the partial file
          if (!fs.existsSync(partialPath)) {
            console.warn(`[html-partials] Partial not found: ${partialPath}`);
            continue;
          }

          let partialContent = fs.readFileSync(partialPath, "utf-8");

          // Extract and apply attributes
          const attrs = extractAttributes(attributes);
          partialContent = replaceAttributePlaceholders(partialContent, attrs);

          // Recursively process nested includes
          partialContent = processHtml(partialContent, partialPath);

          // Optionally minify
          if (minify) {
            partialContent = partialContent
              .replace(/\n\s+/g, "\n")
              .replace(/\n+/g, "\n")
              .trim();
          }

          // Replace the include tag with the partial content
          result = result.replace(fullMatch, partialContent);
        } catch (error) {
          console.error(`[html-partials] Error processing include: ${src}`);
          throw error;
        }
      }

      return result;
    } finally {
      processingStack.pop();
    }
  }

  return {
    name: "vite-plugin-html-partials",

    enforce: "pre", // Run before other plugins

    /**
     * Transform HTML files to include partials
     */
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        try {
          return processHtml(html, ctx.filename);
        } catch (error) {
          console.error("[html-partials] Transform error:", error);
          throw error;
        }
      },
    },

    /**
     * Handle HMR for partials
     */
    handleHotUpdate({ file, server }) {
      // If a partial file changes, reload all HTML files
      if (file.includes(partialsDir) && file.endsWith(".html")) {
        console.log(`[html-partials] Partial changed: ${file}`);

        // Reload all HTML pages
        server.ws.send({
          type: "full-reload",
          path: "*",
        });

        return [];
      }
    },

    /**
     * Log configuration on server start
     */
    configResolved(config) {
      console.log("[html-partials] Configuration:");
      console.log(`  Root: ${root}`);
      console.log(`  Partials directory: ${partialsDir}`);
      console.log(`  Tag name: <${tagName}>`);
      console.log(`  Minify: ${minify}`);
    },
  };
}

export default htmlPartials;
