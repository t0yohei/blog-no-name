const id = "20230108_small_update.md";
const collection = "blog";
const slug = "20230108_small_update";
const body = "\nこのブログサイトを少しだけ更新。サイト名の変更や <a href=\"/about\">About</a> ページに SNS へのリンクを追加したり。\n\nサイト名というかブログのドメイン、本当は `no-name.com` や `no-name.blog` にしたかったけど、前者はすでに取得されていて、後者は更新料が高くて一旦諦めた。\nhttps://twitter.com/t0yohei/status/1612385993142960129\n\nお小遣いにもう少し余裕ができたら、ドメイン名に課金します。\n\n## OGP 導入\n\n続いて OGP とか用意しようとして色々調査してたら、やはり先駆者がいるようで色々参考にさせてもらおう(特にデザインとか、ね)。\nhttps://hiroppy.me/blog/migrate-blog-from-hatena/\n\nOGP 用意するの SSR が必要か...？とか考えてたけど、 MDX を使ったら何とかなる感じか...？(よくわかってない)\nもうちょいちゃんと調べて実装しよう。\n";
const data = {layout:"..\u002F..\u002Flayouts\u002FMarkdownPostLayout.astro",title:"ちょっとした更新",pubDate:"2023-01-09"};
const _internal = {
	filePath: "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/content/blog/20230108_small_update.md",
	rawData: "\nlayout: ../../layouts/MarkdownPostLayout.astro\ntitle: 'ちょっとした更新'\npubDate: '2023-01-09'",
};

export { _internal, body, collection, data, id, slug };
