import { createServer } from 'node:http';
import { once } from 'node:events';

const hosts = new Set(['qiita.com', 'zenn.dev', 'dev.to', 'speakerdeck.com', 't0yohei.github.io']);

// Preloaded only into the test server; the application keeps its production URLs.
if (process.env.TEST_FEED_ORIGIN) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    return originalFetch(hosts.has(url.hostname)
      ? `${process.env.TEST_FEED_ORIGIN}/${url.hostname}${url.pathname}${url.search}`
      : input, options);
  };
}

export async function startExternalFeeds() {
  const state = { title: 'Qiita runtime article', status: 200, requests: [] };
  const server = createServer((request, response) => {
    state.requests.push(request.url);
    if (request.url.startsWith('/qiita.com/')) {
      response.writeHead(state.status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify([{
        id: 'runtime-article', title: state.title, body: 'Runtime article description',
        url: 'https://qiita.com/t0yohei/items/runtime-article', created_at: '2026-10-16T00:00:00Z',
        updated_at: '2026-10-16T00:00:00Z', rendered_body: '<p>Runtime article description</p>',
        coediting: false, comments_count: 0, group: null, likes_count: 0, private: false,
        reactions_count: 0, stocks_count: 0, tags: [], page_views_count: null,
        team_membership: null, organization_url_name: null, slide: false,
        user: {
          id: 't0yohei', name: 'Test user', permanent_id: 1, profile_image_url: 'https://example.com/avatar.png',
          description: null, facebook_id: null, followees_count: 0, followers_count: 0,
          github_login_name: null, items_count: 1, linkedin_id: null, location: null,
          organization: null, team_only: false, twitter_screen_name: null, website_url: null,
        },
      }]));
    } else {
      const host = request.url.split('/')[1];
      const articleUrl = host === 'zenn.dev'
        ? 'https://zenn.dev/t0yohei/articles/5aecc668e4e9c6'
        : host === 't0yohei.github.io'
        ? 'https://t0yohei.github.io/slides/rails-omae-datta-no-ka/'
        : `https://${host}/runtime-article`;
      response.writeHead(200, { 'Content-Type': 'application/rss+xml' });
      response.end(`<?xml version="1.0"?><rss version="2.0"><channel>
        <title>${host}</title><link>https://${host}/</link><description>Test feed</description>
        <item><guid>${articleUrl}</guid><title>${host} runtime article</title>
        <link>${articleUrl}</link><description>Feed description</description>
        <pubDate>Thu, 15 Oct 2026 00:00:00 GMT</pubDate></item>
        </channel></rss>`);
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    state,
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}
