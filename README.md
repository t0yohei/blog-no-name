# Blog No Name

[![Netlify Status](https://api.netlify.com/api/v1/badges/30cda139-7829-40d7-8ea3-2670a1ceab92/deploy-status)](https://app.netlify.com/sites/blog-no-name/deploys)

個人ブログの管理用リポジトリです。
ブログのデプロイ先は下記。

https://blog-no-name.com/

## OGP 画像

`yarn build` 時に、各記事のタイトルを使った 1200 × 630 ピクセルの PNG を `/og/<記事ID>.png` に生成します。記事の追加・タイトル変更は、次回のビルドで画像に反映されます。

デザインは `src/og-image.ts` で変更できます。日本語フォントには [BIZ UDPGothic](https://github.com/google/fonts/tree/main/ofl/bizudpgothic) を同梱しています。ライセンスは `src/assets/fonts/OFL.txt` を参照してください。
