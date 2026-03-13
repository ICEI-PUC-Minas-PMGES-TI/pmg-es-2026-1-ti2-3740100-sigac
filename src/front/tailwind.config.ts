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
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%, 100%': { backgroundPosition: '-200% 0' }, '50%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'card': '0 4px 20px -2px rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
