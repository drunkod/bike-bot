const access_token = process.env.VK_TOKEN_PUBLIC_OVER;

const fireBase = require("./fireBase");
const { VK } = require("vk-io");
const vk = new VK();
const { api } = vk;
const { DateTime } = require("luxon");
const RuDateTime = DateTime.local().setLocale("ru");

module.exports = class referal extends fireBase {
  constructor(social, socialId, group_id, contextRive) {
    super(social, socialId, group_id, contextRive);
  }
  static async get_rating(public_type, rating_type, year_title, month_title) {
    //get rating
    let res = await fireBase.sortRatingMonth(
      public_type,
      rating_type,
      year_title,
      month_title
    );
    // let arr = [];
    // res.forEach(d => {
    //   arr.push(d.data());
    //   console.log("Get:", d.data());
    // });
    console.log(res.docs.length);
    if (res.empty || res.docs.length < 1) {
      console.log("Small rating users!");
      return;
      //create new rating doc
    } else {
      let arr = [];
      res.forEach(d => {
        arr.push(d.data());
        console.log("Get:", d.data());
      });
      this.appWidgetsUpdate(
        arr,
        public_type,
        rating_type,
        year_title,
        month_title
      );

      //   return Promise.resolve(mergeObject);
    }
  }
  static user_template(
    item,
    i,
    public_type,
    rating_type,
    year_title,
    month_title
  ) {
    if (rating_type === "editor") {
      return `{
            "title": users[${i}].first_name + " " + users[${i}].last_name,

            "title_url": "https://vk.com/id${item.user_id.split("|")[1]}",
            "icon_id": "id${item.user_id.split("|")[1]}",
            "descr": "${i + 1} место - ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .rating
      } баллов (${
        item[public_type].years[year_title].months[month_title][rating_type]
          .events
      } встреч, ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .reports
      } отчетов, ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .posts
      } постов)",
            "button": "Результаты конкурса",
            "button_url": "https://vk.com/link"
        }`;
    } else if (rating_type === "vk") {
      return `{
            "title": users[${i}].first_name + " " + users[${i}].last_name,

            "title_url": "https://vk.com/id${item.user_id.split("|")[1]}",
            "icon_id": "id${item.user_id.split("|")[1]}",
            "descr": "${i + 1} место - ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .rating
      } баллов (${
        item[public_type].years[year_title].months[month_title][rating_type]
          .reposts
      } репостов, ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .likes
      } лайков, ${
        item[public_type].years[year_title].months[month_title][rating_type]
          .comments
      } комментариев)",
            "button": "Результаты конкурса",
            "button_url": "https://vk.com/link"
        }`;
    }
  }
  static async appWidgetsUpdate(
    arr,
    public_type,
    rating_type,
    year_title,
    month_title,
    widget_title
  ) {
    let users_ids_arr = arr
      .map(item => {
        return item.user_id.split("|")[1];
      })
      .join();
    let rows_array = arr
      .map((item, i) => {
        return this.user_template(
          item,
          i,
          public_type,
          rating_type,
          year_title,
          month_title
        );
      })
      .join();
    //update app widget
    // ограничение апи! обновление виджета не чаще 1 раза в 10 сек
    const response = await vk.api.appWidgets.update({
      type: "list",
      code: `var users = API.users.get({ "user_ids": [${users_ids_arr}] });

      return {
          "title": "${widget_title} за ${RuDateTime.toFormat("LLLL")}",
          "rows": [
            {
            "title": "${admin_fullname}",
            "title_url": "https://vk.com/id${admin_id}",
            "icon_id": "id${admin_id}",
            "descr": "Спасибо за поддержку!",
            "button": "Результаты конкурса",
            "button_url": "https://vk.com/link"
        },
            ${rows_array}
          ]
      };`,
      access_token
    });

    console.log(response);
  }
};
