import { c as createAstro, a as createComponent, r as renderTemplate, b as addAttribute, d as renderHead, e as renderComponent, f as renderSlot } from './astro.4c29b78c.mjs';
import { $ as $$Header } from './pages/all.3026cc68.mjs';
/* empty css                           *//* empty css                                                                           */
const $$Astro = createAstro();
const $$MarkdownPostLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MarkdownPostLayout;
  const { frontmatter, rawContent } = Astro2.props;
  const arrangePreview = (rawContent2) => {
    const headSentence = rawContent2.substring(0, 50);
    return headSentence.replace(/.$/, "...");
  };
  return renderTemplate`<html lang="en" class="astro-5GRSW2HI">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
    <meta name="generator"${addAttribute(Astro2.generator, "content")}>
    <meta property="og:site_name" content="Blog No Name">
    <meta property="og:title"${addAttribute(frontmatter.title, "content")}>
    <meta property="og:type" content="article">
    <meta property="og:url"${addAttribute(`https://blog-no-name.netlify.app${frontmatter.url}`, "content")}>
    <meta property="og:image" content="https://blog-no-name.netlify.app/img/blog-no-name.png">
    <meta property="og:description"${addAttribute(arrangePreview(rawContent()), "content")}>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@t0yohei">
    <title>${frontmatter.title}</title>
  ${renderHead($$result)}</head>
  <body class="astro-5GRSW2HI">
    ${renderComponent($$result, "Header", $$Header, { "class": "astro-5GRSW2HI" })}
    <main class="astro-5GRSW2HI">
      <h1 class="astro-5GRSW2HI">${frontmatter.title}</h1>
      <p class="astro-5GRSW2HI">Post Date: ${frontmatter.pubDate}</p>
      ${renderSlot($$result, $$slots["default"])}
      <footer class="astro-5GRSW2HI"><a href="/" class="astro-5GRSW2HI">ブログ一覧に戻る</a></footer>
    </main>
  </body></html>`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/layouts/MarkdownPostLayout.astro");

export { $$MarkdownPostLayout as $ };
