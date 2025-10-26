// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import clerk from "@clerk/astro";
import { dark } from '@clerk/themes';
import { esMX } from '@clerk/localizations';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: netlify(),
  output: 'server',
  integrations: [react(), clerk({
    localization: esMX,
    appearance: {
      baseTheme: dark,
    }
  })]
});