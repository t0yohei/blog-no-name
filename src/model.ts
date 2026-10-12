import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blogs' | 'slides' | 'qiitas' | 'zenns' | 'devTos'>;

export const parseDate = (post: Post) => {
  return 'pubdate' in post.data
    ? post.data.pubdate
    : 'created_at' in post.data
      ? post.data.created_at
      : post.data.published;
};

export const parseDescription = (post: Post) => {
  if (post.collection === 'blogs') {
    if (post.data.description) return post.data.description;

    const text = (post.body ?? '')
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
  }
  if ('body' in post.data) {
    return post.data.body;
  }
  if ('description' in post.data) {
    return post.data.description;
  }
  return post.body || null;
};
