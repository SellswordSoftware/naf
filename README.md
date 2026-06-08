# NAF

NAF is a very small set of frontend helpers for fine-grained reactivity, DOM binding, and lightweight template-backed components without a full framework.

This repo now centers on a single merged runtime:

- `naf.ts`: the primary runtime
- `naf-html.ts`: a compatibility export surface for HTML-first imports

## Runtime Surface

Core reactivity:

- `signal()`
- `computed()`
- `effect()`
- `untrack()`
- `setReactiveDebug()`
- `getReactiveDebugConfig()`

Template and component helpers:

- `template()`
- `when()`
- `each()`
- `mount()`
- `raw()`

DOM helpers:

- `$()`
- `$$()`
- `listener()`
- `$on()`
- `fx()`
- `show()`
- `hide()`
- `attr()`
- `setText()`
- `toggleClass()`
- `toggleAttr()`
- `text()`

Form and list helpers:

- `model()`
- `list()`
- `cleanupCollector()`
- `collectRowRefs()`
- `requireRef()`
- `requireElement()`

Utilities:

- `createRouter()`

## Quick Start

Copy `naf.ts` into your project and import from it directly.

```ts
import {
  signal,
  template,
  mount,
  setText,
  listener,
  cleanupCollector,
} from "./naf";

function Counter() {
  const count = signal(0);

  return template({
    root: ".counter",
    onMount(el, _parent, ctx) {
      const cleanup = cleanupCollector();
      const button = el?.querySelector("button");
      const output = el?.querySelector("[data-ref='value']");

      cleanup.add(
        listener(button, "click", () => count(count() + 1)),
        setText(output, () => String(count())),
      );

      ctx.cleanup.add(cleanup.run);
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

## HTML-First Example

For existing markup, use the same runtime helpers directly or import them from `naf-html.ts` if you want the older HTML-first entrypoint:

```ts
import { $, fx, list, model, signal } from "./naf-html";

const query = signal("");
model($("input[type='search']"), query, { reactive: true });

fx($(".status"), (el) => {
  el.textContent = query().trim() ? `Searching for ${query()}` : "Idle";
});
```

## Usage Guidance

Use `template()` for bounded shells with local ownership:

- pages
- dialogs
- toolbars
- panels

Use direct DOM plus `fx()`, `model()`, `listener()`, and `list()` for interaction-heavy surfaces:

- editors
- row renderers
- drag and drop surfaces
- keyboard-driven views

Prefer:

- `show()` / `hide()` when you are only toggling `.hidden`
- `list()` for keyed repeated UI with cleanup
- `cleanupCollector()` for one obvious unmount path
- `data-ref` plus `requireRef()` inside template-owned markup

## Compatibility Notes

The repo still exports `naf-html.ts` for older examples and import paths. Internally, the source of truth is the merged `naf.ts` runtime.

The merged runtime keeps older convenience patterns where useful:

- `$()` and `$$()` support both `(selector, root?)` and `(root, selector)`
- `$on()` supports both direct element and root-selector forms
- `model()` supports both direct element and root-selector forms

## Docs

- [Getting Started](./docs/GETTING_STARTED.md)
- [Runtime Guide](./docs/naf-html-guide.md)

## Development

```bash
npm run type-check
npm test
```
