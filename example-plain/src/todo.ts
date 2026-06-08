interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "completed";

// State
let todos: Todo[] = [
  { id: 1, text: "Learn Plain JS", done: false },
  { id: 2, text: "Read the docs", done: true },
];
let filter: Filter = "all";

// DOM references
const form = document.getElementById("add-form") as HTMLFormElement;
const input = document.getElementById("new-todo") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const todoList = document.getElementById("todo-list") as HTMLDivElement;
const filtersEl = document.getElementById("filters") as HTMLDivElement;
const activeCountEl = document.getElementById("active-count") as HTMLElement;
const activeLabelEl = document.getElementById("active-label") as HTMLElement;

// Helpers
function $(selector: string, root: Element = document.body): Element | null {
  return root.querySelector(selector);
}

function getFilteredTodos(): Todo[] {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "completed") return todos.filter((t) => t.done);
  return todos;
}

function getActiveCount(): number {
  return todos.filter((t) => !t.done).length;
}

// Render functions
function renderTodoList(): void {
  const filtered = getFilteredTodos();
  todoList.innerHTML = "";

  for (const todo of filtered) {
    const item = document.createElement("div");
    item.className = `todo-item${todo.done ? " done" : ""}`;
    item.dataset.id = String(todo.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteBtn);
    todoList.appendChild(item);
  }
}

function renderStats(): void {
  const count = getActiveCount();
  activeCountEl.textContent = String(count);
  activeLabelEl.textContent = count === 1 ? "item remaining" : "items remaining";
}

function renderFilters(): void {
  const buttons = filtersEl.querySelectorAll("button");
  buttons.forEach((btn) => {
    const value = btn.dataset.filter as Filter;
    btn.classList.toggle("active", value === filter);
  });
}

function render(): void {
  renderTodoList();
  renderStats();
  renderFilters();
}

// Actions
function addTodo(): void {
  const text = input.value.trim();
  if (!text) return;

  todos = [...todos, { id: Date.now(), text, done: false }];
  input.value = "";
  addBtn.disabled = true;
  render();
  input.focus();
}

function toggleTodo(id: number): void {
  todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  render();
}

function deleteTodo(id: number): void {
  todos = todos.filter((t) => t.id !== id);
  render();
}

function setFilter(f: Filter): void {
  filter = f;
  render();
}

// Event listeners
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

input.addEventListener("input", () => {
  addBtn.disabled = !input.value.trim();
});

filtersEl.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "BUTTON" && target.dataset.filter) {
    setFilter(target.dataset.filter as Filter);
  }
});

// Initial render
render();
