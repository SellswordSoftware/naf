import van from "vanjs-core";

const { nav, a } = van.tags;

export function Nav(activePage: "home" | "todo") {
  return nav(
    { class: "main-nav" },
    a({ href: "", class: activePage === "home" ? "active" : "" }, "Home"),
    a({ href: "todo/", class: activePage === "todo" ? "active" : "" }, "Todos")
  );
}
