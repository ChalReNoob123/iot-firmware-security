import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#06090e",
          surface: "#0c111a",
          card: "#101726",
          cardHover: "#151f33",
          border: "rgba(56, 189, 248, 0.15)",
          cyan: "#00f5d4",
          violet: "#7b2cbf",
          purple: "#a855f7",
          rose: "#ff3366",
          amber: "#f59e0b",
          blue: "#38bdf8",
          emerald: "#10b981",
          muted: "#94a3b8"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-sweep": "scan 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate"
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" }
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 245, 212, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 245, 212, 0.6)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
