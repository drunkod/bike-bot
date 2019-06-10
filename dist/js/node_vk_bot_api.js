const { DateTime, Settings } = require("luxon");
Settings.defaultZoneName = "Asia/Yekaterinburg";
Settings.defaultLocale = "ru";

const Markup = require("node-vk-bot-api/lib/markup");

const keyboard = require("./keyboard");
// todo вынести реферал в класс отдельно
// const referal = require("./referal");
const Global = require("./global");
const fireBase = require("./fireBase");
const oneSignal = require("./oneSignal");
const Vkontakte = require("./Vkontakte");
const Telegram = require("./Telegram");

module.exports = (rive, public_type) => {
  try {
    const bot = Global.init_vk_bot(public_type);

    let G, fc, tg, os, vk;

    function init(arr_global) {
      fc = new fireBase(...arr_global);
      tg = new Telegram(...arr_global, process.env.TG_TOKEN_BOT);
      os = new oneSignal(
        ...arr_global,
        process.env.OS_TOKEN,
        process.env.OS_APP_ID
      );

      vk = new Vkontakte(
        ...arr_global,
        process.env.VK_TOKEN_ADMIN,
        process.env.VK_TOKEN_PUBLIC_BIKE,
        process.env.VK_TOKEN_PUBLIC_OVER,
        5.73
      );
    }

    bot.use((ctx, next) => {
      G = new Global(
        "vk",
        ctx.message.from_id,
        ctx.bot.settings.group_id,
        rive,
        bot
      );
      init(["vk", ctx.message.from_id, ctx.bot.settings.group_id, rive]);
      (async () => {
        try {
          var Uservars = G.Uservars;
          //если лок перемен бота не существуют
          if (!Uservars) {
            const doc = await fc.getUserData();
            if (!doc.exists) {
              //если пользователя нет в базе данных
              G.TYPE = "LEAD";
              G.menu = "user";
              //получаем данные пользователя и записываем в переменные бота
              await G.save_user_to_rive(ctx.message, "vk");
              // console.log(res1);
              //если присутствуют реферальные параметры, записываем
              await G.save_referal_to_rive(ctx.message);
              // console.log(res2);
              //сохранение профиля авторизации
              await fc.createAuthUser();
              //сохранение профиля лида
              await fc.saveLeadData();
              // console.log(res3);
              next();
            } else {
              //если запись есть в базе данных, записываем переменные в бота
              G.Uservars = doc.data().hashtags.user.data_bot;
              //если старый лид, то ставим топик рандом и проверка на referal=false
              if (G.TYPE !== "CONTACT") {
                G.topic = "random";
                //если в базе referal=false
                if (!doc.data().referal) {
                  //сохраняем данные реферала
                  await G.save_referal_to_rive(ctx.message);
                  //обновление профиля авторизации
                  await fc.updateAuthUser();
                  //обновление профиля лида
                  await fc.saveLeadData();
                }
              }
              //\/выход в сообщения дальше\/
              next();
            }
          } else {
            //если зарегистрирован или лид то ничего не делаем
            if (G.TYPE === "CONTACT" || G.TYPE === "LEAD") {
              //\/выход в сообщения дальше\/
              next();
            }
          }
        } catch (error) {
          console.log(error);
        }
      })();
    });

    bot.on(ctx => {
      //console.log(rive);
      //если сообщение с буквами отчета 'О1' то не отвечаем
      // console.log(ctx);
      if (
        ctx.message.text.match(
          /(^о([0-9]{0,2})?$)|(^j([0-9]{0,2})?$)|(^отчет([0-9]{0,2})?$)/g
        )
      ) {
        return;
      }
      //если сообщение из беседы то не отвечаем
      if (Number(ctx.message.peer_id) > 2000000000) {
        return;
      }
      //отправка входящего сообщения в riverscript
      if (
        rive.getUservar(ctx.message.from_id, "topic") === "now_about" ||
        rive.getUservar(ctx.message.from_id, "topic") === "event_about" ||
        rive.getUservar(ctx.message.from_id, "topic") === "report_about" ||
        rive.getUservar(ctx.message.from_id, "topic") === "sos_about" ||
        rive.getUservar(ctx.message.from_id, "topic") === "market_about" ||
        rive.getUservar(ctx.message.from_id, "topic") === "question_about"
      ) {
        rive.setUservar(ctx.message.from_id, "msg_about", ctx.message.text);
      }
      if (ctx.message.geo) {
        // geo: Object { type: "point", coordinates: Object, place: Object }
        // coordinates: Object { latitude: 55.154893, longitude: 61.405635 }
        // place: Object { country: "Россия", city: "Челябинск", title: "Челябинск, Россия" }
        // city: "Челябинск"
        // country: "Россия"
        // title: "Челябинск, Россия"
        // todo if city Копейск
        rive
          .replyAsync(
            ctx.message.from_id,
            `pinned location ${ctx.message.geo.coordinates.latitude} ${
              ctx.message.geo.coordinates.longitude
            }`
          )
          .then(function(reply) {
            console.log("Bot>", reply);
            //отправка ответного сообщения + клавиатура
            ctx.reply(
              reply,
              null,
              Markup.keyboard(keyboard(G.topic)).oneTime()
            );
          })
          .catch(function(error) {
            console.error("Error geo: ", error);
          });
      } else {
        rive
          .replyAsync(ctx.message.from_id, ctx.message.text)
          .then(function(reply) {
            //получение ответа из riverscript
            console.log(
              "vk-init.js = Bot> " +
                ctx.message.from_id +
                ctx.bot.settings.group_id,
              reply
            );
            //отправка ответного сообщения + клавиатура
            ctx.reply(
              reply,
              null,
              Markup.keyboard(keyboard(G.topic)).oneTime()
            );
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    });

    bot.startPolling(() => {
      console.log("Bot startPolling in " + public_type);
    });

    rive.setSubroutine("create_change_route_link", function(rive, args) {
      console.log(
        ".setSubroutine(create_change_route_link>>>>>>>>>>" +
          JSON.stringify(rive.currentUser())
      );

      fc.generateSignInWithEmailLink()
        .then(link => console.log("create_change_route_link успешно"))
        .catch(err => console.log(err));
    });

    var checkDate = function(body, callback) {
      console.log("217>>>>>>>>>>" + JSON.stringify(rive.currentUser()));
      console.log("218>>>>>>>>>>" + JSON.stringify(body));
      switch (String(body)) {
        case String(
          body.match(
            /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]20(0[^0-9]|1[^0-6]|2[0-9]) (2[0-3]|[01][0-9]):([0-5][0-9])/g
          )
        ):
          var ctx_input = body.match(
            /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]20(0[^0-9]|1[^0-6]|2[0-9]) (2[0-3]|[01][0-9]):([0-5][0-9])/
          );
          var textDate = `20${ctx_input[3]}-${ctx_input[2]}-${ctx_input[1]} ${
            ctx_input[4]
          }:${ctx_input[5]}`;
          var utcDate = new Date(
            `20${ctx_input[3]}-${ctx_input[2]}-${ctx_input[1]}T${
              ctx_input[4]
            }:${ctx_input[5]}:00`
          );

          var formatter = new Intl.DateTimeFormat("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          });
          var eventdate = formatter.format(utcDate);

          // var eventtime = utcDate.toLocaleTimeString("ru-RU", {
          //   hour: "numeric",
          //   minute: "numeric"
          // });
          rive.setUservar(rive.currentUser(), "eventdate", eventdate);
          rive.setUservar(rive.currentUser(), "eventutcdate", textDate);

          // rive.setUservar(rive.currentUser(), "eventtime", eventtime);
          rive.setUservar(
            rive.currentUser(),
            "eventdate_hash",
            `#дата_${utcDate
              .toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "numeric",
                year: "numeric"
              })
              .replace(/\./g, "_")}`
          );
          rive.setUservar(
            rive.currentUser(),
            "eventdate_album",
            `${utcDate
              .toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "numeric",
                year: "numeric"
              })
              .replace(/\./g, "/")}`
          );
          if (rive.getUservar(rive.currentUser(), "menu") === "event") {
            rive.setUservar(rive.currentUser(), "topic", "event_title");
            callback.call(
              this,
              null,
              `▶Выбор: дата встречи ${eventdate} и время ${eventtime}\n\n Напишите краткое название поездки на велосипеде.\n Например: 'Покатушка вокруг оз.Тургояк', 'Каштакский Бор', 'Велоночь вокруг Шершней', 'Велопрогулка в парке Гагарина'`
            );
          } else if (rive.getUservar(rive.currentUser(), "menu") === "report") {
            rive.setUservar(rive.currentUser(), "topic", "report_about");
            console.log(
              "vkalbum_link" +
                rive.getUservar(rive.currentUser(), "vkalbum_link")
            );
            if (
              rive.getUservar(rive.currentUser(), "vkalbum_link") ===
              "undefined"
            ) {
              callback.call(
                this,
                null,
                `▶Выбор: даты последней поездки ${eventdate} и время ${eventtime}\n\n Расскажите о покатушке более подробнее (развернутым текстом)\n Пример:\n 'Это было мощно. 90 км - это не шутки, если ехать не в маршрутке). Прикол: нас 20 человек остановились в какой-то деревне сделать фото с красивыми и здоровенными гусями. Местные девушки едут мимо на уазике и ржут над нами). И ещё прикол: Сергею не повезло: трижды колесо пробивал.'\n\n Альбом для фотографий будет создан автоматически тут vk.com/albums-${rive.getVariable(
                  "owner_id_overhear"
                )} \n Либо 2⃣ - Пропустить\n`
              );
              vk.createAlbum()
                .then(res =>
                  console.log(
                    `setSubroutine("create_vkalbum" ${res.response.id}`
                  )
                )
                .catch(err => console.log(error));
              console.log("1514>>>>>>>>>>>");
            } else {
              callback.call(
                this,
                null,
                `▶Выбор: даты последней поездки ${eventdate} и время ${eventtime}\n\n Расскажите о покатушке более подробнее (развернутым текстом)\n Пример:\n 'Это было мощно. 90 км - это не шутки, если ехать не в маршрутке). Прикол: нас 20 человек остановились в какой-то деревне сделать фото с красивыми и здоровенными гусями. Местные девушки едут мимо на уазике и ржут над нами). И ещё прикол: Сергею не повезло: трижды колесо пробивал.'\n\n Альбом для фотографий будет создан автоматически тут vk.com/albums-${rive.getVariable(
                  "owner_id_overhear"
                )} \n Либо 2⃣ - Пропустить\n`
              );

              console.log("after createalbom");
            }
          }

          break;
        case String(body.match(/^[1]{1}$/g)):
          break;

        default:
          if (rive.getUservar(rive.currentUser(), "menu") === "event") {
            callback.call(
              this,
              null,
              `\n \n Напишите дату встречи и время. Только в таком формате (ЧИСЛО-МЕСЯЦ-ГОД ЧАСЫ:МИНУТЫ). Примеры:  01-12-2018 09:10 или 01/12/2018 09:10 \n`
            );
          } else if (rive.getUservar(rive.currentUser(), "menu") === "report") {
            callback.call(
              this,
              null,
              `\\n \\n Напишите дату и время. Только в таком формате (ЧИСЛО-МЕСЯЦ-ГОД ЧАСЫ:МИНУТЫ). Примеры:  01-12-2018 09:10 или 01/12/2018 09:10 \\n`
            );
          }
      }
    };

    rive.setSubroutine("checkDate_old", function(rive, args) {
      return new rive.Promise(function(resolve, reject) {
        checkDate(args[0], function(error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    });

    rive.setSubroutine("checkDate", function(rive, args) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(checkDate>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var chatId = rive.currentUser();
        console.log("217>>>>>>>>>>" + JSON.stringify(rive.currentUser()));
        console.log("218>>>>>>>>>>" + JSON.stringify(args[0].split(" ")[0]));
        let body = args[0].split(" ")[0];
        // валидация проверка что это дата?
        switch (String(body)) {
          case String(
            body.match(
              /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]20(0[^0-9]|1[^0-6]|2[0-9])/g
            )
          ):
            var ctx_input = body.match(
              /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]20(0[^0-9]|1[^0-6]|2[0-9])/
            );

            let utcDate = DateTime.local(
              Number(`20${ctx_input[3]}`),
              Number(ctx_input[2]),
              Number(ctx_input[1])
            );
            //"среда, 16 января"
            var eventdate = String(utcDate.toFormat("cccc, dd MMMM"));
            "2018-12-18T21:46:55.013+03:00";
            let iso_date = utcDate.toISO().toString();
            let eventutcdate = utcDate.toUTC().toString();
            // var eventtime = utcDate.toLocaleTimeString("ru-RU", {
            //   hour: "numeric",
            //   minute: "numeric"
            // });
            rive.setUservar(rive.currentUser(), "iso_date", iso_date);
            rive.setUservar(rive.currentUser(), "eventdate", eventdate);
            rive.setUservar(rive.currentUser(), "eventutcdate", eventutcdate);
            // rive.setUservar(rive.currentUser(), "eventtime", eventtime);
            rive.setUservar(
              rive.currentUser(),
              "eventdate_hash",
              `#дата_${utcDate.toFormat("dd_LL_yyyy")}`
            );
            rive.setUservar(
              rive.currentUser(),
              "eventdate_album",
              `${utcDate.toFormat("dd/LL/yyyy")}`
            );
            if (
              rive.getUservar(rive.currentUser(), "topic") ===
              "change_eventdate"
            ) {
              rive.setUservar(rive.currentUser(), "topic", "change_eventtime");
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            } else if (
              rive.getUservar(rive.currentUser(), "topic") ===
              "change_reportdate"
            ) {
              rive.setUservar(rive.currentUser(), "topic", "change_reporttime");
              console.log(
                "vkalbum_link" +
                  rive.getUservar(rive.currentUser(), "vkalbum_link")
              );
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
              if (
                rive.getUservar(rive.currentUser(), "vkalbum_link") ===
                "undefined"
              ) {
                vk.createAlbum()
                  .then(res =>
                    console.log(
                      `setSubroutine("create_vkalbum" ${res.response.id}`
                    )
                  )
                  .catch(err => console.log(error));
                console.log("1514>>>>>>>>>>>");
              } else {
                console.log("after createalbum");
              }
            }

            break;
          case String(body.match(/^[1]{1}$/g)):
            break;

          default:
            if (rive.getUservar(rive.currentUser(), "menu") === "event") {
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            } else if (
              rive.getUservar(rive.currentUser(), "menu") === "report"
            ) {
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            }
        }
      });
    });

    rive.setSubroutine("checkTime", function(rive, args) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(checkTime>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var chatId = rive.currentUser();
        console.log("217>>>>>>>>>>" + JSON.stringify(rive.currentUser()));
        console.log("218>>>>>>>>>>" + JSON.stringify(args[0].split(" ")[0]));
        let body = args[0].split(" ")[0];
        // валидация проверка что это время?
        switch (String(body)) {
          case String(body.match(/^(2[0-3]|[01][0-9]):([0-5][0-9])/g)):
            var ctx_input = body.match(/^(2[0-3]|[01][0-9]):([0-5][0-9])/);
            let Iso = DateTime.fromISO(
              rive.getUservar(rive.currentUser(), "iso_date")
            );
            let utcDate = Iso.set({
              hour: Number(ctx_input[1]),
              minute: Number(ctx_input[2])
            });
            let iso_date = utcDate.toISO().toString();
            let eventutcdate = utcDate.toUTC().toString();
            //"21:46"
            let eventtime = utcDate.toLocaleString(DateTime.TIME_24_SIMPLE);

            rive.setUservar(rive.currentUser(), "iso_date", iso_date);
            rive.setUservar(rive.currentUser(), "eventutcdate", eventutcdate);
            rive.setUservar(rive.currentUser(), "eventtime", eventtime);

            if (
              rive.getUservar(rive.currentUser(), "topic") ===
              "change_eventtime"
            ) {
              rive.setUservar(rive.currentUser(), "topic", "event_title");
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            } else if (
              rive.getUservar(rive.currentUser(), "topic") ===
              "change_reporttime"
            ) {
              rive.setUservar(rive.currentUser(), "topic", "report_about");
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            }

            break;
          case String(body.match(/^[1]{1}$/g)):
            break;

          default:
            if (rive.getUservar(rive.currentUser(), "menu") === "event") {
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            } else if (
              rive.getUservar(rive.currentUser(), "menu") === "report"
            ) {
              let reply = rive.reply(chatId, "подсказка");
              resolve(reply);
            }
        }
      });
    });

    rive.setSubroutine("null_uservars", function(rive, args) {
      console.log(
        ".setSubroutine(null_uservars>>>>>>>>>>" +
          JSON.stringify(rive.currentUser())
      );
      var chatId = rive.currentUser();
      rive.setUservar(chatId, "eventdate", undefined);
      rive.setUservar(chatId, "eventdate_album", undefined);
      rive.setUservar(chatId, "eventdate_hash", undefined);
      rive.setUservar(chatId, "eventtime", undefined);
      rive.setUservar(chatId, "eventutcdate", undefined);
      rive.setUservar(chatId, "hashtag", undefined);
      rive.setUservar(chatId, "lat", undefined);
      rive.setUservar(chatId, "long", undefined);
      rive.setUservar(chatId, "msg_about", undefined);
      rive.setUservar(chatId, "msg_title", undefined);
      rive.setUservar(chatId, "now_place", undefined);
      rive.setUservar(chatId, "region_now", undefined);
      rive.setUservar(chatId, "vk_aid", undefined);
      rive.setUservar(chatId, "vkalbum_link", undefined);
    });

    rive.setSubroutine("geolocation", function(rive, args) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(geolocation>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var chatId = rive.currentUser();
        rive.setUservar(chatId, "long", args[0].split(" ")[1]);
        rive.setUservar(chatId, "lat", args[0].split(" ")[0]);

        resolve(`Выбор местоположения: Широта:${rive.getUservar(chatId, "lat")} 
     и долгота:${rive.getUservar(chatId, "long")}`);
      });
    });
    rive.setSubroutine("contact_add", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(contact_add>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var chatId = rive.currentUser();
        fc.saveNewUserData(
          rive.getUservar(chatId, "social"),
          rive.getUservar(chatId, "social_id"),
          rive.getUservars(rive.getUservar(chatId, "social_id")),
          rive.getUservar(chatId, "group_id"),
          fc.hashtag_sex
        );
      });
    });
    rive.setSubroutine("send_to_admin", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_to_admin>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var msg;
        let chatId = rive.currentUser();
        tg.sendMessage(chatId)
          .then(res => resolve(`✔️`))
          .catch(err => reject(err));
      });
    });
    rive.setSubroutine("send_to_searchcomand", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_to_searchcomand>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );

        vk.boardCreateComment()
          .then(res => resolve(`✔️`))
          .catch(err => reject(err));

        vk.wallPost()
          .then(res => resolve(`✔️`))
          .catch(err => reject(err));
        os.sendNotif()
          .then(res => resolve(`✔️`))
          .catch(err => reject(err));
        tg.sendMessage()
          .then(res => resolve(`✔️`))
          .catch(err => reject(err));
      });
    });
    rive.setSubroutine("send_quest_geo", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_quest_geo>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        let chatId = rive.currentUser();
        if (rive.getUservar(chatId, "social") === "vk") {
          vk.sendLocation()
            .then(res => resolve(`✔️`))
            .catch(err => reject(err));
        } else if (rive.getUservar(chatId, "social") === "telegrambot") {
          tg.sendLocation()
            .then(res => resolve(`✔️`))
            .catch(err => reject(err));
        }
      });
    });
    rive.setSubroutine("send_notification", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_notification>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );

        vk.sendFromRive()
          .then(res => {
            console.log(
              "vk.sendFromRive()(res>>>>>>>>>>" + JSON.stringify(res)
            );
            if (res.response.post_id) {
              fc.post_link = res.response.post_id;
            }

            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
          })
          .catch(err => {
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
            reject(err);
          });
      });
    });
    rive.setSubroutine("send_report", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_report>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );

        vk.wallPostReport()
          .then(res => {
            console.log(`setSubroutine("send_report" RES ${res}`);
            fc.post_link = res.response.post_id;
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
          })
          .catch(err => {
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
            reject(err);
          });
      });
    });
    rive.setSubroutine("send_theft", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_theft>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );

        vk.wallPostReport()
          .then(res => {
            console.log(`setSubroutine("send_theft" RES ${res}`);
            fc.post_link = res.response.post_id;
            fc.album_link = process.env.VK_ALBUM_ID_THEFT;
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
          })
          .catch(err => {
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
            reject(err);
          });
      });
    });
    rive.setSubroutine("send_board", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(send_board>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );

        vk.boardCreateComment()
          .then(res => {
            console.log(
              `setSubroutine("send_board" RES ${JSON.stringify(res)}`
            );
            fc.board_link = res.response;
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
          })
          .catch(err => {
            fc.savePost()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
            reject(err);
          });
      });
    });
    rive.setSubroutine("save_data_new_user", function(rive) {
      return new rive.Promise(function(resolve, reject) {
        console.log(
          ".setSubroutine(save_data_new_user>>>>>>>>>>" +
            JSON.stringify(rive.currentUser())
        );
        var chatId = rive.currentUser();
        var arr_hi = [
          "Привет, друзья! Меня зовут ",
          "Привет, друзья! Мое имя ",
          "Здравствуйте! Меня зовут ",
          "Привет! Меня зовут ",
          "Привет всем велосипедистам! Мое имя ",
          "Привет всем велосипедистам! Меня зовут ",
          "Привет всем! Меня зовут "
        ];
        var arr_pri = [
          "Принимайте в свою дружную велокомпанию! ",
          "Примите в свое дружное велосообщество! ",
          "Принимайте в свою теплую велокомпанию! ",
          "Принимайте в свою дружную велосекту! "
        ];
        var arr_region = ["Мой район: ", "Проживаю в районе: "];
        var arr_temp = [
          "Любимый темп езды: ",
          "Люблю кататься со скоростью ",
          "Катаюсь со скоростью ",
          "Люблю покатушки со скоростью "
        ];
        var arr_like = [
          "Нравится кататься ",
          "Люблю кататься ",
          "Катаюсь ",
          "Люблю покатушки "
        ];
        var arr_model = [
          "Марка велосипеда: ",
          "Модель моего велосипеда: ",
          "Модель велосипеда: "
        ];
        var anketa = `${
          arr_hi[Math.floor(Math.random() * arr_hi.length)]
        }${rive.getUservar(chatId, "firstName")}. 
      ${arr_pri[Math.floor(Math.random() * arr_pri.length)]}
      ${
        arr_region[Math.floor(Math.random() * arr_region.length)]
      }${rive.getUservar(chatId, "region")}. 
      ${arr_temp[Math.floor(Math.random() * arr_temp.length)]}${rive.getUservar(
          chatId,
          "biketemp"
        )}км/ч. 
      ${arr_like[Math.floor(Math.random() * arr_like.length)]}${rive.getUservar(
          chatId,
          "wintertemp"
        )} и ${rive.getUservar(chatId, "raintemp")}. ${
          arr_model[Math.floor(Math.random() * arr_model.length)]
        }${rive.getUservar(chatId, "bikemodel")}`;
        var about_user = `Об авторе:\n${
          arr_region[Math.floor(Math.random() * arr_region.length)]
        }${rive.getUservar(chatId, "region")}. 
      ${arr_temp[Math.floor(Math.random() * arr_temp.length)]}${rive.getUservar(
          chatId,
          "biketemp"
        )}км/ч. 
      ${arr_like[Math.floor(Math.random() * arr_like.length)]}${rive.getUservar(
          chatId,
          "wintertemp"
        )} и ${rive.getUservar(chatId, "raintemp")}. ${
          arr_model[Math.floor(Math.random() * arr_model.length)]
        }${rive.getUservar(chatId, "bikemodel")}`;
        rive.setUservar(chatId, "anketa", anketa);
        rive.setUservar(chatId, "msgabout", about_user);
        let arr_hashtags = [
          rive.getVariable("hash_id_bike"),
          fc.hashtag_sex,
          rive.getUservar(chatId, "region"),
          rive.getUservar(chatId, "biketemp"),
          rive.getUservar(chatId, "wintertemp"),
          rive.getUservar(chatId, "raintemp"),
          rive.getUservar(chatId, "bikemodel")
        ];

        vk.newUser()
          .then(res => {
            console.log(JSON.stringify(res));

            fc.post_link = res.response.post_id;
            fc.saveUserData()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
          })
          .catch(err => {
            fc.saveUserData()
              .then(res => resolve(`✔️`))
              .catch(err => reject(err));
            reject(err);
          });
      });
    });
  } catch (error) {
    console.log(error);
  }
};
