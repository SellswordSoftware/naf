// ============================================================================
// NAF (Not A Framework) - Merged Runtime
// ============================================================================
// A single runtime that combines fine-grained reactivity, DOM bindings,
// and lightweight template/component helpers without a framework.
// ============================================================================

export type Signal<T> = { (): T; (value: T): T };
export type Computed<T> = () => T;
type Subs = Set<() => void>;

export type ReactiveKind = "signal" | "computed" | "effect";

export type ReactiveDebugEventType =
  | "signal:get"
  | "signal:set"
  | "signal:set-same"
  | "signal:notify"
  | "computed:get"
  | "computed:recompute"
  | "computed:dirty"
  | "computed:notify"
  | "effect:run"
  | "effect:dispose"
  | "dependency:track";

export interface ReactiveDebugOptions {
  label?: string;
  debug?: boolean;
}

export interface ReactiveDebugMeta {
  id: number;
  kind: ReactiveKind;
  label: string;
  debug: boolean;
}

export interface ReactiveDebugEvent {
  seq: number;
  type: ReactiveDebugEventType;
  id: number;
  kind: ReactiveKind;
  label: string;
  timestamp: number;
  subscriberCount?: number;
  value?: unknown;
  previousValue?: unknown;
  observer?: string;
  observerKind?: ReactiveKind;
  source?: string;
  sourceKind?: ReactiveKind;
  dependencyCount?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface ReactiveDebugConfig {
  enabled: boolean;
  events?: ReactiveDebugEventType[];
  include?: string[];
  exclude?: string[];
  sink?: (event: ReactiveDebugEvent) => void;
  valueFormatter?: (value: unknown) => unknown;
}

export interface CleanupCollector {
  add: (...cleanups: Array<(() => void) | null | undefined | false>) => void;
  run: () => void;
}

export interface Component<T extends Element = Element> {
  html: string;
  el?: T;
  refs: Record<string, Element>;
  mount: (parent: Element) => void;
  unmount?: () => void;
}

export interface ComponentContext<T extends Element = Element> {
  host: Element;
  root: T | undefined;
  refs: Record<string, Element>;
  cleanup: CleanupCollector;
  component: Component<T>;
}

export interface TemplateOptions<T extends Element = Element> {
  root?: string;
  onMount?: (
    this: Component<T>,
    el: T | undefined,
    parent: Element,
    ctx: ComponentContext<T>,
  ) => void;
  onUnmount?: (this: Component<T>, ctx: ComponentContext<T>) => void;
}

export interface TemplateOptionsWithRoot<T extends Element = Element> {
  root: string;
  onMount?: (
    this: Component<T>,
    el: T,
    parent: Element,
    ctx: ComponentContext<T>,
  ) => void;
  onUnmount?: (this: Component<T>, ctx: ComponentContext<T>) => void;
}

interface RawHtml {
  __raw: true;
  html: string;
}

type TemplateValue =
  | Component
  | RawHtml
  | string
  | number
  | boolean
  | null
  | undefined;

interface ComponentSlot {
  id: number;
  component: Component;
}

interface ListOptions {
  virtual?: {
    rowHeight: number;
  };
}

export interface RouterOptions {
  root: Element;
  routes: Record<string, () => Component>;
  notFound?: () => Component;
}

export interface Router {
  navigate: (path: string) => void;
  current: () => string;
  destroy: () => void;
}

let activeSub: (() => void) | undefined;
let activeSets: Subs[] | undefined;
let activeObserver: ReactiveDebugMeta | undefined;

let nextReactiveId = 1;
let nextReactiveDebugSeq = 1;
let slotId = 0;

const tempDiv = document.createElement("div");

const reactiveDebugConfig: ReactiveDebugConfig = {
  enabled: false,
  sink(event) {
    console.debug(`[naf:${event.type}] ${event.label}`, event);
  },
};

function createReactiveMeta(
  kind: ReactiveKind,
  options?: ReactiveDebugOptions,
): ReactiveDebugMeta {
  const id = nextReactiveId;
  nextReactiveId += 1;
  return {
    id,
    kind,
    label: options?.label?.trim() || `${kind}#${id}`,
    debug: options?.debug === true,
  };
}

function matchesDebugPrefixes(
  label: string,
  prefixes: string[] | undefined,
): boolean {
  if (!Array.isArray(prefixes) || prefixes.length === 0) {
    return true;
  }
  return prefixes.some((prefix) => label.startsWith(prefix));
}

function shouldEmitReactiveDebug(
  meta: ReactiveDebugMeta,
  type: ReactiveDebugEventType,
): boolean {
  if (meta.debug && !reactiveDebugConfig.enabled) {
    return true;
  }

  if (!reactiveDebugConfig.enabled) {
    return false;
  }

  if (
    Array.isArray(reactiveDebugConfig.events) &&
    reactiveDebugConfig.events.length > 0 &&
    !reactiveDebugConfig.events.includes(type)
  ) {
    return false;
  }

  if (!matchesDebugPrefixes(meta.label, reactiveDebugConfig.include)) {
    return false;
  }

  if (
    Array.isArray(reactiveDebugConfig.exclude) &&
    reactiveDebugConfig.exclude.some((prefix) => meta.label.startsWith(prefix))
  ) {
    return false;
  }

  return true;
}

function formatReactiveDebugValue(value: unknown): unknown {
  if (reactiveDebugConfig.valueFormatter) {
    try {
      return reactiveDebugConfig.valueFormatter(value);
    } catch {
      return "[valueFormatter threw]";
    }
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "undefined"
  ) {
    return value;
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (Array.isArray(value)) {
    return `[Array(${value.length})]`;
  }

  if (value instanceof Map) {
    return `[Map(${value.size})]`;
  }

  if (value instanceof Set) {
    return `[Set(${value.size})]`;
  }

  if (typeof Element !== "undefined" && value instanceof Element) {
    const id = value.id ? `#${value.id}` : "";
    return `<${value.tagName.toLowerCase()}${id}>`;
  }

  if (typeof value === "object" && value) {
    const ctorName = value.constructor?.name;
    if (ctorName && ctorName !== "Object") {
      return `[${ctorName}]`;
    }
    const keys = Object.keys(value as Record<string, unknown>);
    return `{${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", ..." : ""}}`;
  }

  return String(value);
}

function emitReactiveDebug(
  meta: ReactiveDebugMeta | undefined,
  type: ReactiveDebugEventType,
  extra: Partial<ReactiveDebugEvent> = {},
): void {
  if (!meta || !shouldEmitReactiveDebug(meta, type)) {
    return;
  }

  const event: ReactiveDebugEvent = {
    seq: nextReactiveDebugSeq,
    type,
    id: meta.id,
    kind: meta.kind,
    label: meta.label,
    timestamp: Date.now(),
    ...extra,
  };
  nextReactiveDebugSeq += 1;

  try {
    reactiveDebugConfig.sink?.(event);
  } catch {
    // Debugging must never alter runtime behavior.
  }
}

export function setReactiveDebug(
  nextConfig: boolean | Partial<ReactiveDebugConfig>,
): ReactiveDebugConfig {
  if (typeof nextConfig === "boolean") {
    reactiveDebugConfig.enabled = nextConfig;
    return getReactiveDebugConfig();
  }

  reactiveDebugConfig.enabled =
    nextConfig.enabled ?? reactiveDebugConfig.enabled;
  reactiveDebugConfig.events = nextConfig.events
    ? [...nextConfig.events]
    : undefined;
  reactiveDebugConfig.include = nextConfig.include
    ? [...nextConfig.include]
    : undefined;
  reactiveDebugConfig.exclude = nextConfig.exclude
    ? [...nextConfig.exclude]
    : undefined;
  reactiveDebugConfig.sink = nextConfig.sink ?? reactiveDebugConfig.sink;
  reactiveDebugConfig.valueFormatter =
    nextConfig.valueFormatter ?? reactiveDebugConfig.valueFormatter;

  return getReactiveDebugConfig();
}

export function getReactiveDebugConfig(): ReactiveDebugConfig {
  return {
    enabled: reactiveDebugConfig.enabled,
    events: reactiveDebugConfig.events
      ? [...reactiveDebugConfig.events]
      : undefined,
    include: reactiveDebugConfig.include
      ? [...reactiveDebugConfig.include]
      : undefined,
    exclude: reactiveDebugConfig.exclude
      ? [...reactiveDebugConfig.exclude]
      : undefined,
    sink: reactiveDebugConfig.sink,
    valueFormatter: reactiveDebugConfig.valueFormatter,
  };
}

function track(subs: Subs, sourceMeta?: ReactiveDebugMeta): void {
  if (!activeSub) {
    return;
  }

  const alreadyTracked = subs.has(activeSub);
  subs.add(activeSub);
  activeSets?.push(subs);

  if (!alreadyTracked && sourceMeta && activeObserver) {
    emitReactiveDebug(sourceMeta, "dependency:track", {
      observer: activeObserver.label,
      observerKind: activeObserver.kind,
      source: sourceMeta.label,
      sourceKind: sourceMeta.kind,
    });
  }
}

function notify(subs: Subs, sourceMeta?: ReactiveDebugMeta): void {
  emitReactiveDebug(
    sourceMeta,
    sourceMeta?.kind === "computed" ? "computed:notify" : "signal:notify",
    { subscriberCount: subs.size },
  );
  [...subs].forEach((fn) => fn());
}

export function signal<T>(
  initialValue: T,
  options?: ReactiveDebugOptions,
): Signal<T> {
  let value = initialValue;
  const subs: Subs = new Set();
  const meta = createReactiveMeta("signal", options);

  return function (this: unknown, newValue?: T): T {
    if (arguments.length > 0) {
      if (value !== newValue) {
        const previousValue = value;
        value = newValue as T;
        emitReactiveDebug(meta, "signal:set", {
          previousValue: formatReactiveDebugValue(previousValue),
          value: formatReactiveDebugValue(newValue),
          subscriberCount: subs.size,
        });
        notify(subs, meta);
      } else {
        emitReactiveDebug(meta, "signal:set-same", {
          value: formatReactiveDebugValue(newValue),
          subscriberCount: subs.size,
        });
      }

      return newValue as T;
    }

    emitReactiveDebug(meta, "signal:get", {
      value: formatReactiveDebugValue(value),
      observer: activeObserver?.label,
      observerKind: activeObserver?.kind,
    });
    track(subs, meta);
    return value;
  } as Signal<T>;
}

export function computed<T>(
  fn: () => T,
  options?: ReactiveDebugOptions,
): Computed<T> {
  let value!: T;
  let dirty = true;
  const subs: Subs = new Set();
  const subscribedTo: Subs[] = [];
  const meta = createReactiveMeta("computed", options);

  const markDirty = () => {
    dirty = true;
    emitReactiveDebug(meta, "computed:dirty", {
      subscriberCount: subs.size,
    });
    notify(subs, meta);
  };

  return () => {
    emitReactiveDebug(meta, "computed:get", {
      observer: activeObserver?.label,
      observerKind: activeObserver?.kind,
    });
    track(subs, meta);

    if (dirty) {
      const prevSub = activeSub;
      const prevSets = activeSets;
      const prevObserver = activeObserver;
      subscribedTo.forEach((set) => set.delete(markDirty));
      subscribedTo.length = 0;
      activeSub = markDirty;
      activeSets = subscribedTo;
      activeObserver = meta;

      try {
        value = fn();
        dirty = false;
        emitReactiveDebug(meta, "computed:recompute", {
          value: formatReactiveDebugValue(value),
          dependencyCount: subscribedTo.length,
        });
      } finally {
        activeSub = prevSub;
        activeSets = prevSets;
        activeObserver = prevObserver;
      }
    }

    return value;
  };
}

export function effect(
  fn: () => void,
  options?: ReactiveDebugOptions,
): () => void {
  let running = false;
  let disposed = false;
  const subscribedTo: Subs[] = [];
  const meta = createReactiveMeta("effect", options);

  const run = () => {
    if (running || disposed) {
      return;
    }
    running = true;

    subscribedTo.forEach((set) => set.delete(run));
    subscribedTo.length = 0;

    const prevSub = activeSub;
    const prevSets = activeSets;
    const prevObserver = activeObserver;
    activeSub = run;
    activeSets = subscribedTo;
    activeObserver = meta;

    try {
      emitReactiveDebug(meta, "effect:run", {
        dependencyCount: subscribedTo.length,
      });
      fn();
    } finally {
      activeSub = prevSub;
      activeSets = prevSets;
      activeObserver = prevObserver;
      running = false;
    }
  };

  run();

  return () => {
    disposed = true;
    emitReactiveDebug(meta, "effect:dispose", {
      dependencyCount: subscribedTo.length,
    });
    subscribedTo.forEach((set) => set.delete(run));
    subscribedTo.length = 0;
  };
}

export function untrack<T>(fn: () => T): T {
  const prevSub = activeSub;
  const prevSets = activeSets;
  const prevObserver = activeObserver;
  activeSub = undefined;
  activeSets = undefined;
  activeObserver = undefined;
  try {
    return fn();
  } finally {
    activeSub = prevSub;
    activeSets = prevSets;
    activeObserver = prevObserver;
  }
}

export function text(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char] || char
    );
  });
}

