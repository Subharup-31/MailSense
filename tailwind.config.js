/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        pixel: ['var(--font-pixel)', 'Courier Prime', 'Courier New', 'monospace'],
        ibm: ['var(--font-ibm)', 'IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#f9f9f9',
          100: '#efefef',
          200: '#e5e5e5',
          350: '#c5c5c5',
          400: '#9b9b9b',
          450: '#8c8c8c',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#2f2f2f',
          900: '#202020',
          950: '#191919',
        }
      },
      animation: {
        'marquee-left': 'marqueeLeft 28s linear infinite',
        'marquee-right': 'marqueeRight 22s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'word-reveal': 'word-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
