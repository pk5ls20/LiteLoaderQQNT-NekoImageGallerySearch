import { Config } from 'postcss';

const config: Config = {
  plugins: [require('tailwindcss'), require('autoprefixer')]
};

export default config;
