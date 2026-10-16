import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { NetlifyDB } from '@netlify/database-dev';
import { startExternalFeeds } from './helpers/external-feeds.mjs';

const baseUrl = 'http://127.0.0.1:4322';
let server;
let serverLog = '';
const database = new NetlifyDB({ logger() {} });
let databaseRunning = false;
let externalFeeds;

before(async () => {
  externalFeeds = await startExternalFeeds();
  const connectionString = await database.start();
  databaseRunning = true;
  await database.applyMigrations(new URL('../netlify/database/migrations/', import.meta.url).pathname);
  server = spawn(process.execPath, [
    '--import', new URL('./helpers/external-feeds.mjs', import.meta.url).pathname,
    'node_modules/.bin/astro',
    'dev',
    '--host',
    '127.0.0.1',
    '--port',
    '4322',
    '--ignore-lock',
  ], { env: { ...process.env, TEST_FEED_ORIGIN: externalFeeds.origin, NETLIFY_DEV: 'true', NETLIFY_DB_URL: connectionString, NETLIFY_DB_DRIVER: 'server' } });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => {
      serverLog = (serverLog + chunk).slice(-10000);
    });
  }

  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Astro exited before startup:\n${serverLog}`);
    }
    try {
      await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
      return;
    } catch {
      await setTimeout(250);
    }
  }
  throw new Error(`Astro did not start:\n${serverLog}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
  if (databaseRunning) await database.stop();
  if (externalFeeds) await externalFeeds.close();
});

test('external articles refresh at runtime without rebuilding, including RSS sources', async () => {
  externalFeeds.state.requests.length = 0;
  const initial = await (await fetch(baseUrl)).text();
  assert.ok(initial.includes('Qiita runtime article'));
  for (const host of ['zenn.dev', 'dev.to', 'speakerdeck.com', 't0yohei.github.io']) {
    assert.ok(initial.includes(`${host} runtime article`));
    assert.ok(externalFeeds.state.requests.some(path => path.startsWith(`/${host}/`)));
  }
  try {
    externalFeeds.state.title = 'Newly published Qiita article';
    const updated = await (await fetch(baseUrl)).text();
    assert.ok(updated.includes('Newly published Qiita article'));
    assert.ok(!updated.includes('Qiita runtime article'));
  } finally {
    externalFeeds.state.title = 'Qiita runtime article';
  }
});

test('upstream failures return an error instead of a cacheable incomplete index', async () => {
  try {
    externalFeeds.state.status = 503;
    const response = await fetch(baseUrl);
    assert.equal(response.status, 500);
    assert.doesNotMatch(response.headers.get('netlify-cdn-cache-control') ?? '', /max-age=86400/);
  } finally {
    externalFeeds.state.status = 200;
  }
  assert.equal((await fetch(baseUrl)).status, 200);
});

