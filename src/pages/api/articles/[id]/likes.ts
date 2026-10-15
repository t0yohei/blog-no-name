import { randomUUID } from 'node:crypto';
import { getEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { getArticleLikes, setArticleLike } from '../../../../lib/article-likes';

const cookieName = 'article_like_browser';
const validBrowserId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ALL: APIRoute = async ({ request, params, cookies }) => {
  const headers = { 'Cache-Control': 'private, no-store' };
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  const method = request.method;
  if (!['GET', 'PUT', 'DELETE'].includes(method)) {
    return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, PUT, DELETE' } });
  }
  if (method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin) {
    return json({ error: 'このサイトから操作してください。' }, 403);
  }
  const id = params.id;
  if (!id || !(await getEntry('blogs', id))) return json({ error: '記事が見つかりません。' }, 404);

  let browserId = cookies.get(cookieName)?.value;
  if (!browserId || !validBrowserId.test(browserId)) {
    if (method !== 'GET') return json({ error: 'Cookieを有効にして、ページを再読み込みしてください。' }, 400);
    browserId = randomUUID();
    cookies.set(cookieName, browserId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: new URL(request.url).protocol === 'https:',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    return json(method === 'GET'
      ? await getArticleLikes(id, browserId)
      : await setArticleLike(id, browserId, method === 'PUT'));
  } catch (error) {
    console.error('Article likes unavailable:', error instanceof Error ? error.name : 'UnknownError');
    return json({ error: 'イイねを保存・取得できませんでした。もう一度お試しください。' }, 503);
  }
};
