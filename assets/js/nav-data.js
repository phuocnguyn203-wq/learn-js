/* Shared navigation tree for the whole site. Loaded as a plain <script> tag
   (not fetch) so it also works when the site is opened directly via file://. */
const NAV_DATA = [
  {
    section: "Getting Started",
    items: [
      { title: "Introduction & Setup", file: "01-introduction.html" },
      { title: "Types, Values & Variables", file: "02-types-values-variables.html" },
    ],
  },
  {
    section: "Core Language",
    items: [
      { title: "Expressions & Operators", file: "03-expressions-operators.html" },
      { title: "Statements", file: "04-statements.html" },
      { title: "Objects", file: "05-objects.html" },
      { title: "Arrays", file: "06-arrays.html" },
      { title: "Functions & Closures", file: "07-functions.html" },
      { title: "Classes", file: "08-classes.html" },
      { title: "Modules", file: "09-modules.html" },
    ],
  },
  {
    section: "Standard Library",
    items: [
      { title: "Collections & Typed Arrays", file: "10-collections-typed-arrays.html" },
      { title: "Regular Expressions", file: "11-regular-expressions.html" },
      { title: "Dates, JSON, Intl & Utilities", file: "12-dates-json-intl-utilities.html" },
    ],
  },
  {
    section: "Advanced Concepts",
    items: [
      { title: "Iterators & Generators", file: "13-iterators-generators.html" },
      { title: "Asynchronous JavaScript", file: "14-async-javascript.html" },
      { title: "Metaprogramming", file: "15-metaprogramming.html" },
    ],
  },
  {
    section: "JavaScript in the Browser",
    items: [
      { title: "Web Basics & Events", file: "16-web-basics-events.html" },
      { title: "DOM & CSS Scripting", file: "17-dom-css-scripting.html" },
      { title: "Components & Graphics", file: "18-components-graphics.html" },
      { title: "Navigation & Networking", file: "19-navigation-networking.html" },
      { title: "Storage & Workers", file: "20-storage-workers.html" },
    ],
  },
  {
    section: "Server-Side JavaScript",
    items: [{ title: "Node.js", file: "21-nodejs.html" }],
  },
  {
    section: "Tooling & Ecosystem",
    items: [{ title: "Tools & Extensions", file: "22-tools-extensions.html" }],
  },
];
