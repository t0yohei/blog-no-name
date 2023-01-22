const id = 't0yohei';

const template = `
  <div class="main">
    <div class="main-top">
      <a href="https://twitter.com/${id}">
        <img
          class="twitter-image"
          src="https://pbs.twimg.com/profile_images/731737341488816130/wH_caJBf_400x400.jpg"
        />
      </a>
      <div class="top">
        <h1><span>とよへい</span></h1>
        <p>Software Engineer</p>
      </div>
    </div>
    <p class="description">しがないソフトウェアエンジニャです。</p>
    <table class="profile-table">
      <tbody>
        <tr>
          <th class="show">好きな言語 / FW</th>
          <td class="show"><p>Ruby, Rails, Vue.js</p></td>
        </tr>
        <tr>
          <th class="show">好きな物</th>
          <td class="show"><p>アニメ、コーヒー</p></td>
        </tr>
        <tr>
          <th class="show">住処</th>
          <td class="show"><p>東京周辺</p></td>
        </tr>
        <tr>
          <th class="show">SNS</th>
          <td class="show">
            <a href="https://twitter.com/${id}"><img src="/img/twitter.svg" alt="twitter icon" /></a>
            <a href="https://github.com/${id}"><img src="/img/github.svg" alt="github icon" /></a>
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

  .sns-icon {
    width: 43px;
    height: 43px;
    margin: 2px
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
