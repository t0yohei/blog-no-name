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
const html = "<p>このブログサイトを少しだけ更新。サイト名の変更や <a href=\"/about\">About</a> ページに SNS へのリンクを追加したり。</p>\n<p>サイト名というかブログのドメイン、本当は <code>no-name.com</code> や <code>no-name.blog</code> にしたかったけど、前者はすでに取得されていて、後者は更新料が高くて一旦諦めた。\n<a href=\"https://twitter.com/t0yohei/status/1612385993142960129\">https://twitter.com/t0yohei/status/1612385993142960129</a></p>\n<p>お小遣いにもう少し余裕ができたら、ドメイン名に課金します。</p>\n<h2 id=\"ogp-導入\">OGP 導入</h2>\n<p>続いて OGP とか用意しようとして色々調査してたら、やはり先駆者がいるようで色々参考にさせてもらおう(特にデザインとか、ね)。\n<a href=\"https://hiroppy.me/blog/migrate-blog-from-hatena/\">https://hiroppy.me/blog/migrate-blog-from-hatena/</a></p>\n<p>OGP 用意するの SSR が必要か…？とか考えてたけど、 MDX を使ったら何とかなる感じか…？(よくわかってない)\nもうちょいちゃんと調べて実装しよう。</p>";

				const frontmatter = {"layout":"../../layouts/MarkdownPostLayout.astro","title":"ちょっとした更新","pubDate":"2023-01-09"};
				const file = "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/content/blog/20230108_small_update.md";
				const url = undefined;
				function rawContent() {
					return "\nこのブログサイトを少しだけ更新。サイト名の変更や <a href=\"/about\">About</a> ページに SNS へのリンクを追加したり。\n\nサイト名というかブログのドメイン、本当は `no-name.com` や `no-name.blog` にしたかったけど、前者はすでに取得されていて、後者は更新料が高くて一旦諦めた。\nhttps://twitter.com/t0yohei/status/1612385993142960129\n\nお小遣いにもう少し余裕ができたら、ドメイン名に課金します。\n\n## OGP 導入\n\n続いて OGP とか用意しようとして色々調査してたら、やはり先駆者がいるようで色々参考にさせてもらおう(特にデザインとか、ね)。\nhttps://hiroppy.me/blog/migrate-blog-from-hatena/\n\nOGP 用意するの SSR が必要か...？とか考えてたけど、 MDX を使ったら何とかなる感じか...？(よくわかってない)\nもうちょいちゃんと調べて実装しよう。\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"ogp-導入","text":"OGP 導入"}];
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
