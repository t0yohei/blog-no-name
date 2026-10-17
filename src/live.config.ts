import { defineLiveCollection } from 'astro:content';
import { liveFeedLoader } from '@ascorbic/feed-loader';
import { qiitaLiveLoader } from 'astro-qiita-loader/live';

const feed = (url: string) => defineLiveCollection({
  loader: liveFeedLoader({ url }),
});

export const collections = {
  slides: feed('https://speakerdeck.com/t0yohei.rss'),
  slidev: feed('https://t0yohei.github.io/slides/feed.xml'),
  qiitas: defineLiveCollection({
    loader: qiitaLiveLoader({
      url: 'https://qiita.com/api/v2/users/t0yohei/items',
      authToken: () => process.env.QIITA_AUTH_TOKEN,
    }),
  }),
  zenns: feed('https://zenn.dev/t0yohei/feed'),
  devTos: feed('https://dev.to/feed/t0yohei'),
};
