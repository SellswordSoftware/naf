import { template, text, $on, toggleClass, Component } from "../../../naf";
import { Todo } from "./types";

export function TodoItem(props: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}): Component {
  return template({
    root: `[data-id="${props.todo.id}"]`,
    onMount(el) {
      $on(el, 'input[type="checkbox"]', "change", () =>
        props.onToggle(props.todo.id),
      );
      $on(el, ".delete-btn", "click", () => props.onDelete(props.todo.id));
      toggleClass(el, "done", () => props.todo.done);
    },
  }) /*html*/ `
    <div class="todo-item" data-id="${props.todo.id}">
      <input type="checkbox" ${props.todo.done ? "checked" : ""} />
      <span class="todo-text">${text(props.todo.text)}</span>
      <button class="danger delete-btn">Delete</button>
    </div>
  `;
}
