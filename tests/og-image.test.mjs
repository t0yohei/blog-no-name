import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import sharp from 'sharp';
import { createOgImage } from '../src/og-image.ts';

const font = await readFile(new URL('../src/assets/fonts/BIZUDPGothic-Bold.ttf', import.meta.url));

test('OGP images render Japanese, special characters, and long titles without network access', async () => {
  for (const title of [
    '退職しました',
    'Astro <Content> & "View Transitions" の導入',
    '日本語と English が混在する長い記事タイトルを画像に収める。'.repeat(6),
  ]) {
    const png = await createOgImage(title, font);
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
  }
});
