import { defineConfig } from 'astro/config';

// https://astro.build/config
import vue from '@astrojs/vue';

// https://astro.build/config
import netlify from '@astrojs/netlify';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog-no-name.com',
  compressHTML: true,
  integrations: [vue(), icon()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  output: 'server',
  adapter: netlify(),
});
