import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDescription } from '../src/model.ts';

test('Markdown summaries keep readable text and technical identifiers', () => {
  const description = parseDescription({
    collection: 'blogs',
    data: { title: 'Example' },
    body: '## 見出し\n\n[Astro](https://astro.build) の **説明**。`foo_bar` と _強調_ と普通の snake_case。\n\n```js\nsecret_example()\n```\n<img src="image.png">\nhttps://example.com',
  });
  assert.equal(description, '見出し Astro の 説明。foo_bar と 強調 と普通の snake_case。');
});

test('an explicit summary takes precedence, and empty Markdown falls back to the title', () => {
  assert.equal(
    parseDescription({ collection: 'blogs', data: { title: 'Title', description: '要約' }, body: '本文' }),
    '要約',
  );
  assert.equal(parseDescription({ collection: 'blogs', data: { title: 'Title' }, body: '' }), 'Title');
});

test('external article descriptions retain their existing source', () => {
  assert.equal(parseDescription({ collection: 'qiitas', data: { body: 'Qiita 本文' } }), 'Qiita 本文');
  assert.equal(parseDescription({ collection: 'zenns', data: { description: 'Zenn 説明' } }), 'Zenn 説明');
});

test('external summaries remove Markdown and HTML before truncation', () => {
  assert.equal(
    parseDescription({
      collection: 'qiitas',
      data: {
        title: 'Qiita article',
        body: '## はじめに\n\n[Astro](https://astro.build) の **説明**。\n```js\nexample()\n```',
      },
    }),
    'はじめに Astro の 説明。',
  );
  assert.equal(
    parseDescription({
      collection: 'devTos',
      data: {
        title: 'HTML article',
        description: '<p>This is <a href="https://example.com">an article</a>.</p><p>Second paragraph.</p>',
      },
    }),
    'This is an article . Second paragraph.',
  );
  assert.equal(
    parseDescription({
      collection: 'slides',
      data: { title: 'Slide title', description: '<p></p>\n![image](image.png)' },
    }),
    'Slide title',
  );
});

test('external summaries use the entry body when no data summary exists', () => {
  assert.equal(
    parseDescription({
      collection: 'zenns',
      data: { title: 'Zenn article' },
      body: '# Body summary',
    }),
    'Body summary',
  );
  assert.equal(parseDescription({ collection: 'slides', data: { title: 'Only title' } }), 'Only title');
  assert.equal(
    parseDescription({
      collection: 'qiitas',
      data: { title: 'Long article', body: `## Heading\n${'本文'.repeat(100)}` },
    }),
    `Heading ${'本文'.repeat(100)}`.slice(0, 160) + '…',
  );
});
