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
const html = "<p>2023 年上半期の目標を立ててみたので、その記録と実行。</p>\n<h2 id=\"目標\">目標</h2>\n<p>目標は以下の通り</p>\n<ul>\n<li>他者と積極的に関わる</li>\n<li>ブログサービスを作って適当に運用する</li>\n<li>70kg 以上になったら米食べるの禁止</li>\n</ul>\n<h2 id=\"ブログサービス\">ブログサービス</h2>\n<p>というわけで、早速ブログサービスを適当に作ってみた。\n1 時間くらいで作っちゃいたかったので、以前素振りしてた Astro でサクッと作ってみることに。</p>\n<p>リポジトリは <a href=\"https://github.com/t0yohei/blog-no-name\">こちら</a>。</p>\n<p>目標にある通り適当に運用していけたらと思う。</p>";

				const frontmatter = {"layout":"../../layouts/MarkdownPostLayout.astro","title":"2023 New Year","pubDate":"2023-01-03"};
				const file = "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/content/blog/20230103_new_year.md";
				const url = undefined;
				function rawContent() {
					return "\n2023 年上半期の目標を立ててみたので、その記録と実行。\n\n## 目標\n\n目標は以下の通り\n\n- 他者と積極的に関わる\n- ブログサービスを作って適当に運用する\n- 70kg 以上になったら米食べるの禁止\n\n## ブログサービス\n\nというわけで、早速ブログサービスを適当に作ってみた。\n1 時間くらいで作っちゃいたかったので、以前素振りしてた Astro でサクッと作ってみることに。\n\nリポジトリは [こちら](https://github.com/t0yohei/blog-no-name)。\n\n目標にある通り適当に運用していけたらと思う。\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"目標","text":"目標"},{"depth":2,"slug":"ブログサービス","text":"ブログサービス"}];
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
