//инициализация web hooka
//отправка редакторских новостей в Подслушано
//отправка сообщения на рассылку по выбранной группе
const admin_id = process.env.VK_ADMIN_ID;
const vk_id_public_over = process.env.VK_ID_PUBLIC_OVER;

const fetch = require("node-fetch");
const momenttz = require("moment-timezone");
const { DateTime } = require("luxon");
const EkbDateTime = DateTime.local().setZone("Asia/Yekaterinburg");
const { VK, Keyboard, WallAttachment } = require("vk-io");

const fireBase = require("./fireBase");
const save_editor_rating = require("./save_editor_rating");
const update_widget_vk = require("./update_widget_vk");
const newsletter = require("./newsletter");
module.exports = (rive, public_type) => {
  //to do вынести функцию Get token в конструктором Global
  function getToken(public_type) {
    switch (public_type) {
      case "bike":
        return process.env.VK_TOKEN_PUBLIC_BIKE;
      case "overhear":
        return process.env.VK_TOKEN_PUBLIC_OVER;
      case "admin":
        return process.env.VK_TOKEN_ADMIN;
    }
  }
  const vk = new VK();
  vk.setOptions({
    token: getToken(public_type),
    apiMode: "parallel_selected",
    webhookSecret: process.env.VK_IO_WEBHOOK_SECRET,
    webhookConfirmation: process.env.VK_IO_WEBHOOK_CONFIRMATION
  });

  const { updates, api } = vk;

  // Skip outbox message and handle errors
  updates.use(async (context, next) => {
    // if (context.is("wall_reply")) {
    //   await context.send(`
    // 	context wall_reply
    // `);
    // }
    // if (context.is("wall")) {
    //   await context.send(`
    // 	context wall
    // `);
    // }
    try {
      console.log(context);

      if (context.is("message") && context.isOutbox) {
        return;
      }
      await next();
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // // Auto repeat rules on chats / уведомление о правилах c клавиатурой
  updates.use(async (context, next) => {
    try {
      if (
        context.isChat &&
        context.isEvent &&
        context.is("chat_invite_user") &&
        context.senderType === "user"
      ) {
        let res = await api.users.get({
          user_ids: context.senderId
        });
        let { first_name } = res[0];
        let res2 = await context.send({
          message: `
        	Привет, [id${context.senderId}|${first_name}]!
          Уважайте спокойствие участников беседы и прочитайте #правила
        `,
          keyboard: Keyboard.keyboard([
            Keyboard.textButton({
              label: "The help",
              payload: {
                command: "help"
              }
            }),
            Keyboard.textButton({
              label: "The current date",
              payload: {
                command: "time"
              }
            }),
            [
              Keyboard.textButton({
                label: "Cat photo",
                payload: {
                  command: "cat"
                },
                color: Keyboard.PRIMARY_COLOR
              }),
              Keyboard.textButton({
                label: "Cat purring",
                payload: {
                  command: "purr"
                },
                color: Keyboard.PRIMARY_COLOR
              })
            ]
          ]),

          disable_mentions: 1
        });
        console.log(res2);

        // todo проверить работоспособность Через несколько лет
        // let res4 = await context.deleteMessage();
        // console.log(res4);
      }
      if (context.is("wall")) {
        await context.send(`
    	context wall
    `);
      }
      await next();
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // входящий комментарий
  // updates.on("comment", async (context, next) => {
  //   console.log(context);

  //   await next();
  // });

  const signer_id = context => {
    const wallAttach = context.getAttachments("wall")[0];
    if (Math.sign(wallAttach.authorId) === -1) {
      //когда запись из сообщества
      if (wallAttach.signerId === null) {
        return context.senderId;
      } else {
        return wallAttach.signerId;
      }
    } else {
      // console.log(wallAttach.copyHistoryAttachments[0]);

      if (wallAttach.copyHistory[0]) {
        //когда запись c текстом и записью с сообщества
        if (wallAttach.copyHistory[0].signerId !== null) {
          return wallAttach.copyHistory[0].signerId;
        } else {
          return context.senderId;
        }
      } else {
        //когда запись cо страницы пользователя
        return wallAttach.authorId;
      }
    }
  };
  const text_tosend = context => {
    const wallAttach = context.getAttachments("wall")[0];
    if (
      wallAttach.copyHistory[0] &&
      wallAttach.copyHistory[0].text !== null &&
      wallAttach.text !== null
    ) {
      return `${wallAttach.copyHistory[0].text}
          ______________________
          ${wallAttach.text}`;
    } else if (wallAttach.copyHistory[0] && wallAttach.text === null) {
      return wallAttach.copyHistory[0].text;
    } else if (
      wallAttach.copyHistory[0] &&
      wallAttach.copyHistory[0].text === null
    ) {
      return wallAttach.text;
    } else {
      if (wallAttach.text !== null) {
        return wallAttach.text;
      } else {
        return "";
      }
    }
  };
  // дата публикации поста
  const publish_date = message => {
    if (message.match(/([0-9]{1,2})$/) !== null) {
      return (
        Math.round(Date.now() * 0.001) +
        message.match(/([0-9]{1,2})$/)[0] * 3600
      );
    } else {
      return 0;
    }
  };
  // отправка ответа
  const send_reply = (context, json, error) => {
    if (error) {
      switch (error) {
        case "notWall":
          context.send(
            `Забыли отправить запись со стены?
           Нужна помощь? Спросите у администратора: ` +
              "http://vk.me/id" +
              admin_id
          );
          break;

        default:
          context.send(
            `Упс!) Ошибка! Пожалуйста обратитесь к администратору: ` +
              "http://vk.me/id" +
              admin_id
          );
          console.log(error);
          break;
      }
    } else if (json) {
      if (json.post_type === "postpone") {
        //разница времени считается
        context.send(`Спасибо!) Ваша запись будет опубликована через ${Math.round(
          momenttz.unix(json.tst).diff(momenttz(), "hours", true)
        )} час(ов). 
          Ссылка для редактора: ${json.link}`);
      } else if (json.post_type === "post") {
        context.send(`Спасибо!) Ваша запись опубликована тут: ${json.link}. `);
      } else if (json.type === "posts") {
        context.send(`Ваш рейтинг в этом месяце: ${json.m_rating}. `);
      }
    }
  };
  // бот отчета о1,о2,о3... отчет1,отчет2...
  updates.hear(
    /(^О([0-9]{0,2})?$)|(^о([0-9]{0,2})?$)|(^j([0-9]{0,2})?$)|(^отчет([0-9]{0,2})?$)|(^Отчет([0-9]{0,2})?$)/,
    async context => {
      //todo если в записи только линк статьи, вывод ошибки
      if (context.hasAttachments("wall")) {
        await context.send(`
            context wall ${signer_id(context)} ${text_tosend(context)}
          `);
        //проверка есть ли в истории запись?
        fireBase
          .getHistoryPost(
            "vk",
            context.getAttachments("wall")[0].authorId,
            context.getAttachments("wall")[0].id
          )
          .then(doc => {
            if (!doc.exists) {
              console.log(
                "Если не находит дубликат новости, то разрешает опубликовать!"
              );

              fetch("https://api.vk.com/method/execute.wall_to_group", {
                method: "post",
                headers: {
                  "Content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body:
                  "SENDER_ID_GROUP=" +
                  Math.abs(vk_id_public_over) +
                  "&user_id=" +
                  context.getAttachments("wall")[0].authorId +
                  "&post_id=" +
                  context.getAttachments("wall")[0].id +
                  "&publish_date=" +
                  publish_date(context.text) +
                  "&admin_id=" +
                  admin_id +
                  "&signer_id=" +
                  signer_id(context) +
                  "&text_tosend=" +
                  encodeURIComponent(
                    text_tosend(context).replace(
                      /((?:|^\s)(?:#)([a-zA-Zа-яА-Я\d]+))/gm,
                      ""
                    )
                  ) +
                  "&access_token=" +
                  getToken("admin") +
                  "&v=5.73"
              })
                .then(function(res) {
                  return res.json();
                })
                .then(function(json) {
                  console.log(json);
                  send_reply(context, json.response);
                  // сохранение рейтинга редактора
                  save_editor_rating
                    .saveRating("vk", context.senderId, "posts")
                    .then(function(res) {
                      send_reply(context, res);
                      // update_widget_vk.get_rating(
                      //   save_editor_rating.public_type(),
                      //   "editor",
                      //   save_editor_rating.year_title(),
                      //   save_editor_rating.month_title()
                      // );
                      //обновление виджета
                      update_widget_vk.get_rating(
                        save_editor_rating.public_type(),
                        "vk",
                        save_editor_rating.year_title(),
                        save_editor_rating.month_title()
                      );
                    })
                    .catch(error => {
                      send_reply(context, null, error);
                    });
                  // сохранение номера поста в базе
                  fireBase.saveHistoryPost(
                    "vk",
                    context.senderId,
                    context.getAttachments("wall")[0].authorId,
                    context.getAttachments("wall")[0].id
                  );
                })
                .catch(error => {
                  send_reply(context, null, error);
                });
            } else {
              console.log("Document data:", doc.data());
              //если запись была опубликована ранее
              const history_data = doc.data();
              let user_ids;
              if (history_data.user_id.search("|") !== -1) {
                user_ids = history_data.user_id.split("|")[1];
              } else {
                user_ids = history_data.user_id;
              }
              api.users
                .get({
                  user_ids
                })
                .then(res => {
                  let { first_name, last_name } = res[0];
                  context.send(
                    `Спасибо большое!) @id${user_ids}(${first_name} ${last_name}), уже опубликовал эту запись ранее.`
                  );
                })
                .catch(error => {
                  send_reply(context, null, error);
                });
            }
          })
          .catch(error => {
            send_reply(context, null, error);
          });
      } else if (
        context.hasForwards &&
        context.forwards[0].getAttachments("photo")
      ) {
        //если пересылаемое сообщение с фото
        let forwards = context.forwards[0];
        const senderId = forwards.senderId;
        const forwards_text = forwards.text || "";
        forwards = forwards.getAttachments("photo");
        console.log(forwards);
        let arr_photos_id = forwards.map(({ accessKey, ownerId, id }) => ({
          owner_id: ownerId,
          photo_id: id,
          access_key: accessKey
        }));
        //сохранение фотографий в сохранённые фото администратора
        vk.token = getToken("admin");
        vk.collect.executes("photos.copy", arr_photos_id).then(async res => {
          console.log(JSON.stringify(res.response));
          let string_attach = res.response.reduce(
            (acc, attach, i) =>
              acc +
              (i > 0 ? "," : "") +
              "photo" +
              String(admin_id + "_" + attach),
            ""
          );
          console.log(string_attach);
          // формирование подписи

          vk.token = getToken(public_type);
          const ResSenderId = await vk.api.users.get({
            user_ids: senderId
          });
          const signature =
            "&#128101; @id" +
            senderId +
            "(" +
            ResSenderId[0].first_name +
            " " +
            ResSenderId[0].last_name +
            ")";

          await Promise.all([
            // публикация на стене сообщества
            vk.api.wall
              .post({
                owner_id: vk_id_public_over,
                from_group: 1,
                message: `${forwards_text} 

                 ${signature}`,
                publish_date:
                  /\d+/.exec(context.text) !== null
                    ? EkbDateTime.plus({
                        hours: Number(/\d+/.exec(context.text)[0])
                      }).toSeconds()
                    : 0,
                attachments: string_attach,
                access_token: getToken("admin")
              })
              .then(res => {
                console.log(JSON.stringify(res));
              })
          ]);
          // context.send("Входящие приложения 😻", {
          //   attachment: string_attach
          // }),
          // context.send("Пересланые приложения 😻", {
          //   attachment: string_attach2
          // })
        });
      } else {
        //забыли отправить запись со стены?
        send_reply(context, null, "notWall");
      }
    }
  );

  updates.hear("/cat", async context => {
    await Promise.all([
      context.send("Wait for the uploads awesome 😻"),

      context.sendPhoto("http://lorempixel.com/400/200/cats/")
    ]);
  });
  //рассылка по сообществам в лс
  updates.hear(/send/gm, async context => {
    //Если сообщение пересланное
    if (context.is("message") && context.hasForwards) {
      console.log(context.forwards);
      console.log(context.getAttachments("photo", "poll"));
      let photo_attach_arr = context.getAttachments();

      let string_attach = photo_attach_arr.reduce(
        (acc, attach, i) => acc + (i > 0 ? "," : "") + String(attach),
        ""
      );
      let forwards = context.forwards[0];
      const forwards_text = forwards.text;
      forwards = forwards.getAttachments();
      console.log(forwards);
      let string_attach2 = forwards.reduce(
        (acc, attach, i) => acc + (i > 0 ? "," : "") + String(attach),
        ""
      );
      console.log(string_attach);
      console.log(string_attach2);

      await Promise.all([
        newsletter(string_attach + "," + string_attach2, forwards_text),
        context.send("Входящие приложения 😻", {
          attachment: string_attach
        }),
        context.send("Пересланые приложения 😻", {
          attachment: string_attach2
        })
      ]);
    } else if (context.is("message") && context.is("wall")) {
      //если сообщение с прикрепленной записи со стены
      console.log(context.forwards);
      console.log(context.getAttachments("photo", "poll"));
      let attach_arr = context.getAttachments();
      let wall_text = "";
      attach_arr.forEach(function(wall_attach) {
        wall_text = wall_text + wall_attach.text;
        console.log(wall_text);
      });
      let string_attach = attach_arr.reduce(
        (acc, attach, i) =>
          acc +
          (i > 0 ? "," : "") +
          String(
            attach
              .getAttachments()
              .reduce(
                (wall_acc, wall_attach, wall_i) =>
                  wall_acc + (wall_i > 0 ? "," : "") + String(wall_attach),
                ""
              )
          ),
        ""
      );

      // let string_attach2 = forwards.reduce(
      //   (acc, attach, i) => acc + (i > 0 ? "," : "") + String(attach),
      //   ""
      // );
      console.log(string_attach);
      // console.log(string_attach2);

      await Promise.all([
        newsletter(string_attach, wall_text),
        context.send("Входящие приложения 😻", {
          attachment: string_attach
        }),
        context.send("Пересланые приложения 😻", {
          attachment: string_attach2
        })
      ]);
    }
  });

  updates.hear(["/time", "/date"], async context => {
    await context.send(String(new Date()));
  });

  updates.hear(/^\/reverse (.+)/i, async context => {
    const text = context.$match[1];

    const reversed = text
      .split("")
      .reverse()
      .join("");

    await context.send(reversed);
  });

  const catsPurring = [
    "http://ronsen.org/purrfectsounds/purrs/trip.mp3",
    "http://ronsen.org/purrfectsounds/purrs/maja.mp3",
    "http://ronsen.org/purrfectsounds/purrs/chicken.mp3"
  ];

  updates.hear("/purr", async context => {
    const link = catsPurring[Math.floor(Math.random() * catsPurring.length)];

    await Promise.all([
      context.send("Wait for the uploads purring 😻"),

      context.sendAudioMessage(link)
    ]);
  });

  async function run() {
    await vk.updates.startWebhook({
      path: process.env.VK_IO_WEBHOOK_PATH,
      port: process.env.VK_IO_WEBHOOK_PORT
    });
    console.log(
      "Webhook server started at: " +
        process.env.VK_IO_WEBHOOK_PATH +
        ":" +
        process.env.VK_IO_WEBHOOK_PORT
    );
  }

  run().catch(console.error);
};
