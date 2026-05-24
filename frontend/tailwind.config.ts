import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        ink: '#111827',
        muted: '#5b6475',
        line: '#e5e7eb',
        soft: '#f1f5f9',
        brand: {
          DEFAULT: '#163b8f',
          dark: '#0f2a66',
          light: '#3b5fbf',
        },
        brand2: '#0f766e',
        brand3: '#7c3aed',
        risk: {
          low: '#15803d',
          lowBg: '#dcfce7',
          mod: '#b45309',
          modBg: '#fef3c7',
          high: '#c2410c',
          highBg: '#ffedd5',
          crit: '#b91c1c',
          critBg: '#fee2e2',
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, .04)',
        hero: '0 18px 45px rgba(15, 23, 42, .09)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '22px',
      },
    },
  },
  plugins: [],
};

export default config;
