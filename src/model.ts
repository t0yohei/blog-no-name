import type { CollectionEntry } from 'astro:content';
import type { LiveDataEntry } from 'astro';
import type { Item as FeedItem } from '@ascorbic/feed-loader';
import type { QiitaArticle } from './lib/qiita-live-loader';

export type Post = CollectionEntry<'blogs'>
  | (LiveDataEntry<FeedItem> & { collection: 'slides' | 'zenns' | 'devTos'; body?: string })
  | (LiveDataEntry<QiitaArticle> & { collection: 'qiitas'; body?: string });

export const parseDate = (post: Post) => {
  return 'pubdate' in post.data
    ? post.data.pubdate
    : 'created_at' in post.data
      ? post.data.created_at
      : post.data.published;
};

export const parseDescription = (post: Post) => {
  if (post.collection === 'blogs' && post.data.description) return post.data.description;
  // This feed excerpt starts with an advisory rather than the comparison's purpose.
  if (post.collection === 'zenns' && post.id === 'https://zenn.dev/t0yohei/articles/5aecc668e4e9c6') {
    return 'Mac上でfaster-whisperとmlx-whisperの処理速度・認識精度を比較。';
  }

  const source =
    post.collection === 'blogs'
      ? post.body
      : 'body' in post.data
        ? post.data.body
        : 'description' in post.data
          ? post.data.description
          : post.body;

  const text = (source ?? '')
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/`+([^`]+)`+/g, '$1')
    .replace(/(\*\*|__|~~)(.*?)\1/g, '$2')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/(?<![\p{L}\p{N}])_([^_\n]+)_(?![\p{L}\p{N}])/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > 160 ? `${text.slice(0, 160)}…` : text || post.data.title;
};
