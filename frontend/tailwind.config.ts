import type { Config } from 'tailwindcss';

// Tailwind kept lean — primary styling lives in src/index.css as a token system.
// Only utilities (spacing, flex, grid) are useful here. Theme colors removed to avoid drift.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
