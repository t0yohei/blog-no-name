const id = 't0yohei';

const template = `
  <div class="main">
    <div class="main-top">
      <a href="https://twitter.com/${id}">
        <img
          class="twitter-image"
          alt="Twitter プロフィール画像"
          src="https://pbs.twimg.com/profile_images/731737341488816130/wH_caJBf_400x400.jpg"
        />
      </a>
      <div class="top">
        <h1><span>とよへい(t0yohei)</span></h1>
        <p>Software Engineer</p>
      </div>
    </div>
    <p class="description">しがないソフトウェアエンジニャです。</p>
    <table class="profile-table">
      <tbody>
        <tr>
          <th>好きな言語</th>
          <td><p>Ruby, JavaScript, TypeScript</p></td>
        </tr>
        <tr>
          <th>好きなフレームワーク</th>
          <td><p>Ruby on Rails, Vue.js, React, Astro</p></td>
        </tr>
        <tr>
          <th>好きな物</th>
          <td><p>アニメ、コーヒー</p></td>
        </tr>
        <tr>
          <th>住処</th>
          <td><p>東京周辺</p></td>
        </tr>
        <tr>
          <th>SNS</th>
          <td class="sns-icons">
            <a href="https://x.com/${id}"><img src="/img/x-b.png" alt="x icon" class="sns-icon" /></a>
            <a href="https://github.com/${id}"><img src="/img/github.svg" alt="github icon"/></a>
            <a href="https://qiita.com/${id}"><img src="/img/qiita.png" alt="qiita icon" class="sns-icon" /></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <style>
  .main {
    margin-top: 20px;
  }

  .main-top {
    display: flex;
    align-items: center;
    gap: 50px;
  }

  .twitter-image {
    width: 150px;
    height: 150px;
    border-radius: 100px;
  }

  .description {
    margin: 30px 0;
    font-size: 18px;
  }

  .profile-table {
    table-layout: auto;
    width: 100%;
    text-align: left;
  }

  .sns-icons {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .sns-icon {
    width: 40px;
    height: 40px;
  }
  </style>
`;

class AboutMe extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const elem = document.createElement('template');
    elem.innerHTML = template;

    this.shadowRoot.append(elem.content);
  }
}

customElements.define('about-me', AboutMe);
