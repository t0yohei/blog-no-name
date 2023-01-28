import { j as createVNode, F as Fragment } from './astro.4c29b78c.mjs';
import { $ as $$MarkdownPostLayout } from './MarkdownPostLayout.660b7d0f.mjs';
import 'path-to-regexp';
import 'mime';
import 'cookie';
import 'kleur/colors';
import 'string-width';
import 'slash';
import 'html-escaper';
import './pages/all.3026cc68.mjs';
/* empty css                          *//* empty css                           *//* empty css                                                               *//* empty css                          *//* empty css                                                                           */
const html = "<p>テスト用に複数の記事が欲しかったので連続投稿。</p>\n<p>仕事始めの日だった。のんびり過ごすつもりだったけど思いの外ハードな一日だった。</p>\n<h2 id=\"開発について\">開発について</h2>\n<p>プロフィール機能作るかーとか、OGP 作るかーとか、記事の保存先を DB にして消したり編集したり色々できるようにしたいとは思うが、まだ選定に迷ってる。</p>\n<p>自分しか使わないし、RDB じゃなくて Key-Value Store とかでもよくね？とも思ったり、認証の実装面倒くさいから Google 認証で自分だけ認証できるようにしたらいいかとか諸々。</p>\n<p>ひとまず今日は <a href=\"https://docs.astro.build/en/tutorial/0-introduction/\">Astro のチュートリアル</a> にある内容で、取り入れそうなものを取り入れてみることに。</p>";

				const frontmatter = {"layout":"../../layouts/MarkdownPostLayout.astro","title":"2023 仕事始め","pubDate":"2023-01-04"};
				const file = "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/content/blog/20230104_start_working.md";
				const url = undefined;
				function rawContent() {
					return "\nテスト用に複数の記事が欲しかったので連続投稿。\n\n仕事始めの日だった。のんびり過ごすつもりだったけど思いの外ハードな一日だった。\n\n## 開発について\n\nプロフィール機能作るかーとか、OGP 作るかーとか、記事の保存先を DB にして消したり編集したり色々できるようにしたいとは思うが、まだ選定に迷ってる。\n\n自分しか使わないし、RDB じゃなくて Key-Value Store とかでもよくね？とも思ったり、認証の実装面倒くさいから Google 認証で自分だけ認証できるようにしたらいいかとか諸々。\n\nひとまず今日は [Astro のチュートリアル](https://docs.astro.build/en/tutorial/0-introduction/) にある内容で、取り入れそうなものを取り入れてみることに。\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"開発について","text":"開発について"}];
				}
				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$MarkdownPostLayout, {
									file,
									url,
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}
				Content[Symbol.for('astro.needsHeadRendering')] = false;

const collectedLinks = ["_astro/Header.astro_astro_type_style_index_0_lang.70dd3b15.css","_astro/MarkdownPostLayout.astro_astro_type_style_index_0_lang.1a87fd40.css","_astro/global.475eecb7.css"];
					const collectedStyles = "@@ASTRO-STYLES@@";

export { Content, collectedLinks, collectedStyles, getHeadings };
