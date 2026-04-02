export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable manual dark mode via class
  theme: {
    extend: {
      colors: {
        primary: {
          dark: 'var(--color-primary-dark)',
          darker: 'var(--color-primary-darker)',
          light: 'var(--color-primary-light)',
        },
        accent: {
          green: 'var(--color-accent-green)',
          orange: 'var(--color-accent-orange)',
          blue: 'var(--color-accent-blue)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
