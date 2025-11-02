/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec6d13",
        "primary-hover": "#d8620f",
        secondary: "#fef3e9",
        background: "#FFFCF9",
        "text-primary": "#181411",
        "text-secondary": "#897261",
        "border-color": "#f4f2f0",
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
