export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sc-bg":        "var(--sc-bg)",
        "sc-surface-1": "var(--sc-surface-1)",
        "sc-surface-2": "var(--sc-surface-2)",
        "sc-surface-3": "var(--sc-surface-3)",
        "sc-surface-4": "var(--sc-surface-4)",
        "sc-text":      "var(--sc-text)",
        "sc-text-muted":"var(--sc-text-muted)",
        "sc-primary":   "var(--sc-primary)",
        "sc-primary-hover": "var(--sc-primary-hover)",
      },
    },
  },
  plugins: [],
}
