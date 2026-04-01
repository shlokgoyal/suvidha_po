/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "suvidha-orange": "#F26522",
        "suvidha-blue": "#1B3A9E",
        "surface": "#FFFFFF",
        "surface-variant": "#EFEFEF",
        "border-default": "#E0E0E0",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "text-disabled": "#ABABAB",
        "status-ordered": "#F59E0B",
        "status-ordered-bg": "#FEF3C7",
        "status-in-process": "#1B3A9E",
        "status-in-process-bg": "#DBEAFE",
        "status-completed": "#16A34A",
        "status-completed-bg": "#DCFCE7",
        "error": "#DC2626",
        "error-bg": "#FEE2E2",
        "success": "#16A34A",
        "success-bg": "#DCFCE7",
      },
    },
  },
  plugins: [],
};
