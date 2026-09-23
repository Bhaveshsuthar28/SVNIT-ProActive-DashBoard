/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "#F7F9FC",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#10213F",
        },
        border: "#E6EAF0",
        foreground: {
          DEFAULT: "#10213F",
          secondary: "#667085",
          muted: "#98A2B3",
        },
        astra: {
          blue: {
            DEFAULT: "#1677FF",
            light: "#EAF3FF",
            border: "#BAE0FF",
            dark: "#0958D9",
          },
          green: {
            DEFAULT: "#18B979",
            light: "#EAFBF4",
            border: "#A3F0CD",
            dark: "#0E8A57",
          },
          red: {
            DEFAULT: "#FF4D5A",
            light: "#FFF0F1",
            border: "#FFCCD0",
            dark: "#CF1322",
          },
          orange: {
            DEFAULT: "#F79009",
            light: "#FFF6E8",
            border: "#FEDF89",
            dark: "#B54708",
          },
          purple: {
            DEFAULT: "#7A5AF8",
            light: "#F3F0FF",
            border: "#D8CEFD",
            dark: "#5925DC",
          },
          cyan: {
            DEFAULT: "#13B8C8",
            light: "#ECFBFD",
            border: "#A1EEF6",
            dark: "#0E8794",
          },
        }
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '0.875rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 33, 63, 0.04), 0 1px 2px -1px rgba(16, 33, 63, 0.04)',
        'panel': '0 4px 6px -1px rgba(16, 33, 63, 0.06), 0 2px 4px -2px rgba(16, 33, 63, 0.04)',
      }
    },
  },
  plugins: [],
}
