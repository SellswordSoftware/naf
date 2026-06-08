import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  signal,
  computed,
  effect,
  getReactiveDebugConfig,
  setReactiveDebug,
  untrack,
} from '../naf';

describe('Reactivity System', () => {
  afterEach(() => {
    setReactiveDebug(false);
  });

  describe('signal', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0);
      expect(count()).toBe(0);
    });

    it('should update signal value', () => {
      const count = signal(0);
      count(5);
      expect(count()).toBe(5);
    });

    it('should return the new value when setting', () => {
      const count = signal(0);
      const result = count(10);
      expect(result).toBe(10);
    });

    it('should work with different types', () => {
      const str = signal('hello');
      const bool = signal(true);
      const obj = signal({ x: 1 });
      const arr = signal([1, 2, 3]);

      expect(str()).toBe('hello');
      expect(bool()).toBe(true);
      expect(obj()).toEqual({ x: 1 });
      expect(arr()).toEqual([1, 2, 3]);
    });

    it('should handle null and undefined', () => {
      const nullSignal = signal(null);
      const undefinedSignal = signal(undefined);

      expect(nullSignal()).toBe(null);
      expect(undefinedSignal()).toBe(undefined);
    });
  });

  describe('computed', () => {
    it('should compute derived value', () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      expect(doubled()).toBe(4);
    });

    it('should update when dependency changes', () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      count(5);
      expect(doubled()).toBe(10);
    });

    it('should cache computed values', () => {
      const count = signal(1);
      const computeFn = vi.fn(() => count() * 2);
      const doubled = computed(computeFn);

      // First call should execute
      expect(doubled()).toBe(2);
      expect(computeFn).toHaveBeenCalledTimes(1);

      // Second call should use cache
      expect(doubled()).toBe(2);
      expect(computeFn).toHaveBeenCalledTimes(1);

      // After dependency changes, should recompute
      count(3);
      expect(doubled()).toBe(6);
      expect(computeFn).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple dependencies', () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a() + b());

      expect(sum()).toBe(5);

      a(10);
      expect(sum()).toBe(13);

      b(5);
      expect(sum()).toBe(15);
    });

    it('should handle chained computed values', () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);
      const quadrupled = computed(() => doubled() * 2);

      expect(quadrupled()).toBe(8);

      count(5);
      expect(quadrupled()).toBe(20);
    });

    it('should handle computed with complex logic', () => {
      const todos = signal([
        { id: 1, done: false },
        { id: 2, done: true },
        { id: 3, done: false },
      ]);

      const activeCount = computed(() => {
        return todos().filter(t => !t.done).length;
      });

      expect(activeCount()).toBe(2);

      todos([
        { id: 1, done: true },
        { id: 2, done: true },
        { id: 3, done: false },
      ]);

      expect(activeCount()).toBe(1);
    });
  });

  describe('effect', () => {
    it('should run immediately', () => {
      const fn = vi.fn();
      effect(fn);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should run when dependency changes', () => {
      const count = signal(0);
      const fn = vi.fn(() => count());

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(1);
      expect(fn).toHaveBeenCalledTimes(2);

      count(2);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should track multiple dependencies', () => {
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

    it('should return cleanup function', () => {
      const count = signal(0);
      const fn = vi.fn(() => count());

      const stop = effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(1);
      expect(fn).toHaveBeenCalledTimes(2);

      stop();

      count(2);
      expect(fn).toHaveBeenCalledTimes(2); // Should not run again
    });

    it('should work with computed dependencies', () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);
      const fn = vi.fn(() => doubled());

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      count(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle conditional dependencies', () => {
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

      // Changing 'a' should trigger effect
      a(10);
      expect(fn).toHaveBeenCalledTimes(2);

      // Changing 'b' should not trigger (not tracked)
      b(20);
      expect(fn).toHaveBeenCalledTimes(2);

      // Switch to 'b'
      showA(false);
      expect(fn).toHaveBeenCalledTimes(3);

      // Now 'b' changes should trigger
      b(30);
      expect(fn).toHaveBeenCalledTimes(4);

      // And 'a' changes should not
      a(100);
      expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should not run after cleanup', () => {
      const count = signal(0);
      let runCount = 0;

      const stop = effect(() => {
        count();
        runCount++;
      });

      expect(runCount).toBe(1);

      count(1);
      expect(runCount).toBe(2);

      stop();

      count(2);
      count(3);
      expect(runCount).toBe(2);
    });

    it('should handle nested effects', () => {
      const outer = signal(1);
      const inner = signal(2);
      const outerFn = vi.fn();
      const innerFn = vi.fn();

      effect(() => {
        outer();
        outerFn();
        effect(() => {
          inner();
          innerFn();
        });
      });

      expect(outerFn).toHaveBeenCalledTimes(1);
      expect(innerFn).toHaveBeenCalledTimes(1);

      inner(3);
      expect(innerFn).toHaveBeenCalledTimes(2);

      outer(2);
      expect(outerFn).toHaveBeenCalledTimes(2);
    });

    it('should handle effects that trigger other signals', () => {
      const a = signal(1);
      const b = signal(0);

      effect(() => {
        const val = a();
        b(val * 2);
      });

      expect(b()).toBe(2);

      a(5);
      expect(b()).toBe(10);
    });
  });

  describe('Integration', () => {
    it('should handle complex reactive graph', () => {
      const count = signal(1);
      const doubled = computed(() => count() * 2);
      const tripled = computed(() => count() * 3);
      const sum = computed(() => doubled() + tripled());

      expect(sum()).toBe(5); // 2 + 3

      count(2);
      expect(sum()).toBe(10); // 4 + 6

      count(10);
      expect(sum()).toBe(50); // 20 + 30
    });

    it('should propagate changes through multiple levels', () => {
      const base = signal(1);
      const level1 = computed(() => base() + 1);
      const level2 = computed(() => level1() + 1);
      const level3 = computed(() => level2() + 1);

      expect(level3()).toBe(4);

      base(10);
      expect(level3()).toBe(13);
    });

    it('should handle diamond dependency pattern', () => {
      const source = signal(1);
      const left = computed(() => source() * 2);
      const right = computed(() => source() * 3);
      const bottom = computed(() => left() + right());

      expect(bottom()).toBe(5); // 2 + 3

      source(2);
      expect(bottom()).toBe(10); // 4 + 6
    });

    it('should batch effect runs efficiently', () => {
      const a = signal(1);
      const b = signal(2);
      const fn = vi.fn(() => {
        return a() + b();
      });

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      // Note: NAF doesn't batch by default, so each change triggers
      a(10);
      expect(fn).toHaveBeenCalledTimes(2);

      b(20);
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('untrack', () => {
    it('should avoid tracking reads inside an effect', () => {
      const tracked = signal(1);
      const untrackedValue = signal(10);
      const fn = vi.fn(() => {
        tracked();
        untrack(() => untrackedValue());
      });

      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);

      untrackedValue(20);
      expect(fn).toHaveBeenCalledTimes(1);

      tracked(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('reactive debug', () => {
    it('should emit debug events through the configured sink', () => {
      const sink = vi.fn();
      setReactiveDebug({
        enabled: true,
        sink,
        include: ['count'],
      });

      const count = signal(0, { label: 'count' });
      const doubled = computed(() => count() * 2, { label: 'count:doubled' });

      expect(getReactiveDebugConfig().enabled).toBe(true);
      doubled();
      count(1);

      expect(sink).toHaveBeenCalled();
      expect(
        sink.mock.calls.some(([event]) => event.type === 'signal:get'),
      ).toBe(true);
      expect(
        sink.mock.calls.some(([event]) => event.type === 'computed:recompute'),
      ).toBe(true);
    });
  });
});
