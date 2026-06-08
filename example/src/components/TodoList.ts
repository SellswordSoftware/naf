import { template, each, Component } from "../../../naf";
import { Todo } from "./types";
import { Card } from "./Card";
import { TodoItem } from "./TodoItem";

export function TodoList(props: {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}): Component {
  return Card({
    children: template /*html*/ `
      <div class="todo-list">
        ${each(
          () => props.todos,
          (todo) =>
            TodoItem({
              todo,
              onToggle: props.onToggle,
              onDelete: props.onDelete,
            }),
        )}
      </div>
    `,
  });
}
