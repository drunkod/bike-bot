const fetch = require("node-fetch");
//todo all rive to global
const Global = require("./global");
module.exports = class Vkontakte extends Global {
  constructor(
    social,
    socialId,
    group_id,
    contextRive,
    token_admin,
    token_group1,
    token_group2,
    api_version
  ) {
    super(social, socialId, group_id, contextRive);
    (this.token_admin = token_admin),
      (this.token_group1 = token_group1),
      (this.token_group2 = token_group2),
      (this.api_version = api_version);
  }
  async newUser() {
    const res = await fetch("https://api.vk.com/method/execute.new_user", {
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body:
        "comment_chat=" +
        this.comment_chat +
        "&SENDER_ID_GROUP=" +
        super.vk_owner_id +
        "&user_id=" +
        this.user_id +
        "&text_tosend=" +
        encodeURIComponent(`${super.msg_full}`) +
        "&attach_imagelink=" +
        super.attach_imagelink +
        "&access_token=" +
        this.token_admin +
        "&v=" +
        this.api_version
    });
    return await res.json();
  }
  createKeyboard() {
    console.log("super.topic" + super.topic);
    console.log("this.keyboard" + JSON.stringify(this.keyboard));

    bot_bike.sendMessage(
      this.user_id,
      "⌨️ ntrcn",
      null,
      Markup.keyboard(this.keyboard).oneTime()
    );
  }
  async sendFromRive() {
    console.log(
      "sendFromRive comment_chat=" +
        this.comment_chat +
        "&SENDER_ID_GROUP=" +
        super.vk_owner_id +
        "&user_id=" +
        this.user_id +
        "&text_tosend=" +
        encodeURIComponent(`${super.temp_hashtag("vk")} ${super.msg_full}`) +
        "&attach_imagelink=" +
        super.attach_imagelink +
        "&access_token=" +
        this.token_admin +
        "&lat=" +
        super.lat +
        "&long=" +
        super.long +
        "&v=" +
        this.api_version
    );

    const res = await fetch(
      "https://api.vk.com/method/execute.send_from_rive",
      {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body:
          "comment_chat=" +
          this.comment_chat +
          "&SENDER_ID_GROUP=" +
          super.vk_owner_id +
          "&user_id=" +
          this.user_id +
          "&text_tosend=" +
          encodeURIComponent(`${super.msg_full}`) +
          "&attach_imagelink=" +
          super.attach_imagelink +
          "&access_token=" +
          this.token_admin +
          "&lat=" +
          super.lat +
          "&long=" +
          super.long +
          "&v=" +
          this.api_version
      }
    );
    const json = await res.json();
    return json;
  }
  async wallPostReport() {
    console.log(
      "wallPostReport comment_chat=" +
        this.comment_chat +
        "&SENDER_ID_GROUP=" +
        Math.abs(super.vk_owner_id) +
        "&user_id=" +
        this.user_id +
        "&text_tosend=" +
        encodeURIComponent(`${super.temp_hashtag("vk")} ${super.msg_full}`) +
        "&attach_imagelink=" +
        super.attach_imagelink +
        "&access_token=" +
        this.token_admin +
        "&vk_aid=" +
        this.vk_aid +
        "&v=" +
        this.api_version
    );

    const res = await fetch(
      "https://api.vk.com/method/execute.wall_post_report",
      {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body:
          "comment_chat=" +
          this.comment_chat +
          "&SENDER_ID_GROUP=" +
          Math.abs(super.vk_owner_id) +
          "&user_id=" +
          this.user_id +
          "&text_tosend=" +
          encodeURIComponent(`${super.msg_full}`) +
          "&attach_imagelink=" +
          super.attach_imagelink +
          "&access_token=" +
          this.token_admin +
          "&vk_aid=" +
          this.vk_aid +
          "&v=" +
          this.api_version
      }
    );
    const json = await res.json();
    return json;
  }
  async boardCreateComment() {
    const res = await fetch("https://api.vk.com/method/board.createComment", {
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body:
        "group_id=" +
        Math.abs(super.vk_owner_id) +
        "&topic_id=" +
        super.vk_topic_id +
        "&message=" +
        encodeURIComponent(`${super.msg_full}`) +
        "&access_token=" +
        this.token_admin +
        "&from_group=1" +
        "&v=" +
        this.api_version
    });
    const json = await res.json();
    return json;
  }
  async wallPost() {
    try {
      const res = await fetch("https://api.vk.com/method/wall.post", {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body:
          "owner_id=" +
          super.vk_owner_id +
          "&message=" +
          encodeURIComponent(
            `${super.temp_hashtag("vk")} ${super.msg_full} ${super.sign_vk}`
          ) +
          "&access_token=" +
          this.token_admin +
          "&from_group=1" +
          "&v=" +
          this.api_version
      });
      const json = await res.json();
      console.log("wallPost>>>>>>>>." + JSON.stringify(json));
    } catch (error) {
      console.error("wallPost>>>>>>>>: ", error);
    }
  }
  async sendLocation() {
    try {
      const res = await fetch("https://api.vk.com/method/messages.send", {
        method: "get",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body:
          "user_id=" +
          this.user_id +
          "&message=" +
          encodeURIComponent("Местоположение") +
          "&access_token=" +
          this.token_group +
          "&lat=" +
          super.lat +
          "&long=" +
          super.long +
          "&v=" +
          this.api_version
      });
      const json = await res.json();
      console.log("wallPost>>>>>>>>." + JSON.stringify(json));
    } catch (error) {
      console.error("wallPost>>>>>>>>: ", error);
    }
  }
  async createAlbum() {
    const res = await fetch("https://api.vk.com/method/photos.createAlbum", {
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body:
        "group_id=" +
        Math.abs(super.vk_owner_id) +
        "&title=" +
        encodeURIComponent(`${super.eventdate_album} ${super.title_quotes}`) +
        "&access_token=" +
        this.token_admin +
        "&description=" +
        encodeURIComponent(`${super.sign_tg}`) +
        "&v=" +
        this.api_version
    });
    const json = await res.json();
    console.log("createAlbum>>>>>>>>." + JSON.stringify(json));
    super.vk_aid = json.response.id;

    super.vkalbum_link = `vk.com/album${super.vk_owner_id}_${json.response.id}`;
    return json;
  }
  get user_id() {
    return super.chatId;
  }
  get keyboard() {
    switch (super.topic) {
      case "change_region":
      case "region_1":
      case "region_2":
      case "region_3":
      case "region_4":
      case "region_5":
      case "region_6":
      case "region_7":
      case "region_8":
      case "region_9":
      case "region_10":
      case "menu":
      case "event_hashtag":
      case "report_hashtag":
      case "question_hashtag":
      case "market_hashtag":
      case "sos_hashtag":
      case "quest":
      case "users":
      case "loading":
        return [
          [
            Markup.button("1", "primary"),
            Markup.button("2", "primary"),
            Markup.button("3", "primary"),
            Markup.button("4", "primary")
          ],
          [
            Markup.button("5", "primary"),
            Markup.button("6", "primary"),
            Markup.button("7", "primary"),
            Markup.button("8", "primary")
          ],
          [Markup.button("9", "primary"), Markup.button("10", "primary")],
          [Markup.button("menu", "default")]
        ];
      case "change_mobile":
      case "marsh_opisanie":
      case "event_title":
      case "report_title":
      case "report_about":
      case "question_title":
      case "market_title":
        return [
          [Markup.button("пропустить", "primary")],
          [Markup.button("menu", "default")]
        ];
      case "send_msg":
      case "marsh_opisanie":
      case "event_title":
      case "report_send":
      case "question_send":
      case "market_send":
      case "sos_send":
        return [
          [
            Markup.button("отправить", "primary"),
            Markup.button("изменить", "primary")
          ],
          [Markup.button("menu", "default")]
        ];
      case "now_time":
      case "change_temp":
      case "winter_temp":
      case "rain_temp":
      case "change_verno":
      case "change_temp":
        return [
          [
            Markup.button("1", "primary"),
            Markup.button("2", "primary"),
            Markup.button("3", "primary"),
            Markup.button("4", "primary")
          ],
          [Markup.button("5", "primary"), Markup.button("6", "primary")],
          [Markup.button("menu", "default")]
        ];
        break;
      case "change_bikemodel":
        return [
          [
            Markup.button("GT", "primary"),
            Markup.button("SPECIALIZED", "primary"),
            Markup.button("MERIDA", "primary"),
            Markup.button("CUBE", "primary")
          ],
          [
            Markup.button("MONGOOSE", "primary"),
            Markup.button("JAMIS", "primary"),
            Markup.button("NORCO", "primary"),
            Markup.button("GIANT", "primary")
          ],
          [
            Markup.button("TREK", "primary"),
            Markup.button("FORMAT", "primary"),
            Markup.button("FORWARD", "primary"),
            Markup.button("STELS", "primary")
          ],
          [Markup.button("пропустить", "primary")],
          [Markup.button("menu", "default")]
        ];
        break;
    }
  }
  get vk_aid() {
    switch (super.menu) {
      case "now":
      case "event":
      case "sos":
        return 254350078;
      case "report":
        return super.vk_aid;
    }
  }
  get token_group() {
    if (super.group_id === 90700964) {
      return super.rive.getVariable("access_token_over_for_vk_msg");
    } else if (super.group_id === 71008034) {
      return super.rive.getVariable(
        "access_token_bikeeveryday_chelyabinsk_for_vk_msg"
      );
    }
  }

  get comment_chat() {
    switch (super.menu) {
      case "users":
        return super.hashtag_sex + " - " + this.firstName;
        break;
      case "now":
        return (
          this.firstName +
          " " +
          super.temp_name +
          [" катается", " катает"][
            Math.floor(Math.random() * ["катается", "катает"].length)
          ]
        );
        break;
      case "event":
        return (
          super.temp_name +
          " | " +
          this.title_quotes +
          " | " +
          this.firstName +
          " " +
          this.lastName
        );
        break;
      case "report":
        return (
          "Фото" +
          super.temp_name +
          " с покатушки | " +
          this.firstName +
          " " +
          this.lastName
        );
        break;
      case "sos":
        return " Нужна помощь ";
        break;
      default:
        break;
    }
  }
};
