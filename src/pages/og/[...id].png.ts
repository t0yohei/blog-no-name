import { Buffer } from 'node:buffer';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import fontUrl from '../../assets/fonts/BIZUDPGothic-Bold.ttf?inline';
import { createOgImage } from '../../og-image';

export const prerender = true;

export const getStaticPaths = (async () => {
  const blogs = await getCollection('blogs');
  return blogs.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

const font = Buffer.from(fontUrl.split(',')[1], 'base64');

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as CollectionEntry<'blogs'>;
  const image = await createOgImage(entry.data.title, font);
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } });
};
