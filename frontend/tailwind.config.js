/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      /* ------------------------------------------------------------------ */
      /* FONTS */
      /* ------------------------------------------------------------------ */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Public Sans", "sans-serif"],
      },

      /* ------------------------------------------------------------------ */
      /* CORES — DESIGN SYSTEM BV + COMPATIBILIDADE LOGIN */
      /* ------------------------------------------------------------------ */
      colors: {
        /* ===== COMPATIBILIDADE LOGIN NOIR ===== */
        primary: "#7f13ec",
        "primary-vibrant": "#a855f7",
        "dark-bg": "#08040d",
        "charcoal-purple": "#0d0616",
        "deep-purple-card": "#1a0b2e",

        /* ===== SUPERADMIN ===== */
        "sa-primary": "var(--sa-primary)",
        "sa-primary-dark": "var(--sa-primary-dark)",
        "sa-primary-deep": "var(--sa-primary-deep)",
        "sa-primary-light": "var(--sa-primary-light)",
        "sa-primary-lighter": "var(--sa-primary-lighter)",

        "sa-neutral-100": "var(--sa-neutral-100)",
        "sa-neutral-200": "var(--sa-neutral-200)",
        "sa-neutral-700": "var(--sa-neutral-700)",
        "sa-neutral-900": "var(--sa-neutral-900)",

        /* ===== CLIENT / BALCÃO VIRTUAL ===== */
        "bv-primary": "#583080",
        "bv-primary-soft": "#6d3ea1",
        "bv-primary-light": "#804CDC",
        "bv-primary-lighter": "#E3D7FF",

        "bv-background-light": "#f7f6f8",
        "bv-background-dark": "#18141e",
        "bv-card-border": "#eceaf0",
        "bv-text-main": "#1F2937",
        "bv-text-muted": "#6B7280",

        "bv-success-bg": "#dcfce7",
        "bv-success-text": "#15803d",

        "bv-closed-bg": "#f3f4f6",
        "bv-closed-text": "#6b7280",

        /* ===== SEMÂNTICAS ===== */
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#8b5cf6",
      },

      /* ------------------------------------------------------------------ */
      /* SHADOWS */
      /* ------------------------------------------------------------------ */
      boxShadow: {
        soft: "0 2px 4px rgba(0,0,0,0.06)",
        smooth: "0 4px 10px rgba(0,0,0,0.10)",
        card: "0 3px 14px rgba(0,0,0,0.08)",
        elevated: "0 6px 20px rgba(0,0,0,0.12)",

        "bv-card": "0 2px 8px rgba(0,0,0,0.05)",
        "bv-card-hover": "0 6px 18px rgba(0,0,0,0.10)",

        /* glow login */
        "neon-purple": "0 0 20px rgba(168, 85, 247, 0.6)",
      },

      /* ------------------------------------------------------------------ */
      /* BORDER RADIUS */
      /* ------------------------------------------------------------------ */
      borderRadius: {
        soft: "8px",
        card: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",

        "bv": "12px",
        "bv-lg": "16px",
      },

      /* ------------------------------------------------------------------ */
      /* GRADIENTES */
      /* ------------------------------------------------------------------ */
      backgroundImage: {
        /* SUPERADMIN */
        "sa-gradient":
          "linear-gradient(135deg, var(--sa-primary) 0%, var(--sa-primary-dark) 50%, var(--sa-primary-deep) 100%)",

        "sa-gradient-light":
          "linear-gradient(135deg, var(--sa-primary-light), var(--sa-primary))",

        /* BALCÃO VIRTUAL */
        "bv-gradient":
          "linear-gradient(135deg, #804CDC 0%, #583080 50%, #090037 100%)",

        "bv-gradient-light":
          "linear-gradient(135deg, #E3D7FF 0%, #804CDC 100%)",

        /* LOGIN NOIR */
        "login-noir":
          "radial-gradient(circle at 30% 50%, #150826 0%, #08040d 100%)",
      },

      /* ------------------------------------------------------------------ */
      /* ANIMAÇÕES */
      /* ------------------------------------------------------------------ */
      transitionDuration: {
        200: "200ms",
        300: "300ms",
      },

      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [require("@tailwindcss/forms")],
};