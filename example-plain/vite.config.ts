import { defineConfig } from "vite";

const base = process.env.CI ? "/naf/plain/" : "/";

export default defineConfig({
  base,
  plugins: [
    {
      name: "trailing-slash",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0];
          if (url && !url.endsWith("/") && !url.includes(".")) {
            res.writeHead(301, { Location: req.url + "/" });
            res.end();
            return;
          }
          next();
        });
      },
    },
    {
      name: "base-href",
      transformIndexHtml(html) {
        return html.replace(/<base href="\/"[^>]*>/, `<base href="${base}">`);
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        todo: "todo/index.html",
      },
    },
  },
  appType: "mpa",
});
