// tailwind.config.js
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          // Light mode colors
          primary: {
            50: '#e6f1ff',
            100: '#cce3ff',
            200: '#99c7ff',
            300: '#66aaff',
            400: '#338eff',
            500: '#0071fe',
            600: '#005bca',
            700: '#004397',
            800: '#002c63',
            900: '#001630',
          },
          // Custom neutral palette for better contrast
          "light-text": {
            primary: '#1a1a1a',
            secondary: '#4a4a4a',
            tertiary: '#717171',
          },
          "light-bg": {
            primary: '#ffffff',
            secondary: '#f5f7fa',
            tertiary: '#e9ecef',
          },
          // Dark mode colors
          "dark-text": {
            primary: '#f0f0f0',
            secondary: '#c0c0c0',
            tertiary: '#909090',
          },
          "dark-bg": {
            primary: '#121212',
            secondary: '#1e1e1e',
            tertiary: '#2a2a2a',
          },
        },
        boxShadow: {
          'light': '0 2px 5px 0 rgba(0, 0, 0, 0.05)',
          'light-md': '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
          'dark': '0 2px 5px 0 rgba(0, 0, 0, 0.3)',
          'dark-md': '0 4px 8px 0 rgba(0, 0, 0, 0.4)',
        },
        fontFamily: {
          sans: ['Roboto', 'system-ui', 'sans-serif'],
          mono: ['Roboto Mono', 'monospace'],
        },
      },
    },
    plugins: [],
  };