test('Slidev entries link directly to the public deck and display their source and publication date', async () => {
  const html = await (await fetch(baseUrl)).text();
  const cards = [...html.matchAll(/<li\b[^>]*class="link-card(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/li>/g)]
    .map(([, card]) => card)
    .filter(card => card.includes('https://t0yohei.github.io/slides/rails-omae-datta-no-ka/'));
  assert.equal(cards.length, 2, 'The deck appears in recent posts and the yearly archive');
  for (const card of cards) {
    assert.match(card, /href="https:\/\/t0yohei\.github\.io\/slides\/rails-omae-datta-no-ka\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
    assert.match(card, /class="source-label"[^>]*>\s*Slidev\s*<\/span>/);
    assert.match(card, /class="pub-date"[^>]*>\s*2026-10-15\s*<\/p>/);
  }
  assert.ok(externalFeeds.state.requests.includes('/t0yohei.github.io/slides/feed.xml'));
});

test('article likes persist, deduplicate concurrent retries, and can be removed', async () => {
  const endpoint = `${baseUrl}/api/articles/20261012/likes`;
  const initial = await fetch(endpoint);
  assert.equal(initial.status, 200, serverLog);
  assert.match(initial.headers.get('cache-control'), /private, no-store/);
  const setCookie = initial.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const cookie = setCookie.split(';')[0];
  assert.deepEqual(await initial.json(), { count: 0, liked: false });
  const headers = { cookie, origin: baseUrl };
  const update = (method, requestHeaders = headers) => fetch(endpoint, { method, headers: requestHeaders });

  const retries = await Promise.all(Array.from({ length: 8 }, () => update('PUT')));
  assert.ok(retries.every(response => response.status === 200));
  for (const response of retries) assert.deepEqual(await response.json(), { count: 1, liked: true });
  assert.deepEqual(await (await fetch(endpoint, { headers })).json(), { count: 1, liked: true });

  const other = await fetch(endpoint);
  const otherHeaders = { cookie: other.headers.get('set-cookie').split(';')[0], origin: baseUrl };
  assert.deepEqual(await other.json(), { count: 1, liked: false });
  assert.deepEqual(await (await update('PUT', otherHeaders)).json(), { count: 2, liked: true });

  const removals = await Promise.all(Array.from({ length: 4 }, () => update('DELETE')));
  for (const response of removals) assert.deepEqual(await response.json(), { count: 1, liked: false });
  assert.deepEqual(await (await fetch(endpoint, { headers: otherHeaders })).json(), { count: 1, liked: true });
  assert.deepEqual(await (await update('DELETE', otherHeaders)).json(), { count: 0, liked: false });
  const otherArticle = await fetch(`${baseUrl}/api/articles/20250216/likes`, { headers });
  assert.deepEqual(await otherArticle.json(), { count: 0, liked: false });
});

test('article likes reject unknown articles, unsupported methods, and cross-site writes', async () => {
  const endpoint = `${baseUrl}/api/articles/20261012/likes`;
  assert.equal((await fetch(`${baseUrl}/api/articles/no-such-article/likes`)).status, 404);
  const unsupported = await fetch(endpoint, { method: 'POST' });
  assert.equal(unsupported.status, 405);
  assert.equal(unsupported.headers.get('allow'), 'GET, PUT, DELETE');
  for (const method of ['PUT', 'DELETE']) {
    for (const origin of [undefined, 'https://other.example', 'null']) {
      assert.equal((await fetch(endpoint, { method, headers: origin ? { origin } : {} })).status, 403);
    }
    assert.equal((await fetch(endpoint, { method, headers: { origin: baseUrl } })).status, 400);
    assert.equal((await fetch(endpoint, {
      method, headers: { origin: baseUrl, cookie: 'article_like_browser=invalid' },
    })).status, 400);
  }
  const response = await fetch(endpoint, { headers: { cookie: 'article_like_browser=invalid' } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /article_like_browser=[0-9a-f-]+;/);
});

for (const [path, title, type] of [
  ['/', 'Blog No Name', 'website'],
  ['/about', 'About me', 'website'],
  ['/app', 'App', 'website'],
  ['/blogs/20250216', 'Qiita の Content Loader を作って全記事が取得できるようにした', 'article'],
]) {
  test(`${path} returns its own metadata and Japanese language`, async () => {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<html\b[^>]*\blang="ja"/);
    const charsetIndex = html.indexOf('charset="UTF-8"');
    assert.ok(charsetIndex >= 0 && charsetIndex < 1024, 'Encoding is declared before the inline theme script');
    assert.match(html, /<button\b[^>]*data-theme-trigger/);
    for (const preference of ['system', 'light', 'dark']) {
      assert.ok(html.includes(`data-theme-option="${preference}"`));
    }
    const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)[1];
    assert.match(header, /<a\b[^>]*class="site-name"[^>]*href="\/"[^>]*>\s*Blog No Name\s*<\/a>/);
    assert.match(header, /<nav\b[^>]*aria-label="メインナビゲーション"/);
    const currentHref = path.startsWith('/blogs/') ? '/' : path;
    const currentValue = type === 'article' ? 'location' : 'page';
    assert.match(header, new RegExp(`<a\\b[^>]*href="${currentHref}"[^>]*aria-current="${currentValue}"`));
    assert.equal((header.match(/aria-current=/g) ?? []).length, 1);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(html.includes(`<title>${title}</title>`));
    assert.ok(html.includes(`property="og:title" content="${title}"`));
    assert.ok(html.includes(`property="og:type" content="${type}"`));
    assert.ok(html.includes(`property="og:url" content="https://blog-no-name.com${path}"`));
    assert.ok(html.includes(`rel="canonical" href="https://blog-no-name.com${path}"`));
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
  });
}

for (const path of ['/blogs/no-such-blog-issue-37', '/no-such-page-issue-37']) {
  test(`${path} returns 404 with a link to the blog index`, async () => {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 404);
    assert.equal(response.redirected, false);
    const html = await response.text();
    assert.ok(html.includes('ページが見つかりません'));
    assert.match(html, /<a\b[^>]*href="\/"[^>]*>ブログ一覧に戻る<\/a>/);
    assert.doesNotMatch(html, /rel="canonical"/);
  });
}

test('canonical and OGP URLs omit queries and trailing slashes', async () => {
  for (const [path, canonicalPath] of [
    ['/?utm_source=test', '/'],
    ['/about/?utm_source=test', '/about'],
    ['/blogs/20261012/?utm_source=test', '/blogs/20261012'],
  ]) {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200);
    const html = await response.text();
    const url = `https://blog-no-name.com${canonicalPath}`;
    assert.ok(html.includes(`rel="canonical" href="${url}"`));
    assert.ok(html.includes(`property="og:url" content="${url}"`));
  }
});

