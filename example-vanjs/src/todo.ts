import van from "vanjs-core";
import { Nav } from "./nav";
import { styles } from "./styles";

const { div, h1, form, input, button, span, strong, style } = van.tags;

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "completed";

function TodoApp() {
  // State
  const todos = van.state<Todo[]>([
    { id: 1, text: "Learn VanJS", done: false },
    { id: 2, text: "Read the docs", done: true },
  ]);
  const filter = van.state<Filter>("all");
  const newText = van.state("");

  // Derived state
  const filteredTodos = van.derive(() => {
    const all = todos.val;
    const f = filter.val;
    if (f === "active") return all.filter((t) => !t.done);
    if (f === "completed") return all.filter((t) => t.done);
    return all;
  });

  const activeCount = van.derive(() => todos.val.filter((t) => !t.done).length);

  // Actions
  const addTodo = (e: Event) => {
    e.preventDefault();
    const text = newText.val.trim();
    if (text) {
      todos.val = [...todos.val, { id: Date.now(), text, done: false }];
      newText.val = "";
    }
  };

  const toggleTodo = (id: number) => {
    todos.val = todos.val.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
  };

  const deleteTodo = (id: number) => {
    todos.val = todos.val.filter((t) => t.id !== id);
  };

  // Components
  const FilterButton = (value: Filter, label: string) =>
    button(
      {
        class: () => `secondary ${filter.val === value ? "active" : ""}`,
        onclick: () => (filter.val = value),
      },
      label,
    );

  const TodoItem = (todo: Todo) =>
    div(
      { class: () => `todo-item ${todo.done ? "done" : ""}` },
      input({
        type: "checkbox",
        checked: todo.done,
        onchange: () => toggleTodo(todo.id),
      }),
      span({ class: "todo-text" }, todo.text),
      button({ class: "danger", onclick: () => deleteTodo(todo.id) }, "Delete"),
    );

  return div(
    { class: "container" },
    Nav("todo"),
    h1("Todos"),

    div(
      { class: "card" },
      form(
        { class: "add-todo-form", onsubmit: addTodo },
        input({
          type: "text",
          placeholder: "What needs to be done?",
          value: newText,
          oninput: (e: Event) =>
            (newText.val = (e.target as HTMLInputElement).value),
        }),
        button({ type: "submit", disabled: () => !newText.val.trim() }, "Add"),
      ),
    ),

    div(
      { class: "card" },
      div(
        { class: "filters" },
        FilterButton("all", "All"),
        FilterButton("active", "Active"),
        FilterButton("completed", "Completed"),
      ),
      () => div({ class: "todo-list" }, ...filteredTodos.val.map(TodoItem)),
    ),

    div(
      { class: "card stats" },
      strong(() => activeCount.val),
      " ",
      () => (activeCount.val === 1 ? "item remaining" : "items remaining"),
    ),
  );
}

// Mount
document.head.appendChild(style(styles));
van.add(document.body, TodoApp());
