/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        chalk: "rgb(var(--chalk-rgb) / <alpha-value>)",
        bone: "rgb(var(--bone-rgb) / <alpha-value>)",
        clay: "rgb(var(--clay-rgb) / <alpha-value>)",
        rust: "rgb(var(--rust-rgb) / <alpha-value>)",
        sage: "rgb(var(--sage-rgb) / <alpha-value>)",
      },
      fontFamily: {
        body: ["'DM Sans'", "sans-serif"],
        display: ["'Cormorant Garamond'", "serif"],
        mono: ["'DM Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
