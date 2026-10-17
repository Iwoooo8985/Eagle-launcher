/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          app: "var(--bg-app)",
          sidebar: "var(--bg-sidebar)",
          surface: "var(--bg-surface)",
          hover: "var(--bg-surface-hi)",
          input: "var(--bg-input)",
        },
        stroke: {
          subtle: "var(--border-subtle)",
          hover: "var(--border-hover)",
        },
        content: {
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
          base: "var(--text-base)",
          bright: "var(--text-bright)",
        },
        accent: {
          blue: "#0a84ff",
          blueHover: "#0071e3",
          blueActive: "#005bb5",
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      },
      aspectRatio: {
        'poster': '2 / 3',
      }
    },
  },
  plugins: [],
}