/** @type {import('tailwindcss').Config} */

import { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

const colors = {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  backgroundSoft: 'hsl(var(--background-soft))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  success: {
    DEFAULT: 'hsl(var(--success-300))',
    foreground: 'hsl(var(--success-foreground))',
  },
  information: {
    DEFAULT: 'hsl(var(--information-300))',
    foreground: 'hsl(var(--information-foreground))',
  },
  warning: {
    DEFAULT: 'hsl(var(--warning-300))',
    foreground: 'hsl(var(--warning-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
};

const borderRadius = {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
};

const keyframes = {
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
  'spinners-react-dotted-shrink': {
    '50%': {
      transform: 'translate(0, 0)',
      opacity: '0',
    },
  },
  'area-draw-line': {
    '0%': {
      d: "path('M 0 100 C 40 80, 40 80, 80 90 C 120 100, 120 60, 160 80 C 200 70, 200 90, 200 90 L 200 100 L 0 100 Z')",
    },
    '50%': {
      d: "path('M 0 100 C 40 60, 40 60, 80 80 C 120 20, 120 20, 160 70 C 200 50, 200 50, 200 50 L 200 100 L 0 100 Z')",
    },
    '100%': {
      d: "path('M 0 100 C 40 80, 40 80, 80 90 C 120 100, 120 60, 160 80 C 200 70, 200 90, 200 90 L 200 100 L 0 100 Z')",
    },
  },
  'bar-height': {
    '0%, 100%': { height: '20%' },
    '50%': { height: '100%' },
  },
  marquee: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(-100%)' },
  },
};

const animation = {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'area-draw-line': 'area-draw-line 2s infinite ease-in-out',
  'bar-height': 'bar-height 1.2s infinite ease-in-out',
  marquee: 'marquee 30s linear infinite',
};

export const customTheme = {
  colors,
  borderRadius,
  keyframes,
  animation,
};

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      ...customTheme,
    },
  },
  plugins: [animatePlugin],
};

export default config;
