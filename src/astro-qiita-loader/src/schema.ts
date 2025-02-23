import { z } from 'astro:content';

export const PostSchema = z.object({
  rendered_body: z.string().nullable(),
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
      versions: z.array(z.string()).nullable(),
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
  organization_url_name: z.string().nullable().optional(),
  slide: z.boolean(),
});
