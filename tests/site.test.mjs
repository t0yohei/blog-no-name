import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

const baseUrl = 'http://127.0.0.1:4322';
let server;
let serverLog = '';

before(async () => {
  server = spawn(process.execPath, [
    'node_modules/.bin/astro',
    'dev',
    '--host',
    '127.0.0.1',
    '--port',
    '4322',
    '--ignore-lock',
  ]);
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
    assert.ok(html.includes(`<title>${title}</title>`));
    assert.ok(html.includes(`property="og:title" content="${title}"`));
    assert.ok(html.includes(`property="og:type" content="${type}"`));
    assert.ok(html.includes(`property="og:url" content="https://blog-no-name.com${path}"`));
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
  });
}
