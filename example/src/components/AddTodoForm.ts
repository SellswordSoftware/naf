import { Signal, template, $, $on, model, attr, Component } from "../../../naf";
import { Card } from "./Card";

export function AddTodoForm(props: {
  newTodoText: Signal<string>;
  onAdd: () => void;
}): Component {
  return Card({
    children: template({
      root: ".add-todo-form",
      onMount(el) {
        const button = $<HTMLButtonElement>(el, "button");

        model(el, "input", props.newTodoText, { reactive: true });

        $on(el, "input", "keydown", (e) => {
          if (
            (e as KeyboardEvent).key === "Enter" &&
            props.newTodoText().trim()
          ) {
            props.onAdd();
          }
        });

        $on(el, "button", "click", () => {
          if (props.newTodoText().trim()) {
            props.onAdd();
          }
        });

        attr(button, "disabled", () => !props.newTodoText().trim());
      },
    }) /*html*/ `
      <div class="add-todo-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          autofocus
        />
        <button>Add</button>
      </div>
    `,
  });
}
