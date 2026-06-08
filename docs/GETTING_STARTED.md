# Getting Started with NAF

NAF is a tiny runtime for frontend work built around:

- signals and computed values
- small reactive DOM bindings
- template-backed components when they improve ownership clarity

The main runtime is [`naf.ts`](../naf.ts). The [`naf-html.ts`](../naf-html.ts) file exists as a compatibility entrypoint for HTML-first usage.

## Install

This repo is designed to be easy to copy from. In the simplest case, copy `naf.ts` into your app and import from it directly.

```ts
import { signal, computed, effect } from "./naf";
```

## First Reactive State

```ts
import { signal, computed, effect } from "./naf";

const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log(count(), doubled());
});

count(5);
```

## First Component

Use `template()` when a module is mainly a bounded shell with local markup and mount-time wiring.

```ts
import { signal, template, mount, listener, setText } from "./naf";

function Counter() {
  const count = signal(0);

  return template({
    root: ".counter",
    onMount(el, _parent, ctx) {
      const button = el?.querySelector("button");
      const value = el?.querySelector("[data-ref='value']");

      ctx.cleanup.add(
        listener(button, "click", () => count(count() + 1)),
        setText(value, () => count()),
      );
    },
  })`
    <div class="counter">
      <span data-ref="value">0</span>
      <button>+</button>
    </div>
  `;
}

mount(Counter(), document.querySelector("#app"));
```

## Existing HTML

When markup already exists in the page, bind directly to it:

```ts
import { $, model, fx, signal } from "./naf";

const name = signal("");
model($("input[name='name']"), name, { reactive: true });

fx($(".preview"), (el) => {
  el.textContent = name().trim() || "Anonymous";
});
```

## Lists

Use `list()` when items have stable keys and row setup needs listeners or effects.

```ts
import { $, list, fx, signal } from "./naf";

const todos = signal([
  { id: 1, text: "Learn NAF" },
  { id: 2, text: "Build something" },
]);

list(
  $("#todo-list"),
  `<li><span class="label"></span></li>`,
  () => todos(),
  (todo) => todo.id,
  (el, item) => {
    fx($(".label", el), (node) => {
      node.textContent = item().text;
    });
  },
);
```

## Choosing the Right Level

Use `template()` for:

- pages
- dialogs
- bounded feature shells

Use direct DOM plus helpers like `fx()`, `model()`, `listener()`, and `list()` for:

- row-level rendering
- interaction-heavy editors
- drag and drop
- keyboard systems

## Next

- Read the [Runtime Guide](./naf-html-guide.md)
- Run `npm test`
- Browse the examples in `example/`, `example-html/`, and `example-plain/`
