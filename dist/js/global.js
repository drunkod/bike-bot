const VK_ID_PUBLIC_OVER = process.env.VK_ID_PUBLIC_OVER;
const VK_ID_PUBLIC_BIKE = process.env.VK_ID_PUBLIC_BIKE;
const momenttz = require("moment-timezone");
const { DateTime } = require("luxon");
const EkbDateTime = DateTime.local().setZone("Asia/Yekaterinburg");
const VkBot = require("node-vk-bot-api");

module.exports = class Global {
  constructor(social, socialId, group_id, contextRive, bot) {
    this._social = social;
    this._chatId = socialId;
    this._group_id = group_id;
    this.rive = contextRive;
    this.bot = bot;
  }
  //to do валидация реферальных параметров
  //реферальные параметры vk.me/bike_overhear_chelyabinsk?ref=vk_12&ref_source=bot
  get ref_id() {
    return this.rive.getUservar(this.chatId, "ref_id");
  }
  //ref=vk_12
  set ref_id(ref_id) {
    if (ref_id.search("_") !== -1) {
      this.ref_social = ref_id.split("_")[0];
      this.rive.setUservar(this.chatId, "ref_id", Number(ref_id.split("_")[1]));
    } else {
      this.rive.setUservar(this.chatId, "ref_id", "undefined");
    }
  }
  get ref_social() {
    return this.rive.getUservar(this.chatId, "ref_social");
  }
  set ref_social(ref_social) {
    this.rive.setUservar(this.chatId, "ref_social", `${ref_social}`);
  }
  // ref_source=bot
  get ref_source() {
    return this.rive.getUservar(this.chatId, "ref_source");
  }
  set ref_source(ref_source) {
    this.rive.setUservar(this.chatId, "ref_source", `${ref_source}`);
  }
  get ref_name() {
    return this.rive.getUservar(this.chatId, "ref_name");
  }
  set ref_name(ref_name) {
    this.rive.setUservar(this.chatId, "ref_name", ref_name);
  }
  get ref_sex() {
    return this.rive.getUservar(this.chatId, "ref_sex");
  }
  set ref_sex(ref_sex) {
    this.rive.setUservar(this.chatId, "ref_sex", ref_sex);
  }
  get referal() {
    if (this.ref_id === "undefined") {
      return false;
    } else {
      return {
        source: this.ref_social,
        medium: this.ref_source,
        name: this.ref_name,
        id: this.ref_id,
        sex: this.ref_sex
      };
    }
  }

  get social() {
    return this._social;
  }
  set social(social) {
    this.rive.setUservar(this.chatId, "social", social);
  }
  get chatId() {
    return this._chatId;
  }
  get social_id() {
    return this._chatId;
  }
  set social_id(social_id) {
    this.rive.setUservar(this.chatId, "social_id", social_id);
  }
  get group_id() {
    return this._group_id;
  }
  set group_id(group_id) {
    this.rive.setUservar(this.chatId, "group_id", group_id);
  }
  set group_id(group_id) {
    this.rive.setUservar(this.chatId, "group_id", group_id);
  }
  get firstName() {
    return this.rive.getUservar(this.chatId, "firstName");
  }
  set firstName(firstName) {
    this.rive.setUservar(this.chatId, "firstName", firstName);
  }
  get lastName() {
    return this.rive.getUservar(this.chatId, "lastName");
  }
  set lastName(lastName) {
    this.rive.setUservar(this.chatId, "lastName", lastName);
  }
  get sex() {
    return this.rive.getUservar(this.chatId, "sex");
  }
  set sex(sex) {
    this.rive.setUservar(this.chatId, "sex", sex);
  }
  get photo_url() {
    return this.rive.getUservar(this.chatId, "photo_url");
  }
  set photo_url(name) {
    this.rive.setUservar(this.chatId, "photo_url", name);
  }
  get topic() {
    return this.rive.getUservar(this.chatId, "topic");
  }
  set topic(name) {
    this.rive.setUservar(this.chatId, "topic", name);
  }
  get Uservars() {
    return this.rive.getUservars(this.chatId);
  }
  set Uservars(data) {
    this.rive.setUservars(this.chatId, data);
  }
  get TYPE() {
    return this.rive.getUservar(this.chatId, "TYPE");
  }
  set TYPE(type) {
    this.rive.setUservar(this.chatId, "TYPE", type);
  }
  get menu() {
    return this.rive.getUservar(this.chatId, "menu");
  }
  set menu(name) {
    this.rive.setUservar(this.chatId, "menu", name);
  }

  get eventutcdate() {
    return this.rive.getUservar(this.chatId, "eventutcdate");
  }
  get vk_aid() {
    return this.rive.getUservar(this.chatId, "vk_aid");
  }
  set vk_aid(id) {
    this.rive.setUservar(this.chatId, "vk_aid", id);
  }
  set vkalbum_link(link) {
    this.rive.setUservar(this.chatId, "vkalbum_link", link);
  }

  // vk
  static init_vk_bot(public_type) {
    return new VkBot(this.getToken(public_type));
  }
  //to do вынести функцию в глобальную
  static getToken(public_type) {
    if (public_type === "bike") {
      return process.env.VK_TOKEN_PUBLIC_BIKE;
    } else if (public_type === "overhear") {
      return process.env.VK_TOKEN_PUBLIC_OVER;
    }
  }
  async save_referal_to_rive({ ref, ref_source }) {
    if (ref && ref_source) {
      //если присутствуют реферальные параметры
      this.ref_id = ref;
      this.ref_source = ref_source;
      const res = await this.bot.api("users.get", {
        user_ids: this.ref_id,
        fields: "photo_200,sex",
        access_token: this.bot.settings.token
      });
      let { first_name, last_name, photo_200, sex } = res.response[0];
      console.log(JSON.stringify("Реферал:" + first_name + last_name));

      //записываем имя и пол реферала

      this.ref_name = first_name + " " + last_name;
      this.ref_sex = sex;
      return true;
    } else {
      return false;
    }
  }

  async save_user_to_rive({ from_id }, social) {
    if (from_id) {
      const res = await this.bot.api("users.get", {
        user_ids: from_id,
        fields: "photo_200,sex",
        access_token: this.bot.settings.token
      });
      let { first_name, last_name, photo_200, sex } = res.response[0];
      console.log(JSON.stringify("Пользователь:" + first_name + last_name));
      //записываем имя и пол реферала

      this.firstName = first_name;
      this.lastName = last_name;
      this.photo_url = photo_200;
      this.sex = sex;
      this.social = social;
      this.social_id = this.social_id;
      this.group_id = this.group_id;
      return true;
    } else {
      return false;
    }
  }
  hashtags_template_social(
    hash_id_bike,
    hashtag_sex,
    region,
    biketemp,
    wintertemp,
    raintemp,
    bikemodel
  ) {
    switch (this.social) {
      case "vk":
        return `#все_анкеты@${hash_id_bike} #${region.replace(
          /\s/g,
          "_"
        )}@${hash_id_bike} #любимый_темп_${biketemp.replace(
          /\s/g,
          "_"
        )}@${hash_id_bike} #${wintertemp.replace(
          /\s/g,
          "_"
        )}@${hash_id_bike} #${raintemp.replace(
          /\s/g,
          "_"
        )}@${hash_id_bike} #${bikemodel.replace(/\s/g, "_")}@${hash_id_bike}`;
        break;
      case "tg":
        return `#все_анкеты ${hashtag_sex} #${region.replace(
          /\s/g,
          "_"
        )} #любимый_темп_${biketemp.replace(/\s/g, "_")} #${wintertemp.replace(
          /\s/g,
          "_"
        )} #${raintemp.replace(/\s/g, "_")} #${bikemodel.replace(/\s/g, "_")}`;
        break;
      case "fb":
        return `#все_анкеты ${hashtag_sex} #${region.replace(
          /\s/g,
          "_"
        )} #любимый_темп_${biketemp.replace(/\s/g, "_")} #${wintertemp.replace(
          /\s/g,
          "_"
        )} #${raintemp.replace(/\s/g, "_")} #${bikemodel.replace(/\s/g, "_")}`;
        break;
    }
  }

  temp_hashtag(type) {
    switch (type) {
      case "vk":
        switch (this.menu) {
          case "users":
            return `${this.emoji_sex} #${this.temp_name.replace(/\s/g, "_")}@${
              this.hash_id_bike
            }`;
          case "now":
            return `#${this.temp_name}@${this.hash_id_bike}`;
            break;
          case "event":
            return `#${this.temp_name}@${this.hash_id_bike} #${
              this.user_hashtag
            }@${this.hash_id_bike}`;
            break;
          case "report":
            return `#${this.temp_name}@${this.hash_id_overhear} #${
              this.user_hashtag
            }@${this.hash_id_overhear}`;
            break;
          default:
            return `#${this.temp_name}@${this.hash_id_bike} #${
              this.user_hashtag
            }@${this.hash_id_bike}`;
            break;
        }

      default:
        switch (this.menu) {
          case "now":
          case "tour":
            return `#${this.temp_name}`;
            break;
          default:
            return `#${this.temp_name} #${this.user_hashtag}`;
            break;
        }
        break;
    }
  }
  get hashtag_sex() {
    switch (this.sex) {
      case 1:
        return `новая участница`;
        break;
      case 2:
        return `новый участник`;
        break;
      default:
        return `новый участник`;
        break;
    }
  }
  get attach_imagelink() {
    switch (this.menu) {
      case "users":
        switch (this.sex) {
          case 1:
            return `photo-71008034_456239427`;
          case 2:
            return `photo-71008034_456239426`;
          default:
            return `photo-71008034_456239426`;
        }
      case "now":
        return `photo-71008034_456239434`;
      case "event":
        return `photo-71008034_456239431`;
      case "report":
        return `photo-71008034_456239433`;
      case "sos":
        return `photo-71008034_456239432`;
      default:
        break;
    }
  }
  get emoji_sex() {
    switch (this.sex) {
      case 1:
        return `🚴‍♀️`;
        break;
      case 2:
        return `🚴‍♂️`;
        break;
      default:
        return ``;
        break;
    }
  }
  get sign_vk() {
    switch (this.social) {
      case "vk":
        return `\n \n 👥 @id${this.social_id}(${this.firstName} ${
          this.lastName
        })`;
        break;
      case "tg":
        return `\n \n 👤 https://t.me/${this.social_id} - ${this.firstName} ${
          this.lastName
        }`;
        break;
      case "fb":
        return `\n \n 👥 https://www.facebook.com/${this.social_id} - ${
          this.firstName
        } ${this.lastName}`;
        break;
    }
  }
  get sign_tg() {
    switch (this.social) {
      case "vk":
        return `\n \n 👤 https://vk.com/id${this.social_id} - ${
          this.firstName
        } ${this.lastName}`;
        break;
      case "tg":
        return `\n \n 👤 https://t.me/${this.social_id} - ${this.firstName} ${
          this.lastName
        }`;
        break;
      case "fb":
        return `\n \n 👥 https://www.facebook.com/${this.social_id} - ${
          this.firstName
        } ${this.lastName}`;
        break;
    }
  }
  get sign_fb() {
    switch (this.social) {
      case "vk":
        return `\n \n 👤 https://vk.com/id${this.social_id} - ${
          this.firstName
        } ${this.lastName}`;
        break;
      case "tg":
        return `\n \n 👤 https://t.me/${this.social_id} - ${this.firstName} ${
          this.lastName
        }`;
        break;
      case "fb":
        return `\n \n 👥 https://www.facebook.com/${this.social_id} - ${
          this.firstName
        } ${this.lastName}`;
        break;
    }
  }
  get msg() {
    switch (this.menu) {
      case "quest_name1":
        return `🔍 #Ищу_компанию для участия в квесте: [club73768894|Фото-Квест 'Красивый Челябинск' - 16 или 23 сентября в 15:30 Рядом с памятником Курчатову, Ленина пр.86]\n\nℹ Об авторе: \n ${this.rive.getUservar(
          this.chatId,
          "msgabout"
        )}`;
        break;
      case "quest_name2":
        return `🔍 #Ищу_компанию для участия в квесте: [club73768894|Фото-Квест 'Красивый Челябинск' - 16 или 23 сентября в 15:30 Рядом с памятником Курчатову, Ленина пр.86]\n\nℹ Об авторе: \n ${this.rive.getUservar(
          this.chatId,
          "msgabout"
        )}`;
        break;
      case "quest_new_idea":
        return (
          "#Предложение #ПоКвесту " +
          this.rive.getUservar(this.chatId, "send_to_admin")
        );
        break;
      case "tour":
        return (
          "#Предложение #ПоВелоТуру " +
          this.rive.getUservar(this.chatId, "send_to_admin")
        );
        break;
      case "now":
      case "event":
        switch (this.rive.getUservar(this.chatId, "msg_about")) {
          case "не указано":
            return "Нет времени объяснять, присоединяйтесь! Будем рады веселой компании!";

          default:
            return this.rive.getUservar(this.chatId, "msg_about");
        }
      case "report":
        switch (this.rive.getUservar(this.chatId, "msg_about")) {
          case "не указано":
            return "Нет времени объяснять, но тут должно быть описание покатушки. Подскажите описание в комментариях...";

          default:
            return this.rive.getUservar(this.chatId, "msg_about");
        }
      case "sos":
      case "market":
      case "question":
      case "chat":
        return this.rive.getUservar(this.chatId, "msg_about");
        break;
      default:
        return false;
        break;
    }
  }
  get msg_full() {
    switch (this.menu) {
      case "quest_name1":
      case "quest_name2":
      case "quest_new_idea":
      case "tour":
        return this.msg;
        break;
      case "now":
        return `
        📍 Сейчас катаюсь в районе ${this.region}, 
        рядом с ${this.place}, ${this.msg}.
        ⏱ Планирую кататься в течении ${this.hours}час(а)(ов).

        ${this.contact}
        ______________________
        Хотите найти кто катается сейчас или катался недавно? 
        Используйте хэштеги для поиска по всей группе:
        ${this.hash_footer}`;
        break;
      case "users":
        return `
        ${this.rive.getUservar(this.chatId, "anketa")}

        ${this.contact}
        ______________________
        Хотите найти всех новых участников или схожих по интересам? 
        Используйте хэштеги для поиска по всей группе:
        ${this.hash_footer}`;
        break;
      case "event":
        return `
        📅 Дата: ${this.date} ⌚ Время: ${this.time}
        📍 Встречаемся в районе ${this.region}, рядом с ${this.place}.\n${
          this.title_quotes
        }\n${this.msg}.

        ${this.contact}
        ______________________
        Хотите найти все встречи или за определенную дату? 
        Используйте хэштеги для поиска по всей группе:
        ${this.date_hashtag} ${this.hash_footer}`;
        break;
      case "report":
        if (this.user_hashtag === "велотур") {
          return `
        📷 📅 Дата: ${this.date} ${this.title_quotes}\n\n${this.msg}.
        
        📷 Кидаем фото сюда: ${this.rive.getUservar(
          this.chatId,
          "vkalbum_link"
        )}
        или добавить фото с мобильного vk.com/albums-${this.rive.getVariable(
          "owner_id_overhear"
        )}
        ________________________________ 
        📱:Тебе повезло, что пропустил эту встречу! Ни в коем случае, не подписывайся на смс рассылку: https://vk.com/topic-71008034_30089813
        
        ______________________
        Хотите найти все отчеты об велотурах или за определенную дату? 
        Используйте хэштеги для поиска по всей группе:
        ${this.date_hashtag} ${this.hash_footer}`;
        } else {
          return `
        📷 📅 Дата: ${this.date} ${this.title_quotes}\n\n${this.msg}.\n
        📷 Кидаем фото сюда: ${this.rive.getUservar(
          this.chatId,
          "vkalbum_link"
        )}
        или добавить фото с мобильного vk.com/albums-${this.rive.getVariable(
          "owner_id_overhear"
        )}
        ______________________
        Хотите найти все отчеты или за определенную дату? 
        Используйте хэштеги для поиска по всей группе:
        ${this.date_hashtag} ${this.hash_footer}`;
        }
      case "sos":
        if (this.user_hashtag === "кража") {
          return `${this.title_quotes} ${this.msg}.
          Фото украденного велосипеда в альбоме: vk.com/album-90700964_215518892
          или с мобильного: vk.com/albums-${this.rive.getVariable(
            "owner_id_overhear"
          )}
          ℹ Об авторе: ${this.contact}
          ______________________
           Хотите найти все кражи?
           Используйте хэштеги для поиска по всей группе:
           ${this.hash_footer}`;
        } else {
          return `\n${this.title_quotes} ${this.msg}.\n\nℹ Об авторе:\n ${
            this.contact
          }\n\n
          ______________________
          Хотите найти все похожие посты? 
          Используйте хэштеги для поиска по всей группе:
          ${this.hash_footer}`;
        }
      case "market":
        return `\n${this.title_quotes} ${this.msg}.\n\nℹ Об авторе:\\n ${
          this.contact
        }`;
      case "question":
        return `\n${this.title_quotes} ${this.msg}.\n\nℹ Об авторе:\\n ${
          this.contact
        }`;
      default:
        return false;
    }
  }

  get hash_id_bike() {
    return this.rive.getVariable("hash_id_bike");
  }
  get hash_id_overhear() {
    return this.rive.getVariable("hash_id_overhear");
  }
  get hash_footer() {
    switch (this.menu) {
      case "users":
        return (
          this.temp_hashtag("vk") +
          " " +
          this.hashtags_template_social(
            this.rive.getVariable("hash_id_bike"),
            this.hashtag_sex,
            this.rive.getUservar(this.chatId, "region"),
            this.rive.getUservar(this.chatId, "biketemp"),
            this.rive.getUservar(this.chatId, "wintertemp"),
            this.rive.getUservar(this.chatId, "raintemp"),
            this.rive.getUservar(this.chatId, "bikemodel")
          ) +
          " #велосипед #ВелосипедКаждыйДень #Челябинск"
        );
        break;

      default:
        return (
          this.temp_hashtag("vk") +
          " #велосипед #ВелосипедКаждыйДень #Челябинск"
        );
    }
  }
  get mobile() {
    return this.rive.getUservar(this.chatId, "mobile");
  }
  get linkToMsg() {
    return `https://vk.me/id${this.chatId}`;
  }
  get contact() {
    if (this.mobile === "не указан") {
      return `☎ Для связи пишите в личные сообщения: ${this.linkToMsg} \n`;
    } else {
      return `☎ ${
        ["Контакт для связи: ", "Номер телефона: "][
          Math.floor(
            Math.random() * ["Контакт для связи: ", "Номер телефона: "].length
          )
        ]
      }${this.mobile} \n`;
    }
  }
  get geo() {
    return { lat: this.lat, long: this.long };
  }
  get lat() {
    return this.rive.getUservar(this.chatId, "lat");
  }
  get long() {
    return this.rive.getUservar(this.chatId, "long");
  }
  get type() {
    if (this.rive.getUservar(this._social_id, "TYPE") === "LEAD") {
      return "lead";
    } else {
      return this.menu;
    }
  }
  get region() {
    switch (this.menu) {
      case "question":
      case "market":
      case "users":
        return this.rive.getUservar(this.chatId, "region");
        break;
      case "now":
      case "event":
      case "report":
      case "sos":
        return this.rive.getUservar(this.chatId, "region_now");
        break;
      default:
        return false;
        break;
    }
  }
  get place() {
    switch (this.menu) {
      case "question":
      case "market":
      case "users":
        return this.rive.getUservar(this.chatId, "place");
        break;
      case "now":
      case "event":
      case "report":
      case "sos":
        return this.rive.getUservar(this.chatId, "now_place");
        break;
    }
  }
  get hours() {
    switch (this.menu) {
      case "now":
      case "event":
      case "report":
      case "sos":
        return this.rive.getUservar(this.chatId, "hours");

      default:
        return false;
    }
  }
  get action_button() {
    switch (this.menu) {
      case "question":
        return "ответить";
        break;
      case "now":
        return "присоединиться";
        break;
      case "event":
        return "пригласить";
        break;
      case "report":
        return "поделиться";
        break;
      case "market":
        return "купить";
        break;
      case "sos":
        return "помочь";
        break;
      case "chat":
        return "ответить";
        break;
      case "users":
        return "привет";
        break;
    }
  }
  get bike_model() {
    return this.rive.getUservar(this.chatId, "bikemodel");
  }
  get bike_rain() {
    return this.rive.getUservar(this.chatId, "raintemp");
  }
  get bike_temp() {
    return this.rive.getUservar(this.chatId, "biketemp");
  }
  get bike_winter() {
    return this.rive.getUservar(this.chatId, "wintertemp");
  }
  get title_quotes() {
    return `'${this.crop_title}'`;
  }
  get title() {
    switch (this.menu) {
      case "event":
      case "report":
      case "sos":
      case "market":
      case "question":
      case "chat":
        return this.crop_title;
        break;

      default:
        return false;
        break;
    }
  }
  get crop_title() {
    return this.rive.getUservar(this.chatId, "msg_title").substr(0, 30);
  }
  get likes() {
    return [this.user];
  }
  get user() {
    return {
      author: true,
      first_name: this.firstName,
      id: this.social_id,
      last_name: this.lastName,
      photo_url: this.photo_url,
      sex: this.sex,
      type_social: this.social
    };
  }
  get temp_name() {
    switch (this.menu) {
      case "question":
        return "вопрос";
        break;
      case "now":
        return "сейчас";
        break;
      case "event":
        return "встреча";
        break;
      case "report":
        return "отчет";
        break;
      case "market":
        return "маркет";
        break;
      case "sos":
        return "sos";
        break;
      case "chat":
        return "беседа";
        break;
      case "tour":
        return "велотур";
        break;
      case "users":
        return this.hashtag_sex;
        break;
      default:
        return "добавить в temp_name";
        break;
    }
  }

  get time() {
    switch (this.menu) {
      case "event":
      case "report":
        return this.rive.getUservar(this.chatId, "eventtime");
      default:
        return false;
    }
  }
  get startTime() {
    switch (this.menu) {
      case "event":
      case "report":
        return new Date(
          momenttz(this.rive.getUservar(this.chatId, "eventutcdate"))
            .tz("Asia/Yekaterinburg")
            .subtract(5, "h")
            .format()
        );
      default:
        return false;
    }
  }
  get date() {
    switch (this.menu) {
      case "event":
      case "report":
        return this.rive.getUservar(this.chatId, "eventdate");

      default:
        return false;
    }
  }
  get eventdate_album() {
    return `${this.rive.getUservar(this.chatId, "eventdate_album")}`;
  }
  get date_hashtag() {
    switch (this.menu) {
      case "event":
        return `${this.rive.getUservar(this.chatId, "eventdate_hash")}@${
          this.hash_id_bike
        }`;
      case "report":
        return `${this.rive.getUservar(this.chatId, "eventdate_hash")}@${
          this.hash_id_overhear
        }`;

      default:
        return false;
    }
  }
  get user_hashtag() {
    switch (this.menu) {
      case "event":
      case "report":
      case "sos":
      case "market":
      case "question":
        return this.rive.getUservar(this.chatId, "hashtag");
        break;
      case "chat":
        return "Велопокатушка";
        break;

      default:
        return false;
        break;
    }
  }
  get data_bot() {
    const userData = this.rive.getUservars(this.chatId);
    if (
      userData.__initialmatch__ &&
      userData.__lastmatch__ &&
      userData.__history__ &&
      userData.__last_triggers__
    ) {
      userData.__initialmatch__copy = userData.__initialmatch__;
      userData.__lastmatch__copy = userData.__lastmatch__;
      userData.__history__copy = userData.__history__;
      userData.__last_triggers__copy = userData.__last_triggers__;
    }
    delete userData.__initialmatch__;
    delete userData.__history__;
    delete userData.__lastmatch__;
    delete userData.__last_triggers__;
    return userData;
  }
  get from_group_id() {
    return this.group_id;
  }
  get vk_owner_id() {
    switch (this.menu) {
      case "quest_name1":
        return 73768894;
      case "quest_name2":
        return 73768894;
      case "users":
      case "now":
      case "event":
      case "sos":
        return VK_ID_PUBLIC_OVER;
      case "report":
        return VK_ID_PUBLIC_BIKE;
      case "market":
      case "question":
      case "chat":
        return VK_ID_PUBLIC_BIKE;
    }
  }
  get vk_topic_id() {
    switch (this.menu) {
      case "question":
        return 35857679;
        break;
      case "market":
        return 35857679;
        break;
      case "quest_name1":
        return 35779466;
        break;
      case "quest_name2":
        return 35779466;
        break;
    }
  }

  get newDate() {
    return new Date(EkbDateTime);
  }
  get timeStamp() {
    return new Date().getTime();
  }
};
