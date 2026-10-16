# Blog No Name

[![Netlify Status](https://api.netlify.com/api/v1/badges/30cda139-7829-40d7-8ea3-2670a1ceab92/deploy-status)](https://app.netlify.com/sites/blog-no-name/deploys)

個人ブログの管理用リポジトリです。
ブログのデプロイ先は下記。

https://blog-no-name.com/

## スライドの掲載

[slides](https://github.com/t0yohei/slides) の RSS（`https://t0yohei.github.io/slides/feed.xml`）を取得し、トップページの記事一覧と年別アーカイブに日付順で表示します。出典は「Slidev」と表示し、クリックすると GitHub Pages 上の公開スライドを新しいタブで開きます。

掲載するスライドの設定は slides リポジトリで管理します。先に slides 側をデプロイして RSS を公開してから、ブログ側をデプロイしてください。トップページの CDN キャッシュは有効期間が24時間、期限切れ後に古い内容を返しながら再取得する期間が24時間あるため、公開直後には反映されない場合があります。

## 記事のイイね

記事末尾から、ログインせずにイイねできます。同じブラウザからは記事ごとに1回だけ登録でき、もう一度押すと取り消せます。匿名IDをHttpOnly Cookieに1年間保存します。別のブラウザを使った場合やCookieを削除した場合は、別の読者として扱います。

イイねはNetlify Databaseに保存します。`@netlify/database`と`netlify/database/migrations/`を含むデプロイでDBを作成し、マイグレーションを適用します。Deploy Previewには本番と別のDBブランチが割り当てられます。

ローカルでは、Netlify CLI 26以降で次のコマンドを実行します。

```sh
netlify dev
# 別のターミナルで、ローカルDBにマイグレーションを適用
netlify database migrations apply
```

`yarn test`は一時的なローカルDBを起動し、マイグレーション、イイねの追加・取り消し、同時送信の重複防止を検証します。本番DBには接続しません。

イイね数はボタンが画面に入った時に取得します。DBの稼働時間と通信量はNetlifyのクレジットを消費します。

## OGP 画像

`yarn build` 時に、各記事のタイトルを使った 1200 × 630 ピクセルの PNG を `/og/<記事ID>.png` に生成します。記事の追加・タイトル変更は、次回のビルドで画像に反映されます。

デザインは `src/og-image.ts` で変更できます。日本語フォントには [BIZ UDPGothic](https://github.com/google/fonts/tree/main/ofl/bizudpgothic) を同梱しています。ライセンスは `src/assets/fonts/OFL.txt` を参照してください。
