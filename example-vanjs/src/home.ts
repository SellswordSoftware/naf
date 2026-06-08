import van from "vanjs-core";
import { Nav } from "./nav";
import { styles } from "./styles";

const { div, h1, h2, p, ul, li, strong, a, style } = van.tags;

function Home() {
  return div(
    { class: "container" },
    Nav("home"),
    div(
      { class: "home" },
      h1("VanJS"),
      p({ class: "tagline" }, "A 1.0kB Reactive UI Framework"),

      div(
        { class: "card" },
        h2("What is VanJS?"),
        p(
          "VanJS is an ultra-lightweight, zero-dependency reactive UI framework. ",
          "It uses vanilla JavaScript with a simple, functional API.",
        ),
      ),

      div(
        { class: "card" },
        h2("Features"),
        ul(
          li(
            strong("Reactive State"),
            " - Fine-grained reactivity with van.state",
          ),
          li(
            strong("Derived State"),
            " - Automatic dependency tracking with van.derive",
          ),
          li(
            strong("DOM Building"),
            " - Functional tag helpers (div, span, etc.)",
          ),
          li(strong("Tiny Size"), " - ~1.0KB gzipped"),
          li(strong("No Build Step"), " - Works directly in the browser"),
          li(strong("TypeScript"), " - Full type support"),
        ),
      ),

      div(
        { class: "card" },
        h2("Philosophy"),
        p(
          "VanJS embraces simplicity and minimalism. No virtual DOM, no JSX, no build step required. ",
          "Just vanilla JavaScript with reactive state management.",
        ),
      ),

      div(
        { class: "card" },
        h2("Try It"),
        p(
          "Check out the ",
          a({ href: "todo/" }, "Todo App"),
          " to see VanJS in action.",
        ),
      ),
    ),
  );
}

// Mount
document.head.appendChild(style(styles));
van.add(document.body, Home());