test('article descriptions use an explicit summary or plain text from existing Markdown', async () => {
  const summary =
    '自分より賢い AI に課題解決を依頼する時、人間には何が必要なのか。コンテキスト、課題の提示、腹案、課題設定の役割を考える。';
  const article = await (await fetch(`${baseUrl}/blogs/20261012`)).text();
  assert.ok(article.includes(`name="description" content="${summary}"`));
  assert.ok(article.includes(`property="og:description" content="${summary}"`));
  const index = await (await fetch(baseUrl)).text();
  assert.ok(index.includes(`${summary.slice(0, 50)}...`));
  const sttCard = [...index.matchAll(/<li\b[^>]*class="link-card"[^>]*>([\s\S]*?)<\/li>/g)]
    .map(([, card]) => card)
    .find((card) => card.includes('https://zenn.dev/t0yohei/articles/5aecc668e4e9c6'));
  assert.ok(sttCard);
  assert.match(sttCard, /class="blog-body"[^>]*>Mac上でfaster-whisperとmlx-whisperの処理速度・認識精度を比較。<\/p>/);

  for (const id of ['20250216', '20230909', '20241224']) {
    const html = await (await fetch(`${baseUrl}/blogs/${id}`)).text();
    const description = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(description.length > 50);
    assert.doesNotMatch(description, /\]\(|https?:\/\/|&lt;|&#x3C;|##|`/);
    assert.ok(html.includes(`property="og:description" content="${description}"`));
  }
});

test('BlogPosting retains author metadata without displaying an author byline', async () => {
  const html = await (await fetch(`${baseUrl}/blogs/20261012`)).text();
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const data = JSON.parse(scripts[0][1]);
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'BlogPosting');
  assert.ok(html.includes(`<title>${data.headline}</title>`));
  assert.ok(html.includes(`name="description" content="${data.description}"`));
  assert.equal(data.datePublished, '2026-10-12T00:00:00.000Z');
  assert.equal(data.url, 'https://blog-no-name.com/blogs/20261012');
  assert.equal(data.mainEntityOfPage, data.url);
  assert.equal(data.image, 'https://blog-no-name.com/og/20261012.png');
  assert.ok(html.includes(`property="og:image" content="${data.image}"`));
  assert.equal(data.author['@type'], 'Person');
  assert.equal(data.author.name, 'とよへい(t0yohei)');
  assert.equal(data.author.url, 'https://blog-no-name.com/about');
  assert.doesNotMatch(html, /rel="author"|著者:/);
  assert.equal('dateModified' in data, false);
});

