const VK_ID_PUBLIC_OVER = process.env.VK_ID_PUBLIC_OVER;
const VK_ID_PUBLIC_BIKE = process.env.VK_ID_PUBLIC_BIKE;
const momenttz = require("moment-timezone");
const { DateTime } = require("luxon");
const EkbDateTime = DateTime.local().setZone("Asia/Yekaterinburg");
const easyvk = require("easyvk");
const encoding = require("encoding");

module.exports = class puplish_vk_article {
  static #login = "login";
  static #password = "socialId";
  static vk_url = "https://vk.com/";
  static url_al_articles = "al_articles.php";
  static dir_vk_session = __dirname + "/vk-session";
  static dir_vk_session_cookies = __dirname + "/vk-session-cookies";

  #vk = this.login_me();

  async login_me() {
    let vk;
    if (!vk) {
      vk = await easyvk({
        username: puplish_vk_article.#login,
        password: puplish_vk_article.#password,
        session_file: puplish_vk_article.dir_vk_session,
        mode: { name: "highload", timeout: 500 },
        reauth: false
      });

      vk.client = await vk.http.loginByForm({
        cookies: puplish_vk_article.dir_vk_session_cookies,
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
        reauth: true
      });

      vk.client = vk.client.client;
    }
    return vk;
  }
  async get_articles(owner_id) {
    let res = await this.#vk.client.request(
      puplish_vk_article.url_al_articles,
      {
        act: "author_page_more",
        al: 1,
        articles_offset: 0,
        owner_id: owner_id,
        sortBy: 1
      },
      true
    );
    res.body = encoding.convert(res.body, "utf-8", "windows-1251").toString();
    let json = this.#vk.client._parseResponse(res.body.split("<!>"));
    let body = json[5];
    console.log(body);
  }
  async save_draft(owner_id) {
    let res = await this.#vk.client.request(
      puplish_vk_article.url_al_articles,
      {
        act: "open_editor",
        al: 1,
        article_owner_id: owner_id,
        from_post_convert: 0,
        post_data_medias: ""
      },
      true
    );
    let saveDraftHash_arr = /"saveDraftHash":"([^"]+)"/gm.exec(res.body);
    if (saveDraftHash_arr) {
      console.log("saveDraftHash: " + saveDraftHash_arr[1]);
      return saveDraftHash_arr[1];
    } else {
      console.log("ERROR saveDraftHash");
    }
  }

  async post_article(text, owner_id, cover_photo_id, title_translit, event_id) {
    let save_draft_hash = await this.save_draft(owner_id);
    let name = title_translit + "-" + event_id;
    let res = await this.#vk.client.request(
      puplish_vk_article.url_al_articles,
      {
        Article_text: text || '[{ "lines": [{ "text": "11111" }], "type": 2 }]',
        act: "save",
        al: 1,
        article_id: 0,
        article_owner_id: owner_id,
        chunks_count: 0,
        cover_photo_id: cover_photo_id || "186238522_416459216",
        hash: save_draft_hash,
        is_published: 1,
        monetization: 0,
        name: name || "only-dwedwedwe-vdfvdfv-vdf",
        ofm: 0,
        show_author: 0
      },
      true
    );
    let article_id_arr = /"id":(\d*)/gm.exec(res.body);
    let article_url_arr = /"url":"\\([^\'"]*)/gm.exec(res.body);
    console.log(
      `article_url: ${puplish_vk_article.vk_url}${article_url_arr[1]}`
    );

    if (article_id_arr) {
      console.log("article_id: " + article_id_arr[1]);
      return article_id_arr[1];
    } else {
      console.log("ERROR article_id");
    }
  }
  //шаблоны строк в статье
  title(text) {
    return `{ 'lines': [{ 'text': ${text} }], 'type': 2 }`;
  }
  image(media_id) {
    return `{'lines': [{ text: "" }], 'type': "101",'mode': "0", 'mediaId': ${media_id}}`; // до 30 шт.//0-квадрат, 2-растянутый
  }
  text(text) {
      let arr = [];
      for (const line in text.split('/n')) {
          arr.push(`{"lines":[{"text":${line}}]}`)
      }
    return arr;
  }
  create_lines(lines, input_add) {
      if (input_add) {
          return `[${input_add}, ${lines}]`
      } else {
          return `[${lines}]`
      }
  }
  
  get newDate() {
    return new Date(EkbDateTime);
  }
  get timeStamp() {
    return new Date().getTime();
  }
};
