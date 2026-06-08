# NAF Todo App Example

A complete, feature-rich todo application built with NAF demonstrating best practices and all core features.

## Features

This example demonstrates:

- ✅ **Reactive State Management** - Signals and computed values
- ✅ **Component Composition** - Reusable Card and Button components
- ✅ **Feature-Based Organization** - Code organized by feature, not type
- ✅ **List Rendering** - Dynamic todo list with `each()`
- ✅ **Conditional Rendering** - Empty states with `when()`
- ✅ **Event Handling** - Add, toggle, delete, and filter todos
- ✅ **Form Input** - Text input with reactive validation
- ✅ **Filtering** - Show all, active, or completed todos
- ✅ **XSS Prevention** - Safe user input with `text()`
- ✅ **Lifecycle Hooks** - Proper setup and cleanup

## Running the Example

```bash
# From the example directory
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
example/
├── src/
│   └── main.ts           # Main application
├── index.html            # HTML and styles
├── package.json
└── vite.config.ts
```

## Code Organization

The example follows a **feature-based structure** as recommended in the NAF documentation:

### 1. Types

```typescript
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "completed";
```

### 2. Reusable Components

**Card Component** - Wraps content in a styled card:
```typescript
function Card(props: { 
  children: Component; 
  className?: string 
}): Component
```

**Button Component** - Reusable button with reactive disabled state:
```typescript
function Button(props: {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: () => boolean;
}): Component
```

### 3. Feature Components

Each feature is self-contained:

- **Header** - App title
- **AddTodoForm** - Input field and add button with validation
- **FilterButtons** - All/Active/Completed filter tabs
- **TodoItem** - Individual todo with checkbox and delete button
- **TodoList** - Container for todo items
- **EmptyState** - Different messages based on active filter
- **Stats** - Active and total todo counts

### 4. Main App

The `TodoApp()` function orchestrates everything:
- **State** - Signals for todos, input, and filter
- **Computed Values** - Filtered todos and counts
- **Actions** - Add, toggle, and delete functions
- **Render** - Composes all features together

## Key Patterns Demonstrated

### Feature-Based Organization

**Before (type-based):**
```
- All state together
- All computed together
- All actions together
- All components together
```

**After (feature-based):**
```
- Header feature (self-contained)
- AddTodo feature (state, actions, UI)
- Filters feature (self-contained)
- TodoList feature (items, empty state)
- Stats feature (self-contained)
```

**Benefits:**
- Easier to understand and maintain
- Features can be moved/removed independently
- Clear separation of concerns
- Better code reusability

### Reusable Component Pattern

```typescript
// Reusable component with props
function Card(props: { children: Component }): Component {
  return template`
    <div class="card">${props.children}</div>
  `;
}

// Usage
Card({
  children: template`<p>Content</p>`
})
```

### Reactive Form Validation

```typescript
// Button is automatically disabled when input is empty
effect(() => {
  const isEmpty = !newTodoText().trim();
  if (isEmpty) {
    button.setAttribute("disabled", "disabled");
  } else {
    button.removeAttribute("disabled");
  }
});
```

### Stable Computed Values in `when()`

**Bug Fix:** The original code had an infinite loop bug when all todos were filtered out:

```typescript
// ❌ WRONG - Causes infinite loop
when(
  () => filteredTodos().length > 0,
  () => each(filteredTodos, (todo) => ...)  // Calls filteredTodos() again!
)

// ✅ CORRECT - Capture value once
when(
  () => {
    const filtered = filteredTodos();
    return filtered.length > 0;
  },
  () => {
    const filtered = filteredTodos();  // Stable reference
    return TodoList({ todos: filtered, ... });
  }
)
```

The key is to **capture the computed value** and pass it as props rather than passing the computed function itself.

### Conditional Empty States

Different messages based on the active filter:

```typescript
const messages: Record<Filter, string> = {
  all: "No todos yet! Add one above to get started.",
  active: "No active todos! All done? 🎉",
  completed: "No completed todos yet. Keep working!",
};
```

## What This Example Teaches

### 1. Component Composition

Learn how to build complex UIs from small, reusable pieces:
- `Card` wraps content with consistent styling
- `Button` handles common button behavior
- `TodoItem` is a reusable list item

### 2. State Management

See how to organize state effectively:
- Local state with `signal()`
- Derived state with `computed()`
- Reactive updates with `effect()`

### 3. Real-World Patterns

Practical patterns you'll use in actual apps:
- Form handling and validation
- List operations (add, update, delete)
- Filtering and searching
- Empty states and messaging
- Lifecycle management

### 4. Performance Considerations

Learn performance best practices:
- Computed values cache results
- Stable references prevent re-renders
- Event listeners cleaned up properly
- Effects disposed on unmount

## Common Tasks

### Adding a New Feature

1. Create a feature component function
2. Define its props interface
3. Implement the UI with `template`
4. Add event handlers in `onMount`
5. Compose it into the main app

Example - Adding a "Clear Completed" button:

```typescript
function ClearCompleted(props: {
  onClear: () => void;
  hasCompleted: boolean;
}): Component {
  return when(
    () => props.hasCompleted,
    () => Button({
      text: "Clear Completed",
      onClick: props.onClear,
      className: "secondary"
    })
  );
}
```

### Debugging

If something doesn't work:

1. **Check the browser console** for errors
2. **Use `effect()` to log values**:
   ```typescript
   effect(() => {
     console.log('Todos:', todos());
   });
   ```
3. **Verify event listeners are attached** in `onMount`
4. **Check for infinite loops** - avoid calling computeds inside `each()`

## Styling

All styles are in `index.html` using vanilla CSS. Key patterns:

- **CSS Variables** for theming (optional enhancement)
- **Flexbox** for layouts
- **Transitions** for smooth interactions
- **Hover states** for better UX
- **Disabled states** for validation feedback

## Differences from TodoMVC

This example intentionally differs from TodoMVC to show NAF patterns:

- **Feature-based structure** instead of MVC
- **Reusable components** (Card, Button)
- **No routing** (focused on state management)
- **No persistence** (can be added with localStorage)
- **Simplified filters** (no URL hash routing)

## Next Steps

Enhance this example by adding:

1. **Persistence** - Save todos to localStorage
2. **Editing** - Double-click to edit todo text
3. **Drag & Drop** - Reorder todos
4. **Due Dates** - Add date fields
5. **Categories** - Group todos by category
6. **Search** - Filter by text search
7. **Keyboard Shortcuts** - Power user features

## Learn More

- [NAF Documentation](../../readme.md)
- [Getting Started Guide](../../docs/GETTING_STARTED.md)
- [API Reference](../../readme.md#features)

## License

MIT