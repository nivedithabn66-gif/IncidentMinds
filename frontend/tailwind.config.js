/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sre: {
          bg: "#090d16",
          card: "#111827",
          border: "#1f293d",
          accent: "#3b82f6",
          purple: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
        }
      }
    },
  },
  plugins: [],
}
