// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { feedLoader } from '@ascorbic/feed-loader';
import { qiitaLoader } from './loader';

const blogs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubdate: z.coerce.date(),
  }),
});

const slides = defineCollection({
  loader: feedLoader({
    url: 'https://speakerdeck.com/t0yohei.rss',
  }),
});

const qiitas = defineCollection({
  loader: qiitaLoader({
    url: 'https://qiita.com/api/v2/users/t0yohei/itemss',
  }),
});

const zenns = defineCollection({
  loader: feedLoader({
    url: 'https://zenn.dev/t0yohei/feed',
  }),
});

const devTos = defineCollection({
  loader: feedLoader({
    url: 'https://dev.to/feed/t0yohei',
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  blogs,
  slides,
  qiitas,
  zenns,
  devTos,
};
