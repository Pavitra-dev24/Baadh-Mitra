/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F1EDE1",
        ink: "#1F2420",
        slate: "#1B2A38",
        amber: "#D98E32",
        brick: "#B23A2E",
        teal: "#2F7A6B",
        watchblue: "#5B7A93",
        line: "#DBD4C1",
      },
      fontFamily: {
        display: ["'Roboto Slab'", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
