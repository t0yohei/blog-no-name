import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const blogs = await getCollection('blogs');
  const paths = ['/', '/about', '/app', ...blogs.map((entry) => `/blogs/${entry.id}`)];
  const urls = paths.map((path) => {
    const url = new URL(path, site).href.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<url><loc>${url}</loc></url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
