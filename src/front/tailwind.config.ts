import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sigac: {
          nav: '#1b3266',
          accent: '#2f6ce6',
          'accent-hover': '#2563eb',
          primary: '#1b3266',
          'primary-light': '#2f6ce6',
          dark: '#152a52',
          muted: '#64748b',
          bg: '#f1f5f9',
          card: '#ffffff',
          border: '#e2e8f0',
          // tons suaves adicionais para dashboards mais coloridos
          'accent-soft': '#e0edff',
          'accent-soft-2': '#fdf2ff',
          success: '#10b981',
          warning: '#f59e0b',
          info: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
export default config;
