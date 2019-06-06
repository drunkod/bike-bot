const fetch = require("node-fetch");
const Global = require("./global");
module.exports = class oneSignal extends Global {
  constructor(social, socialId, group_id, contextRive, token, app_id) {
    super(social, socialId, group_id, contextRive);
    this.token = token;
    this.app_id = app_id;
  }
  async sendNotif() {
    try {
      const res = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "post",
        headers: {
          authorization: this.token,
          "content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          app_id: this.app_id,
          included_segments: [this.segment],
          filters: [
            { field: "tag", key: "city", relation: "=", value: "chelyabinsk" }
          ],
          priority: this.priority,
          contents: {
            en: super.temp_hashtag() + super.msg_full + super.sign_fb
          }
        })
      });
      const json = await res.json();
      console.log("oneSignal_sendNotif>>>>>>>>." + JSON.stringify(json));
    } catch (error) {
      console.error("oneSignal sendNotif: ", error);
    }
  }
  get segment() {
    switch (super.menu) {
      case "quest_name1":
        return `Quest`;
        break;
      case "quest_name2":
        return `Quest`;
        break;
      case "now":
        return "Now";
        break;
      case "event":
        return "Event";
        break;
      case "report":
        return "Report";
        break;
    }
  }
  get priority() {
    switch (super.menu) {
      case "quest_name1":
        return 10;
        break;
      case "quest_name2":
        return 10;
        break;
      default:
        return 10;
        break;
    }
  }
};
