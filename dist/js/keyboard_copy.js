const Markup = require("node-vk-bot-api/lib/markup");
module.exports = topic => {
  switch (topic) {
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
    case "tour":
      return [
        [Markup.button("помощь", "primary")],
        [Markup.button("menu", "default")]
      ];
  }
};
