/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(15, 23, 42, 0.06)",
        lift: "0 12px 40px rgba(79, 70, 229, 0.15)",
      },
    },
  },
  plugins: [],
};
