/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FAF6ED',
          200: '#F4ECE0',
          300: '#EADBCB',
          400: '#DCC3AD',
          500: '#C7A88F',
          600: '#A98971',
          700: '#8A6D56',
          800: '#5F4938',
          900: '#3D2E23',
        },
        blush: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
          950: 'rgb(var(--accent-950) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
          950: 'rgb(var(--accent-950) / <alpha-value>)',
        },
        lavender: {
          50: '#FAF8FF',
          100: '#F3EDFD',
          200: '#E7DCFA',
          300: '#D5C2F6',
          400: '#BA9BF0',
          500: '#9E72E7',
          600: '#824FD6',
          700: '#6937B8',
          800: '#502891',
          900: '#381A6B',
        },
        cozydark: {
          950: '#0C0A0E', // True velvety obsidian background
          900: '#141218', // Deep warm charcoal primary surface
          850: '#1C1922', // Card & panel surface
          800: '#25212E', // Elevated cards, active pills, inputs
          750: '#312C3C', // Subtle borders
          700: '#3F394D', // Prominent borders & dividers
          650: '#524B63', // Hover states
          600: '#6C6381', // Subtle icons
          500: '#8E84A7', // Muted text
          400: '#B6ACD0', // Secondary readable text
          300: '#D6CDE9', // Primary body text
          200: '#EDE7F7', // Bright crisp text
          100: '#F7F4FC', // Pure highlight text
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'cozy': '0 4px 24px -2px rgba(220, 180, 190, 0.18)',
        'cozy-lg': '0 12px 36px -4px rgba(220, 180, 190, 0.25)',
        'cozy-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'cozy-dark-lg': '0 12px 36px -4px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'soft-glow': '0 0 25px rgba(246, 140, 174, 0.25)',
        'lavender-glow': '0 0 25px rgba(186, 155, 240, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
