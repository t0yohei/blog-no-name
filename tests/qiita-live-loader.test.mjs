import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { qiitaLiveLoader } from '../src/lib/qiita-live-loader.ts';

afterEach(() => mock.restoreAll());

const article = id => ({
  id, title: `Article ${id}`, url: `https://qiita.com/t0yohei/items/${id}`,
  body: 'Article body', created_at: '2026-10-16T00:00:00Z',
});

test('Qiita loads every page and parses publication dates', async () => {
  const requests = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return Response.json(url.searchParams.get('page') === '1'
      ? Array.from({ length: 100 }, (_, index) => article(String(index)))
      : [article('last')]);
  });
  const { entries } = await qiitaLiveLoader('https://qiita.com/api/v2/users/t0yohei/items')
    .loadCollection({ collection: 'qiitas' });
  assert.equal(entries.length, 101);
  assert.equal(entries.at(-1).id, 'last');
  assert.equal(entries[0].data.created_at.toISOString(), '2026-10-16T00:00:00.000Z');
  assert.deepEqual(requests.map(({ url }) => url.searchParams.get('page')), ['1', '2']);
  assert.ok(requests.every(({ url }) => url.searchParams.get('per_page') === '100'));
});

test('Qiita reads authentication at request time and supports entry lookup', async () => {
  const originalToken = process.env.QIITA_AUTH_TOKEN;
  try {
    delete process.env.QIITA_AUTH_TOKEN;
    const loader = qiitaLiveLoader('https://qiita.com/api/v2/users/t0yohei/items');
    process.env.QIITA_AUTH_TOKEN = 'test-token';
    mock.method(globalThis, 'fetch', async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer test-token');
      return Response.json([article('found')]);
    });
    const entry = await loader.loadEntry({ collection: 'qiitas', filter: { id: 'found' } });
    assert.equal(entry.id, 'found');
  } finally {
    if (originalToken === undefined) delete process.env.QIITA_AUTH_TOKEN;
    else process.env.QIITA_AUTH_TOKEN = originalToken;
  }
});

test('Qiita failures and malformed data reject rather than returning an empty list', async () => {
  const loader = qiitaLiveLoader('https://qiita.com/api/v2/users/t0yohei/items');
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('', { status: 429 }));
  await assert.rejects(loader.loadCollection({ collection: 'qiitas' }), /429/);
  fetch.mock.mockImplementation(async () => Response.json([{ ...article('invalid'), created_at: 'invalid' }]));
  await assert.rejects(loader.loadCollection({ collection: 'qiitas' }));
});
