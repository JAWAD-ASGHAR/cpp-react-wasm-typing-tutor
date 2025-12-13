export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#323437',
          secondary: '#2c2e31',
          tertiary: '#262729',
        },
        text: {
          primary: '#d1d0c5',
          secondary: '#646669',
          tertiary: '#72757e',
        },
        accent: '#e2b714',
        correct: '#e2b714',
        incorrect: '#ca4754',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'blink': 'blink 1s infinite',
        'correct-pulse': 'correctPulse 0.3s ease-out',
        'incorrect-shake': 'incorrectShake 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0.4' },
        },
        correctPulse: {
          '0%': { backgroundColor: 'rgba(226, 183, 20, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        incorrectShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
}

