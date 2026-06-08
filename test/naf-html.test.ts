import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  signal,
  computed,
  effect,
  text,
  $,
  $$,
  $on,
  cleanupCollector,
  fx,
  hide,
  listener,
  model,
  requireElement,
  list,
  show,
} from "../naf-html";

describe("NAF-HTML", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ========================================================================
  // REACTIVITY SYSTEM
  // ========================================================================

  describe("signal", () => {
    it("should create a signal with initial value", () => {
      const count = signal(0);
      expect(count()).toBe(0);
    });

    it("should update signal value", () => {
      const count = signal(0);
      count(5);
      expect(count()).toBe(5);
    });

    it("should return the new value when setting", () => {
      const count = signal(0);
      const result = count(10);
      expect(result).toBe(10);
    });

    it("should work with different types", () => {
      const str = signal("hello");
      const bool = signal(true);
      const obj = signal({ x: 1 });
      const arr = signal([1, 2, 3]);

      expect(str()).toBe("hello");
      expect(bool()).toBe(true);
      expect(obj()).toEqual({ x: 1 });
      expect(arr()).toEqual([1, 2, 3]);
    });

    it("should handle null and undefined", () => {
      const nullSignal = signal(null);
      const undefinedSignal = signal(undefined);

      expect(nullSignal()).toBe(null);
      expect(undefinedSignal()).toBe(undefined);
    });

    it("should only notify when value changes", () => {
      const count = signal(0);
      const fn = vi.fn(() => count());

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(0); // Same value
      expect(fn).toHaveBeenCalledTimes(1);

      count(1); // Different value
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("computed", () => {
    it("should compute derived value", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      expect(doubled()).toBe(4);
    });

    it("should update when dependency changes", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      count(5);
      expect(doubled()).toBe(10);
    });

    it("should cache computed values", () => {
      const count = signal(1);
      const computeFn = vi.fn(() => count() * 2);
      const doubled = computed(computeFn);

      expect(doubled()).toBe(2);
      expect(computeFn).toHaveBeenCalledTimes(1);

      expect(doubled()).toBe(2);
      expect(computeFn).toHaveBeenCalledTimes(1);

      count(3);
      expect(doubled()).toBe(6);
      expect(computeFn).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple dependencies", () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a() + b());

      expect(sum()).toBe(5);

      a(10);
      expect(sum()).toBe(13);

      b(5);
      expect(sum()).toBe(15);
    });

    it("should handle chained computed values", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);
      const quadrupled = computed(() => doubled() * 2);

      expect(quadrupled()).toBe(8);

      count(5);
      expect(quadrupled()).toBe(20);
    });
  });

  describe("effect", () => {
    it("should run immediately", () => {
      const fn = vi.fn();
      effect(fn);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should run when dependency changes", () => {
      const count = signal(0);
      const fn = vi.fn(() => count());

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(1);
      expect(fn).toHaveBeenCalledTimes(2);

      count(2);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should track multiple dependencies", () => {
      const a = signal(1);
      const b = signal(2);
      const fn = vi.fn(() => {
        a();
        b();
      });

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      a(10);
      expect(fn).toHaveBeenCalledTimes(2);

      b(20);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should return cleanup function", () => {
      const count = signal(0);
      const fn = vi.fn(() => count());

      const stop = effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(1);
      expect(fn).toHaveBeenCalledTimes(2);

      stop();

      count(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should work with computed dependencies", () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);
      const fn = vi.fn(() => doubled());

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should handle conditional dependencies", () => {
      const showA = signal(true);
      const a = signal(1);
      const b = signal(2);
      const fn = vi.fn(() => {
        if (showA()) {
          return a();
        } else {
          return b();
        }
      });

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      a(10);
      expect(fn).toHaveBeenCalledTimes(2);

      b(20);
      expect(fn).toHaveBeenCalledTimes(2);

      showA(false);
      expect(fn).toHaveBeenCalledTimes(3);

      b(30);
      expect(fn).toHaveBeenCalledTimes(4);

      a(100);
      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  // ========================================================================
  // DOM UTILITIES
  // ========================================================================

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

    it("should escape single quotes", () => {
      const result = text("It's fine");
      expect(result).toBe("It&#39;s fine");
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

  describe("$", () => {
    it("should find element by selector", () => {
      container.innerHTML = '<div id="test">Hello</div>';
      const el = $("#test", container);
      expect(el?.textContent).toBe("Hello");
    });

    it("should return null if not found", () => {
      const el = $("#nonexistent", container);
      expect(el).toBeNull();
    });

    it("should search document by default", () => {
      container.innerHTML = '<div id="doctest">Doc</div>';
      const el = $("#doctest");
      expect(el?.textContent).toBe("Doc");
    });
  });

  describe("$$", () => {
    it("should find all elements by selector", () => {
      container.innerHTML = "<div>A</div><div>B</div><div>C</div>";
      const els = $$("div", container);
      expect(els.length).toBe(3);
      expect(els.map((e) => e.textContent)).toEqual(["A", "B", "C"]);
    });

    it("should return empty array if none found", () => {
      const els = $$(".nonexistent", container);
      expect(els).toEqual([]);
    });

    it("should return an array (not NodeList)", () => {
      container.innerHTML = "<div>A</div>";
      const els = $$("div", container);
      expect(Array.isArray(els)).toBe(true);
    });
  });

  describe("$on", () => {
    it("should attach event listener", () => {
      container.innerHTML = "<button>Click</button>";
      const btn = $<HTMLButtonElement>("button", container)!;
      const handler = vi.fn();

      $on(btn, "click", handler);
      btn.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should return the element", () => {
      container.innerHTML = "<button>Click</button>";
      const btn = $("button", container)!;
      const result = $on(btn, "click", () => {});

      expect(result).toBe(btn);
    });

    it("should handle null element gracefully", () => {
      const result = $on(null, "click", () => {});
      expect(result).toBeNull();
    });
  });

  describe("listener", () => {
    it("should return a cleanup function that removes the listener", () => {
      container.innerHTML = "<button>Click</button>";
      const btn = $<HTMLButtonElement>("button", container)!;
      const handler = vi.fn();

      const cleanup = listener(btn, "click", handler);
      btn.click();
      cleanup();
      btn.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // REACTIVE BINDINGS
  // ========================================================================

  describe("fx", () => {
    it("should bind reactive effect to element", () => {
      container.innerHTML = "<span></span>";
      const el = $("span", container)!;
      const count = signal(0);

      fx(el, (e) => (e.textContent = String(count())));
      expect(el.textContent).toBe("0");

      count(42);
      expect(el.textContent).toBe("42");
    });

    it("should work with classList.toggle", () => {
      container.innerHTML = '<div class="item"></div>';
      const el = $("div", container)!;
      const isActive = signal(false);

      fx(el, (e) => e.classList.toggle("active", isActive()));
      expect(el.classList.contains("active")).toBe(false);

      isActive(true);
      expect(el.classList.contains("active")).toBe(true);

      isActive(false);
      expect(el.classList.contains("active")).toBe(false);
    });

    it("should work with setAttribute", () => {
      container.innerHTML = "<a>Link</a>";
      const el = $("a", container)!;
      const url = signal("/home");

      fx(el, (e) => e.setAttribute("href", url()));
      expect(el.getAttribute("href")).toBe("/home");

      url("/about");
      expect(el.getAttribute("href")).toBe("/about");
    });

    it("should work with toggleAttribute", () => {
      container.innerHTML = "<button>Click</button>";
      const el = $("button", container)!;
      const disabled = signal(true);

      fx(el, (e) => e.toggleAttribute("disabled", disabled()));
      expect(el.hasAttribute("disabled")).toBe(true);

      disabled(false);
      expect(el.hasAttribute("disabled")).toBe(false);
    });

    it("should return cleanup function", () => {
      container.innerHTML = "<span></span>";
      const el = $("span", container)!;
      const count = signal(0);

      const stop = fx(el, (e) => (e.textContent = String(count())));
      expect(el.textContent).toBe("0");

      stop();
      count(99);
      expect(el.textContent).toBe("0");
    });

    it("should handle null element", () => {
      const count = signal(0);
      const stop = fx(null, () => count());
      expect(typeof stop).toBe("function");
      stop(); // Should not throw
    });

    it("should pass element type through", () => {
      container.innerHTML = '<input type="text">';
      const el = $<HTMLInputElement>("input", container)!;
      const value = signal("test");

      // TypeScript should know 'e' is HTMLInputElement
      fx(el, (e) => (e.value = value()));
      expect(el.value).toBe("test");
    });
  });

  describe("show/hide", () => {
    it("should toggle hidden through show()", () => {
      container.innerHTML = "<div></div>";
      const el = $("div", container)! as HTMLElement;
      const visible = signal(true);

      show(el, visible);
      expect(el.hidden).toBe(false);

      visible(false);
      expect(el.hidden).toBe(true);
    });

    it("should toggle hidden through hide()", () => {
      container.innerHTML = "<div></div>";
      const el = $("div", container)! as HTMLElement;
      const hidden = signal(false);

      hide(el, hidden);
      expect(el.hidden).toBe(false);

      hidden(true);
      expect(el.hidden).toBe(true);
    });
  });

  describe("model", () => {
    it("should bind text input to signal", () => {
      container.innerHTML = '<input type="text">';
      const el = $<HTMLInputElement>("input", container)!;
      const value = signal("initial");

      model(el, value);
      expect(el.value).toBe("initial");

      // Simulate user input
      el.value = "changed";
      el.dispatchEvent(new Event("input"));
      expect(value()).toBe("changed");
    });

    it("should auto-detect and bind checkbox to signal", () => {
      container.innerHTML = '<input type="checkbox">';
      const el = $<HTMLInputElement>("input", container)!;
      const checked = signal(false);

      model(el, checked);
      expect(el.checked).toBe(false);

      el.checked = true;
      el.dispatchEvent(new Event("change"));
      expect(checked()).toBe(true);
    });

    it("should sync signal to input with reactive option", () => {
      container.innerHTML = '<input type="text">';
      const el = $<HTMLInputElement>("input", container)!;
      const value = signal("initial");

      model(el, value, { reactive: true });
      expect(el.value).toBe("initial");

      // Change signal externally
      value("external change");
      expect(el.value).toBe("external change");
    });

    it("should return the element", () => {
      container.innerHTML = '<input type="text">';
      const el = $<HTMLInputElement>("input", container)!;
      const value = signal("");

      const result = model(el, value);
      expect(result).toBe(el);
    });

    it("should return null for null element", () => {
      const value = signal("");
      const result = model(null, value);
      expect(result).toBeNull();
    });

    it("should work with textarea", () => {
      container.innerHTML = "<textarea></textarea>";
      const el = $<HTMLTextAreaElement>("textarea", container)!;
      const value = signal("initial");

      model(el, value);
      expect(el.value).toBe("initial");

      el.value = "new text";
      el.dispatchEvent(new Event("input"));
      expect(value()).toBe("new text");
    });

    it("should work with select", () => {
      container.innerHTML = `
        <select>
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      `;
      const el = $<HTMLSelectElement>("select", container)!;
      const value = signal("a");

      model(el, value);
      expect(el.value).toBe("a");

      el.value = "b";
      el.dispatchEvent(new Event("input"));
      expect(value()).toBe("b");
    });
  });

  // ========================================================================
  // LIST RENDERING
  // ========================================================================

  describe("list", () => {
    beforeEach(() => {
      container.innerHTML = `
        <div id="list-container"></div>
        <template id="item-tpl">
          <div class="item">
            <span class="text"></span>
            <button class="delete">X</button>
          </div>
        </template>
      `;
    });

    it("should render list of items", () => {
      const items = signal([
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;
      expect(listEl.children.length).toBe(2);
      expect(listEl.children[0].textContent).toContain("First");
      expect(listEl.children[1].textContent).toContain("Second");
    });

    it("should add new items", () => {
      const items = signal([{ id: 1, text: "First" }]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;
      expect(listEl.children.length).toBe(1);

      items([
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ]);

      expect(listEl.children.length).toBe(2);
    });

    it("should remove items", () => {
      const items = signal([
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;
      expect(listEl.children.length).toBe(2);

      items([{ id: 2, text: "Second" }]);

      expect(listEl.children.length).toBe(1);
      expect(listEl.children[0].textContent).toContain("Second");
    });

    it("should update existing items", () => {
      const items = signal([{ id: 1, text: "First" }]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;
      expect(listEl.children[0].textContent).toContain("First");

      items([{ id: 1, text: "Updated" }]);

      expect(listEl.children[0].textContent).toContain("Updated");
    });

    it("should reorder items", () => {
      const items = signal([
        { id: 1, text: "A" },
        { id: 2, text: "B" },
        { id: 3, text: "C" },
      ]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;

      items([
        { id: 3, text: "C" },
        { id: 1, text: "A" },
        { id: 2, text: "B" },
      ]);

      expect(listEl.children[0].textContent).toContain("C");
      expect(listEl.children[1].textContent).toContain("A");
      expect(listEl.children[2].textContent).toContain("B");
    });

    it("should call cleanup when item is removed", () => {
      const cleanupFn = vi.fn();
      const items = signal([
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
          return cleanupFn;
        },
      );

      expect(cleanupFn).not.toHaveBeenCalled();

      items([{ id: 2, text: "Second" }]);

      expect(cleanupFn).toHaveBeenCalledTimes(1);
    });

    it("should call all cleanups on list cleanup", () => {
      const cleanupFn = vi.fn();
      const items = signal([
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ]);

      const stop = list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
          return cleanupFn;
        },
      );

      stop();

      expect(cleanupFn).toHaveBeenCalledTimes(2);
    });

    it("should provide index to setup function", () => {
      const items = signal([
        { id: 1, text: "A" },
        { id: 2, text: "B" },
      ]);
      const indices: number[] = [];

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item, index) => {
          indices.push(index());
        },
      );

      expect(indices).toEqual([0, 1]);
    });

    it("should handle empty list", () => {
      const items = signal<{ id: number; text: string }[]>([]);

      list(
        $("#list-container", container),
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (e) => (e.textContent = item().text));
        },
      );

      const listEl = $("#list-container", container)!;
      expect(listEl.children.length).toBe(0);
    });

    it("should return noop for null container", () => {
      const items = signal([{ id: 1, text: "First" }]);

      const stop = list(
        null,
        $<HTMLTemplateElement>("#item-tpl", container),
        () => items(),
        (item) => item.id,
        () => {},
      );

      expect(typeof stop).toBe("function");
      stop(); // Should not throw
    });

    it("should return noop for null template", () => {
      const items = signal([{ id: 1, text: "First" }]);

      const stop = list(
        $("#list-container", container),
        null,
        () => items(),
        (item) => item.id,
        () => {},
      );

      expect(typeof stop).toBe("function");
      stop();
    });

    it("should support html string templates", () => {
      container.innerHTML = `<div id="list-container"></div>`;
      const items = signal([{ id: 1, text: "First" }]);

      list(
        $("#list-container", container),
        `<div class="item"><span class="text"></span></div>`,
        () => items(),
        (item) => item.id,
        (el, item) => {
          fx($(".text", el), (node) => (node.textContent = item().text));
        },
      );

      expect(container.textContent).toContain("First");
    });
  });

  describe("helpers", () => {
    it("should collect and run multiple cleanups", () => {
      const calls: string[] = [];
      const cleanup = cleanupCollector(
        () => calls.push("first"),
        () => calls.push("second"),
      );

      cleanup.add(() => calls.push("third"));
      cleanup.run();

      expect(calls).toEqual(["third", "second", "first"]);
    });

    it("should require an element by selector", () => {
      container.innerHTML = `<section><button>Save</button></section>`;
      const button = requireElement<HTMLButtonElement>(
        container,
        "button",
        "save button",
      );
      expect(button.textContent).toBe("Save");
    });
  });

  // ========================================================================
  // INTEGRATION
  // ========================================================================

  describe("Integration", () => {
    it("should handle complex reactive graph", () => {
      const count = signal(1);
      const doubled = computed(() => count() * 2);
      const tripled = computed(() => count() * 3);
      const sum = computed(() => doubled() + tripled());

      expect(sum()).toBe(5);

      count(2);
      expect(sum()).toBe(10);

      count(10);
      expect(sum()).toBe(50);
    });

    it("should work with list and reactive bindings together", () => {
      container.innerHTML = `
        <div id="todo-container"></div>
        <template id="todo-tpl">
          <div class="todo">
            <input type="checkbox">
            <span class="text"></span>
          </div>
        </template>
      `;

      const todos = signal([
        { id: 1, text: "Learn NAF", done: false },
        { id: 2, text: "Build app", done: true },
      ]);

      list(
        $("#todo-container", container),
        $<HTMLTemplateElement>("#todo-tpl", container),
        () => todos(),
        (t) => t.id,
        (el, item) => {
          const c1 = fx($(".text", el), (e) => (e.textContent = item().text));
          const c2 = fx(el, (e) => e.classList.toggle("done", item().done));

          return () => {
            c1();
            c2();
          };
        },
      );

      const listEl = $("#todo-container", container)!;
      expect(listEl.children.length).toBe(2);
      expect(listEl.children[1].classList.contains("done")).toBe(true);

      // Update item
      todos([
        { id: 1, text: "Learn NAF", done: true },
        { id: 2, text: "Build app", done: true },
      ]);

      expect(listEl.children[0].classList.contains("done")).toBe(true);
    });
  });
});
