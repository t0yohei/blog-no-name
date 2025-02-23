import { type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blogs' | 'slides' | 'qiitas' | 'zenns' | 'devTos'>;

export const parseDate = (post: Post) => {
  return 'pubdate' in post.data ? post.data.pubdate : 'created_at' in post.data ? post.data.created_at : null;
};

export const parseDescription = (post: Post) => {
  if ('body' in post.data) {
    return post.data.body;
  }
  if ('description' in post.data) {
    return post.data.description;
  }
  return post.body || null;
};
