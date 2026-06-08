import { template, Component } from "../../../naf";
import { Card } from "./Card";

export function Home(): Component {
  return template /*html*/ `
    <div class="home">
      <h1>NAF</h1>
      <p class="tagline">Not A Framework - Vanilla SPA Helper Functions</p>

      ${Card({
        children: template /*html*/ `
          <div class="about-section">
            <h2>What is NAF?</h2>
            <p>
              NAF is a ~1.6KB gzipped collection of helper functions for building
              single-page applications with vanilla JavaScript/TypeScript.
              No virtual DOM, no build step required, just copy and use.
            </p>
          </div>
        `,
      })}

      ${Card({
        children: template /*html*/ `
          <div class="features-section">
            <h2>Features</h2>
            <ul>
              <li><strong>Reactive Signals</strong> - Fine-grained reactivity without a virtual DOM</li>
              <li><strong>Computed Values</strong> - Automatic dependency tracking and caching</li>
              <li><strong>Effects</strong> - Side effects that re-run when dependencies change</li>
              <li><strong>Template Literals</strong> - Build components with tagged templates</li>
              <li><strong>Conditional Rendering</strong> - <code>when()</code> for reactive conditionals</li>
              <li><strong>List Rendering</strong> - <code>each()</code> for reactive lists</li>
              <li><strong>Routing</strong> - Hash-based SPA routing built-in</li>
            </ul>
          </div>
        `,
      })}

      ${Card({
        children: template /*html*/ `
          <div class="philosophy-section">
            <h2>Philosophy</h2>
            <p>
              Copy-first, not install-first. NAF is designed to be copied directly
              into your project. No npm install, no dependency management, no
              version conflicts. Just one file you own and can modify.
            </p>
          </div>
        `,
      })}

      ${Card({
        children: template /*html*/ `
          <div class="try-section">
            <h2>Try It</h2>
            <p>
              Check out the <a href="#/todos">Todo App</a> to see NAF in action.
            </p>
          </div>
        `,
      })}
    </div>
  `;
}
