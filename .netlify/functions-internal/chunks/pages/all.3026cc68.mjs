import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, d as renderHead, e as renderComponent, f as renderSlot, g as createCollectionToGlobResultMap, h as createGetCollection } from '../astro.4c29b78c.mjs';
/* empty css                           *//* empty css                            *//* empty css                                                                *//* empty css                           */
const $$Astro$4 = createAstro();
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead($$result)}<header class="astro-3EF6KSR2"><a href="/" class="astro-3EF6KSR2">Home</a><a href="/about" class="astro-3EF6KSR2">About</a></header>`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/components/Header.astro");

const $$Astro$3 = createAstro();
const $$HomeLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$HomeLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en" class="astro-2M2DI2AW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
    <meta name="generator"${addAttribute(Astro2.generator, "content")}>
    <meta property="og:site_name" content="Blog No Name">
    <meta property="og:title" content="Blog No Name Home">
    <meta property="og:type" content="blog">
    <meta property="og:url" content="https://blog-no-name.netlify.app">
    <meta property="og:image" content="https://blog-no-name.netlify.app/img/blog-no-name.png">
    <meta property="og:description" content="Blog No Name is t0yohei's personal blog site">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@t0yohei">
    <title>${title}</title>
  ${renderHead($$result)}</head>
  <body class="astro-2M2DI2AW">
    ${renderComponent($$result, "Header", $$Header, { "class": "astro-2M2DI2AW" })}
    ${renderSlot($$result, $$slots["default"])}
  </body></html>`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/layouts/HomeLayout.astro");

const $$Astro$2 = createAstro();
const $$Card = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Card;
  const { href, title, body, pubDate } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<li class="link-card astro-DOHJNAO5">
  <a${addAttribute(href, "href")} class="astro-DOHJNAO5">
    <h2 class="astro-DOHJNAO5">
      ${title}
      <span class="astro-DOHJNAO5">&rarr;</span>
    </h2>
    <p class="post-body astro-DOHJNAO5">
      ${body}
    </p>
    <p class="pub-date astro-DOHJNAO5">
      ${pubDate}
    </p>
  </a>
</li>`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/components/Card.astro");

// astro-head-inject

const contentDir = '/src/content/';

const entryGlob = /* #__PURE__ */ Object.assign({"/src/content/blog/20230103_new_year.md": () => import('../20230103_new_year.755dd5f4.mjs'),"/src/content/blog/20230104_start_working.md": () => import('../20230104_start_working.f3bb80aa.mjs'),"/src/content/blog/20230108_add_webcomponents.md": () => import('../20230108_add_webcomponents.83e29a93.mjs'),"/src/content/blog/20230108_small_update.md": () => import('../20230108_small_update.b11b50aa.mjs'),"/src/content/blog/20230119.md": () => import('../20230119.f0ab935e.mjs')

});
const collectionToEntryMap = createCollectionToGlobResultMap({
	globResult: entryGlob,
	contentDir,
});

const renderEntryGlob = /* #__PURE__ */ Object.assign({"/src/content/blog/20230103_new_year.md": () => import('../20230103_new_year.2fe4d5d2.mjs'),"/src/content/blog/20230104_start_working.md": () => import('../20230104_start_working.d99c2b44.mjs'),"/src/content/blog/20230108_add_webcomponents.md": () => import('../20230108_add_webcomponents.bfec66b2.mjs'),"/src/content/blog/20230108_small_update.md": () => import('../20230108_small_update.f0ae6399.mjs'),"/src/content/blog/20230119.md": () => import('../20230119.b6c3a882.mjs')

});
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
	globResult: renderEntryGlob,
	contentDir,
});

const getCollection = createGetCollection({
	collectionToEntryMap,
	collectionToRenderEntryMap,
});

const $$Astro$1 = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index;
  const allBlogs = await getCollection("blog");
  const arrangePreview = (rawContent) => {
    const headSentence = rawContent.substring(0, 50);
    return headSentence.replace(/.$/, "...");
  };
  return renderTemplate`${renderComponent($$result, "HomeLayout", $$HomeLayout, { "title": "Blog No Name", "class": "astro-J7PV25F6" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<main class="astro-J7PV25F6">
    <h1 class="astro-J7PV25F6">Blog <span class="text-gradient astro-J7PV25F6">No Name</span></h1>
    <ul role="list" class="link-card-grid astro-J7PV25F6">
      ${allBlogs.reverse().map((blog) => renderTemplate`${renderComponent($$result, "Card", $$Card, { "href": `${blog.slug}` || "", "title": blog.data.title, "body": arrangePreview("temp"), "pubDate": blog.data.pubDate, "class": "astro-J7PV25F6" })}`)}
    </ul>
  </main>` })}`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/pages/index.astro");

const $$file$1 = "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/pages/index.astro";
const $$url$1 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro();
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`

${renderComponent($$result, "HomeLayout", $$HomeLayout, { "title": "About me" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<main>
    <h1>About me</h1>
    ${renderComponent($$result, "about-me", "about-me", {})}
  </main>` })}`;
}, "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/pages/about.astro");

const $$file = "/Users/kyohei_toyoda/repos/src/github.com/t0yohei/blog-no-name/src/pages/about.astro";
const $$url = "/about";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$Header as $, _page0 as _, _page1 as a };
