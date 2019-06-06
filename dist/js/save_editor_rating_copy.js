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
  static async go_rating(social, social_id, type) {
    //get rating
    let res = await fireBase.getRating(social, social_id);
    if (!res.exists) {
      console.log("No such document!");
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
        let res = fireBase.setRating({
          social,
          social_id,
          data_model: this.data_model(mergeObject)
        });
        return Promise.resolve(mergeObject);
      } catch (error) {
        console.log("Error getting documents", error);
        return error;
      }
    } else {
      const Data = await res.data();
      const { [this.public_type()]: public_type = {} } = Data;
      const { [this.year_title()]: year = {} } = public_type.years || {};
      const { rating: y_rating = 0 } = year;
      let { [this.month_title()]: month = {} } = year.months || {};
      let { editor: editor_month = {} } = month;
      const {
        rating: m_rating = 0,
        events = 0,
        posts = 0,
        reports = 0
      } = editor_month;
      //mergeRating doc
      const mergeObject = {
        social,
        social_id,
        type,
        plus: this.plus(type),
        set _y_rating(value) {
          console.log("set" + value);

          this.y_rating = value + this.plus || this.plus;
        },
        set _m_rating(value) {
          console.log("set" + value);

          this.m_rating = value + this.plus || this.plus;
        },
        set _events(value) {
          if (this.type === "events") {
            this.events = value + 1 || 1;
          } else {
            this.events = value;
          }
        },
        set _posts(value) {
          if (this.type === "posts") {
            this.posts = value + 1 || 1;
          } else {
            this.posts = value;
          }
        },
        set _reports(value) {
          if (this.type === "reports") {
            this.reports = value + 1 || 1;
          } else {
            this.reports = value;
          }
        }
      };
      mergeObject._y_rating = y_rating;
      mergeObject._m_rating = m_rating;
      mergeObject._events = events;
      mergeObject._posts = posts;
      mergeObject._reports = reports;
      try {
        const res = await fireBase.setRating({
          social,
          social_id,
          data_model: this.data_model(mergeObject),
          merge: true
        });
        return Promise.resolve(mergeObject);
      } catch (error) {
        console.log("Error setRating", error);
        return error;
      }
      //   return Promise.resolve(mergeObject);
    }
  }
};
