import { Signal, template, $$, toggleClass, Component } from "../../../naf";
import { Filter } from "./types";
import { Card } from "./Card";

export function FilterButtons(props: {
  currentFilter: Signal<Filter>;
}): Component {
  return Card({
    children: template({
      root: ".filters",
      onMount(el) {
        const buttons = $$(el, "button");

        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const filterValue = btn.getAttribute("data-filter") as Filter;
            props.currentFilter(filterValue);
          });

          const filterValue = btn.getAttribute("data-filter");
          toggleClass(
            btn,
            "active",
            () => props.currentFilter() === filterValue,
          );
        });
      },
    }) /*html*/ `
      <div class="filters">
        <button class="secondary" data-filter="all">All</button>
        <button class="secondary" data-filter="active">Active</button>
        <button class="secondary" data-filter="completed">Completed</button>
      </div>
    `,
  });
}
