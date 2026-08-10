export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07070a",
          900: "#0c0c11",
          850: "#111117",
          800: "#16161d",
          700: "#1f1f28",
          600: "#2a2a35"
        },
        accent: {
          red: "#e53a4d",
          orange: "#f2874a",
          purple: "#9b6bf2",
          blue: "#4a8ef2",
          yellow: "#f2c14a"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(242,135,74,0.45)",
        card: "0 8px 30px -12px rgba(0,0,0,0.6)"
      },
      backdropBlur: { xs: "2px" },
      borderRadius: { '2xl': "1.25rem", '3xl': "1.75rem" }
    }
  },
  plugins: []
};
