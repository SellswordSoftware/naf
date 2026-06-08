import { createRouter, template } from "../../naf";
import { Home } from "./components/Home";
import { TodoPage } from "./components/TodoPage";
import { Nav } from "./components/Nav";

const root = document.querySelector("#app");
if (!root) {
  throw new Error("Could not find #app element");
}

// Wrap pages with nav
function withNav(page: () => ReturnType<typeof template>) {
  return () => template /*html*/ `
    <div class="layout">
      ${Nav()}
      <main>
        ${page()}
      </main>
    </div>
  `;
}

createRouter({
  root,
  routes: {
    "#/": withNav(Home),
    "#/todos": withNav(TodoPage),
  },
  notFound: withNav(
    () => template /*html*/ `
    <div class="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="#/">Go Home</a>
    </div>
  `,
  ),
});
