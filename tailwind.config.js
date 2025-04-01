// tailwind.config.js
import { fontFamily } from "tailwindcss/defaultTheme"
import { tailwindcssAnimate  } from "tailwindcss-animate"
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Ensure this covers all files using Tailwind classes
  ],
  darkMode: 'class',
  theme: {
    container: { // Optional: Add container settings
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shadcn UI color definitions using HSL variables from globals.css
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Add shades if needed, referencing your CSS vars
          // '50': 'hsl(var(--primary-50))', // Example if you defined --primary-50 with HSL
          // ...
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Your custom color palette (Keep if needed, but prefer using semantic names above)
        // 'primary-old': { /* Keep your HEX/RGB if absolutely needed */
        //   50: '#e6f0ff', ...
        // },
         gold: '#e1bc36',

        // Remove generic text/bg definitions if covered by shadcn vars
        // text: { ... },
        // bg: { ... },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Keep your custom 'card' radius if different from lg
        'card': '1rem',
      },
      fontFamily: {
        // Reference the CSS variable defined in globals.css
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: { // Example additions for shadcn/ui animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: { // Example additions for shadcn/ui animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate ],
}

export default config