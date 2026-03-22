import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1117",
        panel: "#151926",
        line: "rgba(255,255,255,0.08)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.35)"
      },
      backgroundImage: {
        spotlight:
          "radial-gradient(circle at top, rgba(62,180,137,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(55,138,221,0.14), transparent 30%)"
      },
      animation: {
        ticker: "ticker 18s linear infinite",
        pulseSoft: "pulseSoft 2.1s ease-in-out infinite"
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" }
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.08)", opacity: "1" }
        }
      }
    }
  },
  plugins: [typography]
};

export default config;