test('the index offers recent posts and a complete chronological yearly archive', async () => {
  const html = await (await fetch(baseUrl)).text();
  const recent = html.match(/<section\b[^>]*aria-labelledby="recent-heading"[^>]*>([\s\S]*?)<\/section>/)[1];
  const archive = html.match(/<section\b[^>]*aria-labelledby="archive-heading"[^>]*>([\s\S]*)/)[1];
  const cardsIn = (fragment) =>
    [...fragment.matchAll(/<li\b[^>]*class="link-card(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/li>/g)].map(([, card]) => {
      const [, href, attributes] = card.match(/<a\b[^>]*href="([^"]+)"([^>]*)>/);
      assert.match(card, /class="source-label"[^>]*>\s*(Blog|Qiita|Zenn|dev\.to|Speaker Deck|Slidev)\s*<\/span>/);
      if (href.startsWith('blogs/')) {
        assert.doesNotMatch(attributes, /target=/);
      } else {
        assert.match(attributes, /target="_blank"/);
        assert.match(attributes, /rel="noopener noreferrer"/);
      }
      return { href, date: card.match(/class="pub-date"[^>]*>\s*([^<]*)/)[1].trim() };
    });
  const recentCards = cardsIn(recent);
  const archiveCards = cardsIn(archive);
  assert.equal(recentCards.length, 6);
  assert.equal(new Set(archiveCards.map(({ href }) => href)).size, archiveCards.length);
  assert.deepEqual(recentCards, archiveCards.slice(0, 6));
  assert.match(recent, /<h3\b[^>]*class="card-title"/);
  assert.match(archive, /<h4\b[^>]*class="card-title"/);
  assert.equal((recent.match(/class="blog-body"/g) ?? []).length, 6);
  assert.doesNotMatch(archive, /class="blog-body"/);
  assert.match(archive, /class="archive-list"/);
  const files = await readdir(new URL('../src/content/blog/', import.meta.url));
  assert.deepEqual(
    archiveCards
      .filter(({ href }) => href.startsWith('blogs/'))
      .map(({ href }) => href)
      .toSorted(),
    files
      .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
      .map((file) => `blogs/${file.slice(0, -3)}`)
      .toSorted(),
  );
  const years = [...archive.matchAll(/<section\b[^>]*aria-labelledby="year-([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
  assert.ok(years.length > 0);
  const datedYears = years.map(([, year]) => year).filter((year) => year !== 'unknown');
  assert.deepEqual(datedYears, datedYears.toSorted().toReversed());
  for (const [, year, section] of years) {
    assert.ok(archive.includes(`href="#year-${year}"`));
    const cards = cardsIn(section);
    assert.ok(cards.length > 0);
    const dates = cards.map(({ date }) => date);
    assert.deepEqual(dates, dates.toSorted().toReversed());
    if (year !== 'unknown') assert.ok(dates.every((date) => date.startsWith(`${year}-`)));
  }
  assert.equal(years.flatMap(([, , section]) => cardsIn(section)).length, archiveCards.length);
});

test('articles reference their own PNG social images', async () => {
  const images = [];
  for (const id of ['20261012', '20230119', '20231104']) {
    const html = await (await fetch(`${baseUrl}/blogs/${id}`)).text();
    assert.ok(html.includes(`property="og:image" content="https://blog-no-name.com/og/${id}.png"`));
    assert.ok(html.includes('property="og:image:width" content="1200"'));
    assert.ok(html.includes('property="og:image:height" content="630"'));
    const response = await fetch(`${baseUrl}/og/${id}.png`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /image\/png/);
    const png = Buffer.from(await response.arrayBuffer());
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    images.push(png);
  }
  assert.notDeepEqual(images[0], images[1]);
  assert.notDeepEqual(images[1], images[2]);
  assert.equal((await fetch(`${baseUrl}/og/no-such-blog.png`)).status, 404);
});

test('sitemap lists all local articles and canonical pages, and robots.txt advertises it', async () => {
  const response = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const xml = await response.text();
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const files = await readdir(new URL('../src/content/blog/', import.meta.url));
  const expected = [
    '/',
    '/about',
    '/app',
    ...files
      .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
      .map((file) => `/blogs/${file.slice(0, -3)}`),
  ].map((path) => `https://blog-no-name.com${path}`);
  assert.deepEqual(urls.toSorted(), expected.toSorted());
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    const page = await fetch(new URL(new URL(url).pathname, baseUrl));
    assert.equal(page.status, 200, url);
    const html = await page.text();
    assert.ok(html.includes(`rel="canonical" href="${url}"`), url);
  }

  const robots = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/blog-no-name\.com\/sitemap\.xml/);
});

