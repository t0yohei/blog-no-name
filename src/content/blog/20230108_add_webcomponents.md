---
title: 'Astro 内で Web components を使用する方法'
pubDate: '2023-01-08'
---

基本的には公式サイトに書いてある通り。

https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements

astro ファイル内に書く場合は、 `<script>` タグ内にカスタム要素を実装して使うだけ(↓ は公式サイトからの引用)。

`src/components/AstroHeart.astro`

```html
<!-- Wrap the component elements in our custom element “astro-heart”. -->
<!-- prettier-ignore -->
<astro-heart>
  <button aria-label="Heart">💜</button> × <span>0</span>
</astro-heart>

<script>
  // Define the behaviour for our new type of HTML element.
  class AstroHeart extends HTMLElement {
    constructor() {
      super();
      let count = 0;

      const heartButton = this.querySelector('button');
      const countSpan = this.querySelector('span');

      // Each time the button is clicked, update the count.
      heartButton.addEventListener('click', () => {
        count++;
        countSpan.textContent = count;
      });
    }
  }

  // Tell the browser to use our AstroHeart class for <astro-heart> elements.
  customElements.define('astro-heart', AstroHeart);
</script>
```

外部ファイルに切り出す場合は、 `<script>` タグの src 属性に指定するか、

```html
<script src="../components/aboutme.js"></script>

<about-me></about-me>
```

import で読み込むだけ。

```html
<script>
  import '../components/aboutme.js';
</script>

<about-me></about-me>
```

そうすると、ページの `head` 要素に `type="module"` で挿入されてカスタム要素が使えるようになる。

昔は resolve API とかを使う必要があったらしいけど: https://navillus.dev/blog/web-components-in-astro

resolve API が廃止されて今の形になったらしい: https://docs.astro.build/en/migrate/#deprecated-astroresolve

実装サンプル: https://github.com/t0yohei/blog-no-name/pull/1/files
