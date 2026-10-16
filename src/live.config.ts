import { defineLiveCollection } from 'astro:content';
import { liveFeedLoader } from '@ascorbic/feed-loader';
import { qiitaLiveLoader } from './lib/qiita-live-loader';

const feed = (url: string) => defineLiveCollection({
  loader: liveFeedLoader({ url }),
});

export const collections = {
  slides: feed('https://speakerdeck.com/t0yohei.rss'),
  qiitas: defineLiveCollection({
    loader: qiitaLiveLoader('https://qiita.com/api/v2/users/t0yohei/items'),
  }),
  zenns: feed('https://zenn.dev/t0yohei/feed'),
  devTos: feed('https://dev.to/feed/t0yohei'),
};
