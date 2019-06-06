const { DateTime } = require("luxon");
const EkbDateTime = DateTime.local().setZone("Asia/Yekaterinburg");
const fireBase = require("./fireBase");
//to do сделать общий рейтинг редакторов и отдельно рейтинг для каждой группы активности
module.exports = class rating extends fireBase {
  constructor(social, socialId, group_id, contextRive) {
    super(social, socialId, group_id, contextRive);
  }
  static year_title() {
    return "y_" + String(EkbDateTime.toFormat("yyyy"));
  }
  static month_title() {
    return "m_" + String(EkbDateTime.toFormat("L"));
  }
  static public_type() {
    return "bike";
  }
  static data_model({
    social,
    social_id,
    y_rating = 0,
    m_rating = 0,
    events = 0,
    posts = 0,
    reports = 0,
    invites = 0
  }) {
    return {
      type: "rating",
      user_id: social + "|" + social_id,
      [this.public_type()]: {
        years: {
          [this.year_title()]: {
            rating: y_rating,
            months: {
              [this.month_title()]: {
                editor: {
                  rating: m_rating,
                  events: events,
                  posts: posts,
                  reports: reports,
                  invites: invites
                }
              }
            }
          }
        }
      }
    };
  }

  static plus(type) {
    switch (type) {
      case "posts":
        return 1;
      case "reposts":
        return 4;
      case "events":
      case "reports":
        return 2;
      case "invites":
        return 20;
      default:
        return 1;
    }
  }
  static async saveRating(social, social_id, type) {
    //create new rating doc
    try {
      let mergeObject = {
        social,
        social_id,
        type,
        [type]: fireBase.getIncrement(this.plus()),
        y_rating: fireBase.getIncrement(this.plus(type)),
        m_rating: fireBase.getIncrement(this.plus(type))
      };
      let res = await fireBase.setRating({
        social,
        social_id,
        data_model: this.data_model(mergeObject),
        merge: true
      });
      console.log(res);

      return Promise.resolve(mergeObject);
    } catch (error) {
      console.log("Error getting documents", error);
      return error;
    }
  }
};
