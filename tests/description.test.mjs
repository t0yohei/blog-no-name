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
