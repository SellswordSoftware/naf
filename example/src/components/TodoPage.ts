import { signal, computed, template, when, $, Component } from "../../../naf";
import { Todo, Filter } from "./types";
import { Header } from "./Header";
import { AddTodoForm } from "./AddTodoForm";
import { FilterButtons } from "./FilterButtons";
import { TodoList } from "./TodoList";
import { EmptyState } from "./EmptyState";
import { Stats } from "./Stats";

export function TodoPage(): Component {
  // State
  const todos = signal<Todo[]>([
    { id: 1, text: "Learn NAF", done: false },
    { id: 2, text: "Build a todo app", done: false },
  ]);
  const newTodoText = signal("");
  const filter = signal<Filter>("all");

  // Computed Values
  const filteredTodos = computed(() => {
    const all = todos();
    const f = filter();
    if (f === "active") return all.filter((t) => !t.done);
    if (f === "completed") return all.filter((t) => t.done);
    return all;
  });

  const activeCount = computed(() => {
    return todos().filter((t) => !t.done).length;
  });

  const totalCount = computed(() => {
    return todos().length;
  });

  // Actions
  const addTodo = () => {
    const text = newTodoText().trim();
    if (!text) return;

    todos([...todos(), { id: Date.now(), text, done: false }]);
    newTodoText("");

    setTimeout(() => {
      $<HTMLInputElement>(document, ".add-todo-form input")?.focus();
    }, 0);
  };

  const toggleTodo = (id: number) => {
    todos(todos().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: number) => {
    todos(todos().filter((t) => t.id !== id));
  };

  // Render
  return template /*html*/ `
    <div class="app">
      ${Header()}
      ${AddTodoForm({ newTodoText, onAdd: addTodo })}
      ${FilterButtons({ currentFilter: filter })}
      ${when(
        () => filteredTodos(),
        (filtered) =>
          TodoList({
            todos: filtered,
            onToggle: toggleTodo,
            onDelete: deleteTodo,
          }),
        () => EmptyState({ filter: filter() }),
      )}

      <div class="stats-wrapper">
          ${Stats({ activeCount, totalCount })}
      </div>
  `;
}
