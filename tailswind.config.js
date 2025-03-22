// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Electric Blue
        primary: {
          50: '#e6f0ff',
          100: '#cce1ff',
          200: '#99c3ff',
          300: '#66a6ff',
          400: '#338eff',
          500: '#1a6aff', // Main Electric Blue
          600: '#0055e5',
          700: '#0040b8',
          800: '#00008b', // Navy accent
          900: '#00204d',
        },
        // Complementary colors per design spec
        black: '#000000',
        white: '#FFFFFF',
        gold: '#e1bc36',
        
        // Text colors for readability
        text: {
          primary: '#000000',
          secondary: '#4a4a4a',
          tertiary: '#717171',
        },
        // Background colors
        bg: {
          primary: '#ffffff',
          secondary: '#f5f7fa',
          tertiary: '#e9ecef',
        }
      },
      boxShadow: {
        'bubble': '0 8px 16px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.04)', // Subtle bubble shadow
        'button': '0 2px 4px rgba(0, 0, 0, 0.05)', // Soft shadow for buttons
      },
      borderRadius: {
        'card': '1rem', // Refined rounded corners for cards (16px)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Changed to Inter from Roboto
      },
      spacing: {
        // Consistent spacing scale
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};