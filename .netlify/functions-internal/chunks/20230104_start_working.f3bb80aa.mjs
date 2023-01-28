const id = "20230104_start_working.md";
const collection = "blog";
const slug = "20230104_start_working";
const body = "\nテスト用に複数の記事が欲しかったので連続投稿。\n\n仕事始めの日だった。のんびり過ごすつもりだったけど思いの外ハードな一日だった。\n\n## 開発について\n\nプロフィール機能作るかーとか、OGP 作るかーとか、記事の保存先を DB にして消したり編集したり色々できるようにしたいとは思うが、まだ選定に迷ってる。\n\n自分しか使わないし、RDB じゃなくて Key-Value Store とかでもよくね？とも思ったり、認証の実装面倒くさいから Google 認証で自分だけ認証できるようにしたらいいかとか諸々。\n\nひとまず今日は [Astro のチュートリアル](https://docs.astro.build/en/tutorial/0-introduction/) にある内容で、取り入れそうなものを取り入れてみることに。\n";
const data = {layout:"..\u002F..\u002Flayouts\u002FMarkdownPostLayout.astro",title:"2023 仕事始め",pubDate:"2023-01-04"};
const _internal = {
	filePath: "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/content/blog/20230104_start_working.md",
	rawData: "\nlayout: ../../layouts/MarkdownPostLayout.astro\ntitle: '2023 仕事始め'\npubDate: '2023-01-04'",
};

export { _internal, body, collection, data, id, slug };
