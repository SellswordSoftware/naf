import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  mount,
  raw,
  requireRef,
  signal,
  computed,
  template,
  when,
  each,
  text,
  Component,
} from "../naf";

describe("Component System", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("text", () => {
    it("should escape HTML entities", () => {
      const result = text('<script>alert("xss")</script>');
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      );
    });

    it("should escape ampersands", () => {
      const result = text("A & B");
      expect(result).toBe("A &amp; B");
    });

    it("should escape quotes", () => {
      const result = text('Say "hello"');
      expect(result).toBe("Say &quot;hello&quot;");
    });

    it("should handle multiple entities", () => {
      const result = text('<div class="test">A & B</div>');
      expect(result).toBe(
        "&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;",
      );
    });

    it("should handle empty string", () => {
      const result = text("");
      expect(result).toBe("");
    });

    it("should handle normal text without entities", () => {
      const result = text("Hello World");
      expect(result).toBe("Hello World");
    });
  });

  describe("template", () => {
    it("should create basic component from template literal", () => {
      const comp = template`<div>Hello World</div>`;

      expect(comp.html).toBe("<div>Hello World</div>");
      expect(typeof comp.mount).toBe("function");
    });

    it("should interpolate values", () => {
      const name = "Alice";
      const comp = template`<div>Hello ${name}</div>`;

      expect(comp.html).toBe("<div>Hello Alice</div>");
    });

    it("should interpolate signal values", () => {
      const count = signal(5);
      const comp = template`<div>Count: ${count()}</div>`;

      expect(comp.html).toBe("<div>Count: 5</div>");
    });

    it("should compose child components", () => {
      const child = template`<span>Child</span>`;
      const parent = template`<div>${child}</div>`;

      expect(parent.html).toContain("Child");
    });

    it("should mount component to parent", () => {
      const comp = template`<div>Content</div>`;
      comp.mount(container);

      expect(container.innerHTML).toContain("Content");
    });

    it("should call onMount when mounting", () => {
      const onMountFn = vi.fn();
      const comp = template({
        root: "#test",
        onMount: onMountFn,
      })`<div id="test">Content</div>`;

      comp.mount(container);
      expect(onMountFn).toHaveBeenCalledTimes(1);
    });

    it("should call onUnmount when unmounting", () => {
      const onUnmountFn = vi.fn();
      const comp = template({
        onUnmount: onUnmountFn,
      })`<div>Content</div>`;

      comp.mount(container);
      comp.unmount?.();

      expect(onUnmountFn).toHaveBeenCalledTimes(1);
    });

    it("should set el property when root selector is provided", () => {
      const comp = template({
        root: "#myroot",
      })`<div id="myroot">Content</div>`;

      comp.mount(container);
      expect(comp.el).toBeInstanceOf(HTMLElement);
      expect(comp.el?.id).toBe("myroot");
    });

    it("should unmount child components", () => {
      const childUnmount = vi.fn();
      const child = template({
        onUnmount: childUnmount,
      })`<span>Child</span>`;

      const parent = template`<div>${child}</div>`;
      parent.mount(container);
      parent.unmount?.();

      expect(childUnmount).toHaveBeenCalledTimes(1);
    });

    it("should filter out falsy values", () => {
      const comp = template`<div>${null}${undefined}${false}Text</div>`;
      expect(comp.html).toBe("<div>Text</div>");
    });

    it("should handle arrays in template", () => {
      const items = ["A", "B", "C"];
      const comp = template`<div>${items.join(", ")}</div>`;
      expect(comp.html).toBe("<div>A, B, C</div>");
    });

    it("should collect data-ref elements", () => {
      const comp = template({
        root: ".card",
        onMount(_el, _parent, ctx) {
          const title = requireRef<HTMLHeadingElement>(ctx.refs, "title");
          expect(title.textContent).toBe("Hello");
        },
      })`
        <section class="card">
          <h1 data-ref="title">Hello</h1>
        </section>
      `;

      comp.mount(container);
      expect(comp.refs.title).toBeInstanceOf(HTMLElement);
    });

    it("should support raw html interpolation", () => {
      const comp = template`<div>${raw("<span>Safe</span>")}</div>`;
      comp.mount(container);
      expect(container.innerHTML).toContain("<span>Safe</span>");
    });
  });

  describe("when", () => {
    it("should render then branch when condition is true", () => {
      const condition = signal(true);
      const thenComp = (value: boolean) => template`<div>Then</div>`;
      const elseComp = (value: boolean) => template`<div>Else</div>`;

      const comp = when(condition, thenComp, elseComp);
      comp.mount(container);

      expect(container.textContent).toContain("Then");
    });

    it("should render else branch when condition is false", () => {
      const condition = signal(false);
      const thenComp = (value: boolean) => template`<div>Then</div>`;
      const elseComp = (value: boolean) => template`<div>Else</div>`;

      const comp = when(condition, thenComp, elseComp);
      comp.mount(container);

      expect(container.textContent).toContain("Else");
    });

    it("should reactively switch branches", () => {
      const condition = signal(true);
      const thenComp = (value: boolean) => template`<div>Then</div>`;
      const elseComp = (value: boolean) => template`<div>Else</div>`;

      const comp = when(condition, thenComp, elseComp);
      comp.mount(container);

      expect(container.textContent).toContain("Then");

      condition(false);
      expect(container.textContent).toContain("Else");

      condition(true);
      expect(container.textContent).toContain("Then");
    });

    it("should work without else branch", () => {
      const condition = signal(true);
      const thenComp = (value: boolean) => template`<div>Then</div>`;

      const comp = when(condition, thenComp);
      comp.mount(container);

      expect(container.textContent).toContain("Then");

      condition(false);
      expect(container.textContent?.trim()).toBe("");
    });

    it("should cleanup previous component on switch", () => {
      const condition = signal(true);
      const thenUnmount = vi.fn();
      const elseUnmount = vi.fn();

      const thenComp = (value: boolean) =>
        template({
          onUnmount: thenUnmount,
        })`<div>Then</div>`;

      const elseComp = (value: boolean) =>
        template({
          onUnmount: elseUnmount,
        })`<div>Else</div>`;

      const comp = when(condition, thenComp, elseComp);
      comp.mount(container);

      expect(thenUnmount).not.toHaveBeenCalled();

      condition(false);
      expect(thenUnmount).toHaveBeenCalledTimes(1);
      expect(elseUnmount).not.toHaveBeenCalled();

      condition(true);
      expect(elseUnmount).toHaveBeenCalledTimes(1);
    });

    it("should cleanup on unmount", () => {
      const condition = signal(true);
      const thenComp = (value: boolean) => template`<div>Then</div>`;

      const comp = when(condition, thenComp);
      comp.mount(container);
      comp.unmount?.();

      // After unmount, changing condition should not affect DOM
      const initialHTML = container.innerHTML;
      condition(false);
      expect(container.innerHTML).toBe(initialHTML);
    });

    it("should pass condition value to callbacks to avoid double computation", () => {
      let computeCount = 0;
      const data = signal([1, 2, 3]);

      // Track how many times the condition is computed
      const condition = computed(() => {
        computeCount++;
        return data();
      });

      const thenComp = (value: number[]) => {
        // Use the passed value instead of calling condition() again
        return template`<div>${value.length} items</div>`;
      };

      const elseComp = (value: number[]) => {
        return template`<div>Empty</div>`;
      };

      const comp = when(condition, thenComp, elseComp);
      comp.mount(container);

      // Should only compute once per effect run
      const initialComputeCount = computeCount;
      expect(container.textContent).toContain("3 items");

      // Change data to trigger re-render
      data([1, 2, 3, 4]);

      // Verify computation happened exactly once more (not twice)
      expect(computeCount).toBe(initialComputeCount + 1);
      expect(container.textContent).toContain("4 items");
    });
  });

  describe("each", () => {
    it("should render list of items", () => {
      const items = signal([1, 2, 3]);
      const comp = each(items, (item) => template`<div>${item}</div>`);

      comp.mount(container);

      expect(container.textContent).toContain("1");
      expect(container.textContent).toContain("2");
      expect(container.textContent).toContain("3");
    });

    it("should reactively update on array change", () => {
      const items = signal([1, 2]);
      const comp = each(items, (item) => template`<div>Item ${item}</div>`);

      comp.mount(container);
      expect(container.textContent).toContain("Item 1");
      expect(container.textContent).toContain("Item 2");

      items([1, 2, 3, 4]);
      expect(container.textContent).toContain("Item 3");
      expect(container.textContent).toContain("Item 4");
    });

    it("should handle empty array", () => {
      const items = signal<number[]>([]);
      const comp = each(items, (item) => template`<div>${item}</div>`);

      comp.mount(container);
      expect(container.textContent?.trim()).toBe("");
    });

    it("should provide index to render function", () => {
      const items = signal(["a", "b", "c"]);
      const comp = each(
        items,
        (item, index) => template`<div>${index()}: ${item}</div>`,
      );

      comp.mount(container);
      expect(container.textContent).toContain("0: a");
      expect(container.textContent).toContain("1: b");
      expect(container.textContent).toContain("2: c");
    });

    it("should cleanup old components on update", () => {
      const unmountFn = vi.fn();
      const items = signal([1, 2]);

      const comp = each(
        items,
        (item) =>
          template({
            onUnmount: unmountFn,
          })`<div>${item}</div>`,
      );

      comp.mount(container);
      expect(unmountFn).not.toHaveBeenCalled();

      items([3, 4, 5]);
      expect(unmountFn).toHaveBeenCalledTimes(2); // 2 old items unmounted
    });

    it("should cleanup on component unmount", () => {
      const items = signal([1, 2, 3]);
      const comp = each(items, (item) => template`<div>${item}</div>`);

      comp.mount(container);
      comp.unmount?.();

      // After unmount, changing items should not affect DOM
      const initialHTML = container.innerHTML;
      items([4, 5, 6]);
      expect(container.innerHTML).toBe(initialHTML);
    });

    it("should handle complex objects", () => {
      const todos = signal([
        { id: 1, text: "Buy milk", done: false },
        { id: 2, text: "Walk dog", done: true },
      ]);

      const comp = each(
        todos,
        (todo) =>
          template`<div class="${todo.done ? "done" : ""}">${text(todo.text)}</div>`,
      );

      comp.mount(container);
      expect(container.textContent).toContain("Buy milk");
      expect(container.textContent).toContain("Walk dog");
    });

    it("should re-render all items on change", () => {
      const items = signal([1, 2, 3]);
      let renderCount = 0;

      const comp = each(items, (item) => {
        renderCount++;
        return template`<div>${item}</div>`;
      });

      comp.mount(container);
      const firstRenderCount = renderCount;

      items([1, 2, 3, 4]);
      expect(renderCount).toBeGreaterThan(firstRenderCount);
    });
  });

  describe("Component Integration", () => {
    it("should mount through the host helper", () => {
      const comp = template`<div>Mounted</div>`;
      mount(comp, container);
      expect(container.textContent).toContain("Mounted");
    });

    it("should compose multiple features", () => {
      const count = signal(0);
      const showCount = signal(true);

      const counterDisplay = () => template`<div>Count: ${count()}</div>`;
      const emptyMessage = () => template`<div>Hidden</div>`;

      const comp = template`
        <div>
          ${when(
            showCount,
            (v) => counterDisplay(),
            (v) => emptyMessage(),
          )}
          <button>+</button>
        </div>
      `;

      comp.mount(container);
      expect(container.textContent).toContain("Count: 0");

      showCount(false);
      expect(container.textContent).toContain("Hidden");

      showCount(true);
      expect(container.textContent).toContain("Count: 0");
    });

    it("should handle nested each and when", () => {
      const items = signal([1, 2, 3]);
      const showItems = signal(true);

      const itemList = (value: boolean) =>
        each(items, (item) => template`<div>Item ${item}</div>`);

      const empty = (value: boolean) => template`<div>No items</div>`;

      const comp = when(showItems, itemList, empty);
      comp.mount(container);

      expect(container.textContent).toContain("Item 1");
      expect(container.textContent).toContain("Item 2");

      showItems(false);
      expect(container.textContent).toContain("No items");
    });
  });
});
