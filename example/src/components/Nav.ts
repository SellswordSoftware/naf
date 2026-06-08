import { template, Component } from "../../../naf";

export function Nav(): Component {
  return template /*html*/ `
    <nav class="main-nav">
      <a href="#/">Home</a>
      <a href="#/todos">Todos</a>
    </nav>
  `;
}
