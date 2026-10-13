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
        void: {
          950: "#050507",
          900: "#08080A",
          850: "#0B0C0F",
          800: "#0D0E12",
          700: "#14151B",
          600: "#1C1D24"
        },
        zinc: {
          850: "#1F1F23",
          border: "#27272A"
        },
        neon: {
          cyan: "#00F0FF",
          amber: "#FFB800",
          crimson: "#FF3B30",
          emerald: "#10B981",
          purple: "#A855F7",
          blue: "#38BDF8"
        },
        cyber: {
          bg: "#08080A",
          surface: "#0D0E12",
          card: "#121318",
          cardHover: "#171821",
          border: "#27272A",
          cyan: "#00F0FF",
          violet: "#7b2cbf",
          purple: "#A855F7",
          rose: "#FF3B30",
          amber: "#FFB800",
          blue: "#38bdf8",
          emerald: "#10b981",
          muted: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px)",
        "void-gradient": "linear-gradient(180deg, #08080A 0%, #0D0E12 100%)",
        "hairline-gradient": "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-sweep": "scan 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "ticker": "ticker 25s linear infinite"
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" }
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 240, 255, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 240, 255, 0.6)" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
