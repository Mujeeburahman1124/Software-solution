import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#3B82F6',
        light: '#F9FAFB',
      },
    },
  },
  plugins: [],
}
export default config