export function raw(html: string): RawHtml {
  return { __raw: true, html };
}

function isRawHtml(value: unknown): value is RawHtml {
  return (
    typeof value === "object" &&
    value !== null &&
    "__raw" in value &&
    "html" in value &&
    (value as RawHtml).__raw === true
  );
}

function isComponent(value: unknown): value is Component {
  return (
    typeof value === "object" &&
    value !== null &&
    "html" in value &&
    "mount" in value &&
    typeof (value as Component).html === "string" &&
    typeof (value as Component).mount === "function"
  );
}

function buildTemplate(
  strings: TemplateStringsArray,
  values: TemplateValue[],
): { html: string; components: ComponentSlot[] } {
  const components: ComponentSlot[] = [];
  const parts: string[] = [strings[0] ?? ""];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (isComponent(value)) {
      const id = slotId++;
      components.push({ id, component: value });
      parts.push(
        `<span data-naf-component-slot="${id}" style="display: contents;">${value.html}</span>`,
      );
    } else if (isRawHtml(value)) {
      parts.push(value.html);
    } else if (typeof value === "string") {
      parts.push(value);
    } else if (value !== null && value !== undefined && value !== false) {
      parts.push(String(value));
    }

    parts.push(strings[index + 1] ?? "");
  }

  return {
    html: parts.join(""),
    components,
  };
}

