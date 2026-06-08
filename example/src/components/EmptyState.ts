import { template, Component } from "../../../naf";
import { Filter } from "./types";
import { Card } from "./Card";

export function EmptyState(props: { filter: Filter }): Component {
  const messages: Record<Filter, string> = {
    all: "No todos yet! Add one above to get started.",
    active: "No active todos! All done!",
    completed: "No completed todos yet. Keep working!",
  };

  return Card({
    className: "empty-state",
    children: /*html*/ `
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>${messages[props.filter]}</p>
      </div>
    `,
  });
}
