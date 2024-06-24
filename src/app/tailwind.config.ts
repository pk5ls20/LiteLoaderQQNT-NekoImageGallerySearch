import { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
};

export default config;
