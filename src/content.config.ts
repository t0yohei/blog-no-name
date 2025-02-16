// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { feedLoader } from '@ascorbic/feed-loader';

// 2. Define your collection(s)
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
  loader: async () => {
    const response = await fetch('https://qiita.com/api/v2/users/t0yohei/items');
    const data = await response.json();
    return data.map((entry: any) => ({
      id: entry.id,
      ...entry,
    }));
  },
  schema: z.object({
    rendered_body: z.string(),
    body: z.string(),
    coediting: z.boolean(),
    comments_count: z.number(),
    created_at: z.string(),
    group: z
      .object({
        created_at: z.string(),
        description: z.string(),
        name: z.string(),
        private: z.boolean(),
        updated_at: z.string(),
        url_name: z.string(),
      })
      .nullable(),
    id: z.string(),
    likes_count: z.number(),
    private: z.boolean(),
    reactions_count: z.number(),
    stocks_count: z.number(),
    tags: z.array(
      z.object({
        name: z.string(),
        versions: z.array(z.string()),
      }),
    ),
    title: z.string(),
    updated_at: z.string(),
    url: z.string(),
    user: z.object({
      description: z.string().nullable(),
      facebook_id: z.string(),
      followees_count: z.number(),
      followers_count: z.number(),
      github_login_name: z.string(),
      id: z.string(),
      items_count: z.number(),
      linkedin_id: z.string(),
      location: z.string(),
      name: z.string(),
      organization: z.string(),
      permanent_id: z.number(),
      profile_image_url: z.string(),
      team_only: z.boolean(),
      twitter_screen_name: z.string(),
      website_url: z.string(),
    }),
    page_views_count: z.number().nullable(),
    team_membership: z
      .object({
        name: z.string(),
      })
      .nullable(),
    organization_url_name: z.string().nullable(),
    slide: z.boolean(),
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
