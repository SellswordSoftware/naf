import { Computed, template, $, setText, Component } from "../../../naf";
import { Card } from "./Card";

export function Stats(props: {
  activeCount: Computed<number>;
  totalCount: Computed<number>;
}): Component {
  return Card({
    className: "stats",
    children: template({
      root: ".stats-content",
      onMount(el) {
        const activeEl = $<HTMLElement>(el, ".stat:first-child strong");
        const activeLabel = $<HTMLElement>(el, ".stat:first-child span");
        const totalEl = $<HTMLElement>(el, ".stat:last-child strong");

        setText(activeEl, props.activeCount);
        setText(activeLabel, () => {
          const active = props.activeCount();
          return active === 1 ? "task remaining" : "tasks remaining";
        });
        setText(totalEl, props.totalCount);
      },
    }) /*html*/ `
      <div class="stats-content">
        <div class="stat">
          <strong>0</strong>
          <span>tasks remaining</span>
        </div>
        <div class="stat">
          <strong>0</strong>
          <span>total</span>
        </div>
      </div>
    `,
  });
}
