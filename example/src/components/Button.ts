import { Computed, template, attr, Component } from "../../../naf";

export function Button(props: {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: Computed<boolean>;
}): Component {
  return template({
    root: "button",
    onMount(el) {
      el.addEventListener("click", props.onClick);
      if (props.disabled) attr(el, "disabled", props.disabled);
    },
  }) /*html*/ `
    <button class="${props.className || ""}">${props.text}</button>
  `;
}
