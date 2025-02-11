import { defineConfig } from 'astro/config';

// https://astro.build/config
import vue from '@astrojs/vue';

// https://astro.build/config
import netlify from '@astrojs/netlify';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  integrations: [vue(), icon()],
  output: 'server',
  adapter: netlify(),
});