function createFragment(html: string): DocumentFragment {
  tempDiv.innerHTML = html;
  const fragment = document.createDocumentFragment();
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  return fragment;
}

function mountFragment(host: Element, fragment: DocumentFragment): Element[] {
  const elements = Array.from(fragment.childNodes).filter(
    (node): node is Element => node instanceof Element,
  );
  host.appendChild(fragment);
  return elements;
}

function findScopedElement(
  elements: Element[],
  selector: string,
): Element | undefined {
  for (const element of elements) {
    if (element.matches(selector)) {
      return element;
    }

    const nested = element.querySelector(selector);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function collectRefs(elements: Element[]): Record<string, Element> {
  const refs: Record<string, Element> = {};

  for (const element of elements) {
    const name = element.getAttribute("data-ref");
    if (name) {
      if (refs[name]) {
        throw new Error(`Duplicate data-ref found: ${name}`);
      }
      refs[name] = element;
    }

    for (const child of element.querySelectorAll("[data-ref]")) {
      const childName = child.getAttribute("data-ref");
      if (!childName) {
        continue;
      }
      if (refs[childName]) {
        throw new Error(`Duplicate data-ref found: ${childName}`);
      }
      refs[childName] = child;
    }
  }

  return refs;
}

export function collectRowRefs(el: Element): Record<string, Element> {
  const refs: Record<string, Element> = {};
  const name = el.getAttribute("data-ref");
  if (name) {
    refs[name] = el;
  }

  for (const child of el.querySelectorAll("[data-ref]")) {
    const childName = child.getAttribute("data-ref");
    if (childName) {
      refs[childName] = child;
    }
  }

  return refs;
}

export function cleanupCollector(
  ...initial: Array<(() => void) | null | undefined | false>
): CleanupCollector {
  const cleanups = initial.filter(Boolean) as Array<() => void>;

  return {
    add(...nextCleanups) {
      for (const cleanup of nextCleanups) {
        if (cleanup) {
          cleanups.push(cleanup);
        }
      }
    },
    run() {
      while (cleanups.length > 0) {
        cleanups.pop()?.();
      }
    },
  };
}

export function requireRef<T extends Element>(
  refs: Record<string, Element>,
  name: string,
): T {
  const el = refs[name];
  if (!el) {
    throw new Error(`Missing required ref: ${name}`);
  }
  return el as T;
}

export function requireElement<T extends Element>(
  root: ParentNode,
  selector: string,
  description = selector,
): T {
  const el = root.querySelector(selector);
  if (!el) {
    throw new Error(`Missing required element: ${description} (${selector})`);
  }
  return el as T;
}

function createComponent<T extends Element = Element>(
  html: string,
  components: ComponentSlot[],
  options?: TemplateOptions<T>,
): Component<T> {
  const cleanup = cleanupCollector();
  let context: ComponentContext<T> | undefined;
  let mountedElements: Element[] = [];

  const component: Component<T> = {
    html,
    el: undefined,
    refs: {},
    mount(parent) {
      const fragment = createFragment(html);
      mountedElements = mountFragment(parent, fragment);

      if (options?.root) {
        const found = findScopedElement(mountedElements, options.root);
        if (!found) {
          throw new Error(`Element not found for selector: ${options.root}`);
        }
        component.el = found as T;
      }

      component.refs = collectRefs(mountedElements);

      for (const childSlot of components) {
        const slotHost = findScopedElement(
          mountedElements,
          `[data-naf-component-slot="${childSlot.id}"]`,
        );
        if (!(slotHost instanceof HTMLElement)) {
          throw new Error(`Component slot host not found: ${childSlot.id}`);
        }
        slotHost.replaceChildren();
        childSlot.component.mount(slotHost);
      }

      context = {
        host: parent,
        root: component.el,
        refs: component.refs,
        cleanup,
        component,
      };

      options?.onMount?.call(component, component.el, parent, context);
    },
    unmount() {
      for (const childSlot of components) {
        childSlot.component.unmount?.();
      }

      if (options?.onUnmount && context) {
        options.onUnmount.call(component, context);
      }

      cleanup.run();
      for (const element of mountedElements) {
        element.remove();
      }

      component.el = undefined;
      component.refs = {};
      mountedElements = [];
      context = undefined;
    },
  };

  return component;
}

export function template<T extends Element = Element>(
  options: TemplateOptionsWithRoot<T>,
): (
  strings: TemplateStringsArray,
  ...values: TemplateValue[]
) => Component<T>;
export function template<T extends Element = Element>(
  options: TemplateOptions<T>,
): (
  strings: TemplateStringsArray,
  ...values: TemplateValue[]
) => Component<T>;
export function template<T extends Element = Element>(
  strings: TemplateStringsArray,
  ...values: TemplateValue[]
): Component<T>;
export function template<T extends Element = Element>(
  optionsOrStrings: TemplateOptions<T> | TemplateStringsArray,
  ...valuesOrNothing: TemplateValue[]
):
  | Component<T>
  | ((strings: TemplateStringsArray, ...values: TemplateValue[]) => Component<T>) {
  if (
    !Array.isArray(optionsOrStrings) &&
    typeof optionsOrStrings === "object" &&
    optionsOrStrings !== null &&
    !("raw" in optionsOrStrings)
  ) {
    const options = optionsOrStrings as TemplateOptions<T>;
    return (strings: TemplateStringsArray, ...values: TemplateValue[]) => {
      const { html, components } = buildTemplate(strings, values);
      return createComponent(html, components, options);
    };
  }

  const strings = optionsOrStrings as TemplateStringsArray;
  const { html, components } = buildTemplate(strings, valuesOrNothing);
  return createComponent(html, components);
}

export function when<T>(
  condition: () => T,
  thenBranch: (value: T) => Component,
  elseBranch?: (value: T) => Component,
): Component {
  const hostId = slotId++;
  let host: HTMLElement | null = null;
  let currentComponent: Component | undefined;
  let stopEffect: (() => void) | undefined;
  let previousValue: T | undefined;
  let previousBranch: boolean | undefined;

  return {
    html: `<span data-naf-runtime-slot="${hostId}" style="display: contents;"></span>`,
    refs: {},
    mount(parent) {
      if (!parent.querySelector(`[data-naf-runtime-slot="${hostId}"]`)) {
        const fragment = createFragment(this.html);
        parent.appendChild(fragment);
      }
      host = parent.querySelector(
        `[data-naf-runtime-slot="${hostId}"]`,
      ) as HTMLElement | null;
      if (!host) {
        throw new Error("Conditional slot host not found");
      }
      const slotHost = host;

      stopEffect = effect(() => {
        const value = condition();
        const branch = Boolean(value);

        if (previousBranch === branch && previousValue === value) {
          return;
        }

        previousBranch = branch;
        previousValue = value;

        currentComponent?.unmount?.();
        currentComponent = branch ? thenBranch(value) : elseBranch?.(value);

        slotHost.replaceChildren();
        if (currentComponent) {
          currentComponent.mount(slotHost);
        }
      });
    },
    unmount() {
      stopEffect?.();
      currentComponent?.unmount?.();
      host?.remove();
      host = null;
    },
  };
}

export function each<T>(
  items: () => T[],
  render: (item: T, index: () => number) => Component,
): Component {
  const hostId = slotId++;
  let host: HTMLElement | null = null;
  let components: Component[] = [];
  let stopEffect: (() => void) | undefined;

  return {
    html: `<span data-naf-runtime-slot="${hostId}" style="display: contents;"></span>`,
    refs: {},
    mount(parent) {
      if (!parent.querySelector(`[data-naf-runtime-slot="${hostId}"]`)) {
        const fragment = createFragment(this.html);
        parent.appendChild(fragment);
      }
      host = parent.querySelector(
        `[data-naf-runtime-slot="${hostId}"]`,
      ) as HTMLElement | null;
      if (!host) {
        throw new Error("List slot host not found");
      }
      const slotHost = host;

      stopEffect = effect(() => {
        components.forEach((component) => component.unmount?.());
        components = [];
        slotHost.replaceChildren();

        const nextItems = items();
        nextItems.forEach((item, index) => {
          const component = render(item, () => index);
          components.push(component);
          component.mount(slotHost);
        });
      });
    },
    unmount() {
      stopEffect?.();
      components.forEach((component) => component.unmount?.());
      components = [];
      host?.remove();
      host = null;
    },
  };
}

export function mount<T extends Element = Element>(
  component: Component<T>,
  host: Element | null,
): Component<T> {
  if (!host) {
    throw new Error("Expected host element for component mount");
  }

  host.replaceChildren();
  component.mount(host);
  return component;
}

export function attr(
  el: Element | null | undefined,
  name: string,
  value: () => string | boolean | null,
): () => void {
  if (!el) {
    return () => {};
  }

  return effect(() => {
    const nextValue = value();
    if (nextValue === false || nextValue === null) {
      el.removeAttribute(name);
    } else if (nextValue === true) {
      el.setAttribute(name, "");
    } else {
      el.setAttribute(name, String(nextValue));
    }
  });
}

export function setText(
  el: Element | null | undefined,
  getter: () => unknown,
): () => void {
  if (!el) {
    return () => {};
  }

  return effect(() => {
    el.textContent = String(getter());
  });
}

export function toggleClass(
  el: Element | null | undefined,
  className: string,
  condition: () => boolean,
): () => void {
  if (!el) {
    return () => {};
  }

  return effect(() => {
    el.classList.toggle(className, condition());
  });
}

export function toggleAttr(
  el: Element | null | undefined,
  attrName: string,
  value: string,
  condition: () => boolean,
): () => void {
  return attr(el, attrName, () => (condition() ? value || true : false));
}

function resolveQueryArgs<T extends Element = Element>(
  arg1: string | Element | Document | null | undefined,
  arg2?: string | Element | Document | null,
): { selector: string; root: Element | Document } {
  if (typeof arg1 === "string") {
    return {
      selector: arg1,
      root: (arg2 as Element | Document | null) ?? document,
    };
  }

  return {
    selector: arg2 as string,
    root: (arg1 as Element | Document | null) ?? document,
  };
}

export function $<T extends Element = Element>(
  selector: string,
  root?: Element | Document | null,
): T | null;
export function $<T extends Element = Element>(
  root: Element | Document | null | undefined,
  selector: string,
): T | null;
export function $<T extends Element = Element>(
  arg1: string | Element | Document | null | undefined,
  arg2?: string | Element | Document | null,
): T | null {
  const { selector, root } = resolveQueryArgs<T>(arg1, arg2);
  return root.querySelector<T>(selector);
}

export function $$<T extends Element = Element>(
  selector: string,
  root?: Element | Document | null,
): T[];
export function $$<T extends Element = Element>(
  root: Element | Document | null | undefined,
  selector: string,
): T[];
export function $$<T extends Element = Element>(
  arg1: string | Element | Document | null | undefined,
  arg2?: string | Element | Document | null,
): T[] {
  const { selector, root } = resolveQueryArgs<T>(arg1, arg2);
  return Array.from(root.querySelectorAll<T>(selector));
}

export function listener<K extends keyof HTMLElementEventMap>(
  el: EventTarget | null | undefined,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
): () => void;
export function listener(
  el: EventTarget | null | undefined,
  event: string,
  handler: (event: Event) => void,
): () => void;
export function listener(
  el: EventTarget | null | undefined,
  event: string,
  handler: (event: Event) => void,
): () => void {
  el?.addEventListener(event, handler as EventListener);
  return () => el?.removeEventListener(event, handler as EventListener);
}

export function $on<T extends Element, K extends keyof HTMLElementEventMap>(
  el: T | null,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
): T | null;
export function $on<T extends Element>(
  el: T | null,
  event: string,
  handler: (event: Event) => void,
): T | null;
export function $on<T extends Element = Element>(
  root: Element | null | undefined,
  selector: string,
  event: string,
  handler: (event: Event) => void,
): T | null;
export function $on<T extends Element>(
  arg1: T | Element | null | undefined,
  arg2: string,
  arg3: ((event: Event) => void) | string,
  arg4?: (event: Event) => void,
): T | null {
  if (typeof arg3 === "function") {
    const el = arg1 as T | null;
    el?.addEventListener(arg2, arg3 as EventListener);
    return el;
  }

  const root = arg1 as Element | null | undefined;
  const el = root?.querySelector<T>(arg2) ?? null;
  if (el && arg4) {
    el.addEventListener(arg3, arg4 as EventListener);
  }
  return el;
}

export function fx<T extends Element>(
  el: T | null | undefined,
  fn: (el: T) => void,
): () => void {
  if (!el) {
    return () => {};
  }
  return effect(() => fn(el));
}

export function show(
  el: HTMLElement | null | undefined,
  condition: () => unknown,
): () => void {
  if (!el) {
    return () => {};
  }
  return effect(() => {
    el.hidden = !condition();
  });
}

export function hide(
  el: HTMLElement | null | undefined,
  condition: () => unknown,
): () => void {
  if (!el) {
    return () => {};
  }
  return effect(() => {
    el.hidden = Boolean(condition());
  });
}

function bindModelElement<
  T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  V,
>(
  el: T | null,
  sig: Signal<V>,
  options?: { reactive?: boolean; type?: "text" | "checkbox" | "radio" },
): T | null {
  if (!el) {
    return null;
  }

  const inferredCheckbox =
    el instanceof HTMLInputElement && el.type === "checkbox";
  const type = options?.type ?? (inferredCheckbox ? "checkbox" : "text");
  const eventType = type === "checkbox" ? "change" : "input";

  if (type === "checkbox" && el instanceof HTMLInputElement) {
    el.checked = sig() as unknown as boolean;
  } else {
    el.value = sig() as unknown as string;
  }

  el.addEventListener(eventType, () => {
    if (type === "checkbox" && el instanceof HTMLInputElement) {
      sig(el.checked as unknown as V);
    } else {
      sig(el.value as unknown as V);
    }
  });

  if (options?.reactive) {
    effect(() => {
      const value = sig();
      if (type === "checkbox" && el instanceof HTMLInputElement) {
        el.checked = value as unknown as boolean;
      } else if (el.value !== (value as unknown as string)) {
        el.value = value as unknown as string;
      }
    });
  }

  return el;
}

export function model<
  T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  V,
>(
  el: T | null,
  sig: Signal<V>,
  options?: { reactive?: boolean; type?: "text" | "checkbox" | "radio" },
): T | null;
export function model<
  T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  V,
>(
  root: Element | null | undefined,
  selector: string,
  sig: Signal<V>,
  options?: { reactive?: boolean; type?: "text" | "checkbox" | "radio" },
): T | null;
export function model<
  T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  V,
>(
  arg1: T | Element | null | undefined,
  arg2: Signal<V> | string,
  arg3?:
    | Signal<V>
    | { reactive?: boolean; type?: "text" | "checkbox" | "radio" },
  arg4?: { reactive?: boolean; type?: "text" | "checkbox" | "radio" },
): T | null {
  if (typeof arg2 === "string") {
    const root = arg1 as Element | null | undefined;
    const el = root?.querySelector<T>(arg2) ?? null;
    return bindModelElement(el, arg3 as Signal<V>, arg4);
  }

  return bindModelElement(arg1 as T | null, arg2, arg3 as {
    reactive?: boolean;
    type?: "text" | "checkbox" | "radio";
  });
}

function createTemplateFromString(html: string): HTMLTemplateElement {
  const templateEl = document.createElement("template");
  templateEl.innerHTML = html;
  return templateEl;
}

function listVirtual<T>(
  container: HTMLElement,
  templateEl: HTMLTemplateElement,
  items: () => T[],
  key: (item: T) => string | number,
  setup: (
    el: Element,
    item: () => T,
    index: () => number,
  ) => void | (() => void),
  rowHeight: number,
): () => void {
  container.style.overflowY = "auto";
  container.style.position = "relative";

  const spacer = document.createElement("div");
  spacer.style.position = "absolute";
  spacer.style.top = "0";
  spacer.style.left = "0";
  spacer.style.width = "100%";
  container.appendChild(spacer);

  const entries = new Map<
    string | number,
    {
      el: HTMLElement;
      item: Signal<T>;
      index: Signal<number>;
      cleanup?: () => void;
    }
  >();

  function getVisibleRange(): { start: number; end: number } {
    const totalItems = items().length;
    if (totalItems === 0) {
      return { start: 0, end: 0 };
    }

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const bufferSize = Math.max(3, Math.floor(viewportHeight / rowHeight));

    return {
      start: Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize),
      end: Math.min(
        totalItems,
        Math.ceil((scrollTop + viewportHeight) / rowHeight) + bufferSize,
      ),
    };
  }

  function updateVirtualList(): void {
    const values = items();
    spacer.style.height = `${values.length * rowHeight}px`;
    const { start, end } = getVisibleRange();
    const visibleKeys = new Set<string | number>();

    for (let index = start; index < end; index += 1) {
      const item = values[index];
      const entryKey = key(item);
      visibleKeys.add(entryKey);

      let entry = entries.get(entryKey);
      if (!entry) {
        const el = templateEl.content.firstElementChild?.cloneNode(
          true,
        ) as HTMLElement | null;
        if (!el) {
          continue;
        }

        el.style.position = "absolute";
        el.style.left = "0";
        el.style.width = "100%";
        el.style.height = `${rowHeight}px`;
        el.style.top = `${index * rowHeight}px`;

        const itemSig = signal(item);
        const indexSig = signal(index);
        entry = { el, item: itemSig, index: indexSig };
        entries.set(entryKey, entry);

        const cleanup = setup(el, () => itemSig(), () => indexSig());
        if (cleanup) {
          entry.cleanup = cleanup;
        }

        spacer.appendChild(el);
      } else {
        entry.item(item);
        entry.index(index);
        entry.el.style.top = `${index * rowHeight}px`;
      }
    }

    for (const [entryKey, entry] of entries) {
      if (!visibleKeys.has(entryKey)) {
        entry.cleanup?.();
        entry.el.remove();
        entries.delete(entryKey);
      }
    }
  }

  let scrollTick = false;
  const onScroll = () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => {
        updateVirtualList();
        scrollTick = false;
      });
    }
  };

  container.addEventListener("scroll", onScroll, { passive: true });
  const stopEffect = effect(updateVirtualList);
  updateVirtualList();

  return () => {
    stopEffect();
    container.removeEventListener("scroll", onScroll);
    for (const entry of entries.values()) {
      entry.cleanup?.();
      entry.el.remove();
    }
    entries.clear();
    spacer.remove();
    container.style.overflowY = "";
    container.style.position = "";
  };
}