test('Astro articles link to related local articles with descriptive link text', async () => {
  for (const id of ['20230128', '20230909', '20241223', '20250216']) {
    const html = await (await fetch(`${baseUrl}/blogs/${id}`)).text();
    const related = html.match(/<h2[^>]*>関連記事<\/h2>([\s\S]*?)<\/ul>/);
    assert.ok(related, id);
    const links = [...related[1].matchAll(/<a href="(\/blogs\/[^"#]+)">([^<]+)<\/a>/g)];
    assert.ok(links.length > 0, id);
    for (const [, href, title] of links) {
      assert.notEqual(href, `/blogs/${id}`);
      const target = await fetch(new URL(href, baseUrl));
      assert.equal(target.status, 200, href);
      assert.ok((await target.text()).includes(`<title>${title}</title>`));
    }
  }
});

for (const [id, previousId, nextId] of [
  ['20230103_new_year', undefined, '20230104_start_working'],
  ['20230108_small_update', '20230108_add_webcomponents', '20230119'],
  ['20250213', '20241224', '20250216'],
  ['20261012', '20250216', undefined],
]) {
  test(`${id} shows chronological neighbors at the end of the article`, async () => {
    const response = await fetch(`${baseUrl}/blogs/${id}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>\s*<\/main>/);
    assert.ok(footer, 'Navigation belongs after the complete article content');
    assert.match(footer[1], /<nav\b[^>]*aria-label="前後の記事"/);
    assert.match(footer[1], /ブログ一覧に戻る/);
    for (const [rel, targetId] of [
      ['prev', previousId],
      ['next', nextId],
    ]) {
      const link = footer[1].match(new RegExp(`<a[^>]*href="([^"<>]+)"[^>]*rel="${rel}"[^>]*>([\\s\\S]*?)<\\/a>`));
      if (!targetId) {
        assert.equal(link, null, `No ${rel} link beyond the collection boundary`);
        continue;
      }
      assert.ok(link, rel);
      assert.equal(link[1], `/blogs/${targetId}`);
      const target = await fetch(new URL(link[1], baseUrl));
      assert.equal(target.status, 200);
      const targetHtml = await target.text();
      const title = targetHtml.match(/<title>([^<]+)<\/title>/)[1];
      assert.ok(link[2].includes(title), 'Neighbor title is shown without truncation');
      assert.match(link[2], /<time\b[^>]*datetime="[^"]+"[^>]*>\s*\d{4}-\d{2}-\d{2}\s*<\/time>/);
    }
  });
}

test('a database outage leaves articles readable and returns a retryable API error', async () => {
  await database.stop();
  databaseRunning = false;
  const response = await fetch(`${baseUrl}/api/articles/20261012/likes`);
  assert.equal(response.status, 503);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.deepEqual(await response.json(), { error: 'イイねを保存・取得できませんでした。もう一度お試しください。' });
  assert.equal((await fetch(`${baseUrl}/blogs/20261012`)).status, 200);
});
