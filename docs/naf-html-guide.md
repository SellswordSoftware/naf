# NAF Runtime Guide

This repo now uses a merged NAF runtime.

- `naf.ts` is the primary runtime
- `naf-html.ts` is a compatibility export surface for HTML-first imports

Use one import surface per module. Prefer `naf.ts` for new work.

## Core Principle

Use NAF when it makes ownership clearer.

Do not use NAF just because a helper exists.

The runtime is meant to make common frontend work smaller and more predictable:

- local state
- bounded markup ownership
- element-scoped reactive updates
- keyed list rendering
- centralized cleanup

If plain DOM is clearer, keep plain DOM.

## Runtime Surface

Reactivity:

- `signal()`
- `computed()`
- `effect()`
- `untrack()`
- `setReactiveDebug()`

Templates and components:

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
- `text()`

Forms and lists:

- `model()`
- `list()`
- `cleanupCollector()`
- `collectRowRefs()`
- `requireRef()`
- `requireElement()`

## Choosing the Right Level

### Use `template()` for bounded shells

Use `template()` when a module is mainly:

- local markup
- mount-time listener wiring
- bounded cleanup
- local element ownership

Typical good fits:

- pages
- dialogs
- toolbars
- bounded feature shells

Preferred pattern:

1. define markup with `template()`
2. mark important nodes with `data-ref`
3. use `onMount(el, parent, ctx)` and `ctx.refs`
4. collect cleanup in one place
5. use `mount(component, host)` instead of pairing `innerHTML` and `mount()`

### Use direct DOM plus helpers for interaction-heavy surfaces

Keep direct DOM ownership when a module is mainly:

- field binding
- row updates
- keyboard interaction
- pointer interaction
- drag and drop
- fine-grained incremental UI updates

Typical good fits:

- row renderers
- editors
- search result surfaces
- keyboard systems

`template()` is one tool, not the goal.

## Helper Guide

### `signal(initialValue)`

Use for mutable local state:

- open/closed state
- loading state
- local draft values
- local mode toggles

### `computed(fn)`

Use for derived values:

- filtered collections
- counts
- booleans derived from several signals
- derived labels

Do not use `computed()` for side effects.

### `effect(fn)`

Use for coordination and side effects:

- syncing state into the DOM when `fx()` is too narrow
- reacting to state changes that trigger work
- mount-level behavior

Keep effects small. If an effect owns too much branching and DOM work at once, split it.

### `fx(el, fn)`

Use for element-scoped reactive binding:

- `textContent`
- `classList`
- attributes
- small style changes
- single-element state sync

Prefer several small `fx()` calls over one large DOM-sync effect when that improves clarity.

### `show(el, condition)` / `hide(el, condition)`

Use these when the only DOM operation is `.hidden`.

Prefer:

- `show(el, editing)`
- `hide(el, loading)`

Over negated conditions inside generic `fx()`.

### `model(el, sig, { reactive: true })`

Use for:

- text inputs
- textareas
- selects
- checkboxes

Typical pattern:

1. `signal()` owns the value
2. `model()` binds the control
3. `fx()` or `effect()` handles derived UI like disabled state or status text

### `list(container, template, items, key, setup)`

Use for keyed repeated UI with stable identity.

Good fits:

- result rows
- toasts
- tree rows
- option lists

Prefer `list()` when:

- items have stable keys
- rows need listeners or reactive bindings
- entries should update incrementally

Inside `setup`, prefer `collectRowRefs(el)` when several row elements matter.

### `cleanupCollector(...)`

Use when a module registers several cleanups:

- listeners
- effects
- nested mounts
- timers

Prefer one obvious cleanup path per module.

### `listener(el, event, handler)`

Use with `cleanupCollector()` instead of manually pairing `addEventListener()` and `removeEventListener()`.

```ts
const cleanup = cleanupCollector();
cleanup.add(listener(button, "click", handleClick));
```

### `requireRef(refs, name)`

Use inside `template()` `onMount()` callbacks to validate required `data-ref` nodes.

```ts
const title = requireRef<HTMLHeadingElement>(ctx.refs, "title");
```

### `requireElement(root, selector, description)`

Use when a module binds into stable existing DOM and missing elements should fail loudly.

## Local Refs with `data-ref`

Prefer `data-ref` over repeated `querySelector()` calls when a template-backed component owns the markup.

Good uses:

- shell buttons
- headings
- local wrappers
- status nodes

Keep refs local to the component boundary.

## Reactive Debugging

Use `setReactiveDebug()` when a reactive flow is hard to reason about.

Label important state:

```ts
const query = signal("", { label: "search.query" });
const results = computed(() => search(query()), { label: "search.results" });
effect(() => render(results()), { label: "search.render" });
```

Enable focused tracing:

```ts
setReactiveDebug({
  enabled: true,
  include: ["search."],
  events: [
    "signal:set",
    "computed:recompute",
    "effect:run",
    "dependency:track",
  ],
});
```

Guidelines:

- keep debugging off by default
- label shared or high-churn state
- prefer narrow include filters
- use a custom sink or value formatter if needed

## Shared State vs Local State

Keep state local with `signal()` when:

- it belongs to one mounted instance
- it is presentational or transient
- no other module should import it

Move state to shared state modules when:

- several modules need it
- it coordinates features
- it represents app/session state

Use the smallest ownership scope that matches real behavior.

## Anti-Patterns

Avoid:

- large `effect()` bodies mixing business logic and DOM sync
- duplicated state in signals and manual mutable variables
- manual input syncing where `model()` should own the control
- rebuilding keyed lists manually when `list()` fits
- scattered cleanup paths
- forcing `template()` onto interaction-heavy modules just for consistency

## Review Checklist

When creating or editing a module, ask:

1. Is this a bounded shell or an interaction-heavy surface?
2. Should this state be local or shared?
3. Would `model()`, `fx()`, or `list()` reduce repeated wiring?
4. Is cleanup centralized and obvious?
5. Did using NAF make the code clearer?
