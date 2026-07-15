import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        "paper-dim": "rgb(var(--color-paper-dim) / <alpha-value>)",
        "paper-deep": "rgb(var(--color-paper-deep) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        paprika: {
          DEFAULT: "rgb(var(--color-paprika) / <alpha-value>)",
          dark: "rgb(var(--color-paprika-dark) / <alpha-value>)",
          light: "rgb(var(--color-paprika-light) / <alpha-value>)",
        },
        sage: {
          DEFAULT: "#5F7A52",
          dark: "#465C3B",
          light: "#8DA87E",
        },
        amber: {
          DEFAULT: "#D99A32",
          dark: "#B37A1E",
        },
        plum: {
          DEFAULT: "#8B3A56",
          dark: "#6B2B42",
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-worksans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plexmono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ticket: "0 1px 0 rgba(36,26,20,0.06), 0 12px 30px -12px rgba(36,26,20,0.22)",
        stamp: "0 0 0 3px rgba(193,72,29,0.12)",
      },
      backgroundImage: {
        grain: "radial-gradient(rgba(36,26,20,0.045) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "3px 3px",
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(1.4) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(0.94) rotate(-2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-2deg)", opacity: "1" },
        },
        "print-in": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        stamp: "stamp 0.5s cubic-bezier(.2,1.6,.4,1) forwards",
        "print-in": "print-in 0.4s ease-out forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
