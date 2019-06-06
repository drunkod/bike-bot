const fetch = require("node-fetch");
const Global = require("./global");
module.exports = class Telegram extends Global {
  constructor(social, socialId, group_id, contextRive, token) {
    super(social, socialId, group_id, contextRive);
    this.token = token;
  }
  async sendMessage() {
    try {
      const res = await fetch(
        "https://api.telegram.org/bot" + this.token + "/sendMessage",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
            chat_id: this.chatId_tg,
            text: super.temp_hashtag() + super.msg_full + super.sign_tg
          })
        }
      );
      const json = await res.json();
      console.log("Telegram_sendMessage>>>>>>>>." + JSON.stringify(json));
      return "Telegram_sendMessage>>>>>>>>." + JSON.stringify(json);
    } catch (error) {
      console.error("Telegram_sendMessage error>>>>>>>>: ", error);
      return error;
    }
  }
  async sendLocation() {
    try {
      const res = await fetch(
        "https://api.telegram.org/bot" + this.token + "/sendLocation",
        {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
            chat_id: this.chatId_tg,
            latitude: super.lat,
            longitude: super.long,
            disable_notification: true
          })
        }
      );
      const json = await res.json();
      console.log(
        "Telegram_sendLocation>>>>>>>>. latitude:" +
          super.lat +
          "longitude:" +
          super.long +
          JSON.stringify(json)
      );
    } catch (error) {
      console.error("Telegram_sendLocation>>>>>>>>: ", error);
      return error;
    }
  }
  get chatId_tg() {
    if (
      rs_bot_bike.getUservar(super.chatId, "menu") === "quest_new_idea" ||
      rs_bot_bike.getUservar(super.chatId, "menu") === "tour" ||
      rs_bot_bike.getUservar(super.chatId, "menu") === "quest_name1" ||
      rs_bot_bike.getUservar(super.chatId, "menu") === "quest_name2"
    ) {
      return rs_bot_bike.getVariable("chatId_tg_admin");
    } else {
      return "@" + rs_bot_bike.getVariable("chatId_tg_overhear");
    }
  }
};