export function list<T>(
  container: Element | null,
  templateEl: HTMLTemplateElement | string | null,
  items: () => T[],
  key: (item: T) => string | number,
  setup: (
    el: Element,
    item: () => T,
    index: () => number,
  ) => void | (() => void),
  options?: ListOptions,
): () => void {
  if (!container || !templateEl) {
    return () => {};
  }

  const tpl =
    typeof templateEl === "string"
      ? createTemplateFromString(templateEl)
      : templateEl;

  if (options?.virtual?.rowHeight && container instanceof HTMLElement) {
    return listVirtual(
      container,
      tpl,
      items,
      key,
      setup,
      options.virtual.rowHeight,
    );
  }

  const entries = new Map<
    string | number,
    {
      el: Element;
      item: Signal<T>;
      index: Signal<number>;
      cleanup?: () => void;
    }
  >();

  const stopEffect = effect(() => {
    const values = items();
    const newKeys = new Set(values.map((item) => key(item)));

    for (const [entryKey, entry] of entries) {
      if (!newKeys.has(entryKey)) {
        entry.cleanup?.();
        entry.el.remove();
        entries.delete(entryKey);
      }
    }

    let previousEl: Element | null = null;

    for (let index = 0; index < values.length; index += 1) {
      const item = values[index];
      const entryKey = key(item);
      let entry = entries.get(entryKey);

      if (!entry) {
        const el = tpl.content.firstElementChild?.cloneNode(true) as
          | Element
          | null;
        if (!el) {
          continue;
        }

        const itemSig = signal(item);
        const indexSig = signal(index);
        entry = { el, item: itemSig, index: indexSig };
        entries.set(entryKey, entry);

        const cleanup = setup(el, () => itemSig(), () => indexSig());
        if (cleanup) {
          entry.cleanup = cleanup;
        }
      } else {
        entry.item(item);
        entry.index(index);
      }

      if (previousEl) {
        if (entry.el.previousElementSibling !== previousEl) {
          previousEl.after(entry.el);
        }
      } else if (entry.el !== container.firstElementChild) {
        container.prepend(entry.el);
      }

      previousEl = entry.el;
    }
  });

  return () => {
    stopEffect();
    for (const entry of entries.values()) {
      entry.cleanup?.();
      entry.el.remove();
    }
    entries.clear();
  };
}

export function createRouter(options: RouterOptions): Router {
  const { root, routes, notFound } = options;
  let currentPage: Component | null = null;

  const current = () => window.location.hash || "#/";

  const handleRoute = () => {
    currentPage?.unmount?.();
    const factory = routes[current()] ?? notFound;

    if (!factory) {
      currentPage = null;
      root.replaceChildren();
      root.textContent = "Page Not Found";
      return;
    }

    currentPage = factory();
    mount(currentPage, root);
  };

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("load", handleRoute);

  if (document.readyState === "complete") {
    handleRoute();
  }

  const destroy = () => {
    window.removeEventListener("hashchange", handleRoute);
    window.removeEventListener("load", handleRoute);
    currentPage?.unmount?.();
    currentPage = null;
  };

  return { navigate, current, destroy };
}
