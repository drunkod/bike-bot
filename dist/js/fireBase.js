const {
  db,
  auth,
  currentUser,
  nowCollection,
  usersCollection,
  eventCollection,
  reportCollection,
  sosCollection,
  marketCollection,
  questionCollection,
  routesCollection,
  ratingCollection,
  history_postCollection,
  likes_postCollection
} = require("./firebaseConfig.js");
const momenttz = require("moment-timezone");
const Global = require("./global");

// const firebaseadmin = require("firebase-admin");
// let serviceAccount = require("./Bikechel-a031ac7e88bd.json");

// firebaseadmin.initializeApp({
//   credential: firebaseadmin.credential.cert(serviceAccount)
// });
// const db = firebaseadmin.firestore();
// db.settings({ timestampsInSnapshots: true });
module.exports = class fireBase extends Global {
  constructor(social, socialId, group_id, contextRive, bot) {
    super(social, socialId, group_id, contextRive, bot);

    // this.ratingRef = db.collection("rating");
    // this.historyPostRef = db.collection("history_post");
    // this.usersRef = db.collection("users");
    // this.likesRef = db.collection("likes");
    // this.nowRef = db.collection("now");
    // this.eventRef = db.collection("event");
    // this.reportRef = db.collection("report");
    // this.sosRef = db.collection("sos");
    // this.questionRef = db.collection("question");
    // this.marketRef = db.collection("market");
    // this.routesRef = db.collection("routes");
  }
  // аунтификация профиля
  get email() {
    return `${super.social_id}@${super.social}.com`;
  }
  get uid() {
    return `${super.social}|${super.social_id}`;
  }
  async createAuthUser() {
    const user = await auth.createUser(this.auth_data_lead);
    console.log("User created", user);
    let { customClaims } = this.auth_data_lead;
    if (customClaims) {
      console.log(
        "Updating user " + user.uid + " with custom claims",
        customClaims
      );
      await auth.setCustomUserClaims(user.uid, customClaims);
    }

    return user;
  }

  async updateAuthUser() {
    const user = await auth.updateUser(this.uid, this.auth_data_lead);
    console.log("Updating user", user);
    let { customClaims } = this.auth_data_lead;
    if (customClaims) {
      console.log(
        "Updating user " + user.uid + " with custom claims",
        customClaims
      );
      await auth.setCustomUserClaims(user.uid, customClaims);
    }

    return user;
  }

  async generateSignInWithEmailLink() {
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for
      // this URL must be whitelisted in the Firebase Console.
      // url: 'https://bike-chel.firebaseapp.com/?email='+ usremail,
      url:
        "http://" +
        process.env.FB_URL_ACTION_CODE_SETTINGS +
        "/?email=" +
        this.email+ "&topic=" + super.topic,
      // This must be true for email link sign-in.
      handleCodeInApp: true
      //   iOS: {
      //     bundleId: 'com.example.ios'
      //   },
      //   android: {
      //     packageName: 'com.example.android',
      //     installApp: true,
      //     minimumVersion: '12'
      //   },
      //   // FDL custom domain.
      //   dynamicLinkDomain: 'coolapp.page.link'
    };
    const link = await auth.generateSignInWithEmailLink(
      this.email,
      actionCodeSettings
    );
    console.log("generateSignInWithEmailLink", link);
    super.change_route_link = link;
  }

  static getIncrement(count) {
    console.log("setIncrement");

    console.log(count);

    const increment = firebaseadmin.firestore.FieldValue.increment(count);
    return increment;
  }
  async addVkLink() {
    try {
      console.log("this.ref!" + this.ref);
      const res = await this.ref.add(this.data_db);
      const post_id = await res.id;
      const res2 = await this.saveLike(post_id);
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }
  async savePost() {
    console.log(
      super.social + "|" + super.social_id + JSON.stringify(this.data_db)
    );
    console.log("this.ref!" + this.ref);
    const res = await this.ref.add(this.data_db);
    const post_id = await res.id;
    const res2 = await this.saveLike(post_id);
    console.log("Document successfully written!");
    return res2;
  }
  async saveLike(post_id) {
    const res = await likes_postCollection
      .doc(super.social + "|" + super.chatId + "|" + super.type + "|" + post_id)
      .set(this.data_likes(post_id));
  }
  static async setRating({ social, social_id, data_model, merge }) {
    console.log("setRating");

    console.log(social, social_id);

    const res = await ratingCollection
      .doc(social + "|" + social_id)
      .set(data_model, { merge });
    return res;
  }
  static async sortRatingMonth(
    public_type,
    rating_type,
    year_title,
    month_title
  ) {
    const res = await ratingCollection
      .orderBy(
        public_type +
          ".years." +
          year_title +
          ".months." +
          month_title +
          "." +
          rating_type +
          ".rating",
        "desc"
      )
      .limit(3)
      .get();
    return res;
  }
  static async getRating(social, social_id, type) {
    const res = await ratingCollection.doc(social + "|" + social_id).get();
    return res;
  }
  static async saveHistoryPost(social, sender_id, author_id, post_id) {
    console.log("saveHistoryPost");

    console.log(social, sender_id, author_id, post_id);

    const res = await history_postCollection
      .doc(social + "|" + author_id + "|" + post_id)
      .set(fireBase.data_history_post(social, sender_id));
    return res;
  }
  static async getHistoryPost(social, sender_id, post_id) {
    const res = await history_postCollection
      .doc(social + "|" + sender_id + "|" + post_id)
      .get();
    return res;
  }
  async saveUserData() {
    try {
      console.log(
        super.social + "|" + super.social_id + JSON.stringify(this.data_user)
      );
      const res = await usersCollection
        .doc(super.social + "|" + super.social_id)
        .set(this.data_user);
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }
  async saveLeadData() {
    try {
      console.log(
        super.social + "|" + super.social_id + JSON.stringify(this.data_lead)
      );
      const res = await usersCollection
        .doc(super.social + "|" + super.social_id)
        .set(this.data_lead);
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }

  async getUserData() {
    const res = await usersCollection
      .doc(super.social + "|" + super.social_id)
      .get();
    return res;
  }

  data_likes(post_id) {
    return {
      tst: {
        create: super.newDate,
        time_stamp: super.timeStamp
      },
      user: super.user,
      type: super.type,
      id: post_id,
      title: super.title,
      msg: super.msg,
      link: this.link
    };
  }
  get data_db() {
    return {
      type: super.type,
      tst: {
        create: super.newDate,
        time: super.time,
        start: super.startTime,
        date: super.date,
        hours: super.hours,
        end: this.endDate,
        time_stamp: super.timeStamp
      },
      msg: super.msg,
      title: super.title,
      geo: super.geo,
      hashtags: {
        bike: "велосипед",
        city: "Челябинск",
        temp_name: super.temp_name,
        region: super.region,
        place: super.place,
        user_hashtag: super.user_hashtag,
        action_button: super.action_button
      },
      user: super.user,
      likes: super.likes,
      link: this.link
    };
  }
  get data_user() {
    return {
      type: super.type,
      tst: {
        create: super.newDate,
        time_stamp: super.timeStamp
      },
      geo: super.geo,
      hashtags: {
        user: {
          first_name: super.firstName,
          id: super.social_id,
          last_name: super.lastName,
          photo_url: super.photo_url,
          sex: super.sex,
          city: "Челябинск",
          mobile: super.mobile,
          region: super.region,
          place: super.place,
          data_bot: super.data_bot
        },
        bike: {
          from_group_id: super.from_group_id,
          bike: "велосипед",
          temp_name: super.temp_name,
          action_button: super.action_button,
          model: super.bike_model,
          rain: super.bike_rain,
          speed: super.bike_temp,
          winter: super.bike_winter
        }
      },
      likes: super.likes,
      link: this.link,
      referal: super.referal
    };
  }
  get data_lead() {
    return {
      type: super.type,
      tst: {
        create: super.newDate,
        time_stamp: super.timeStamp
      },
      hashtags: {
        user: {
          first_name: super.firstName,
          id: super.social_id,
          last_name: super.lastName,
          photo_url: super.photo_url,
          sex: super.sex,
          city: "Челябинск",
          data_bot: super.data_bot
        },
        bike: {
          from_group_id: super.from_group_id,
          bike: "велосипед"
        }
      },
      likes: super.likes,
      referal: super.referal
    };
  }
  get auth_data_lead() {
    return {
      uid: this.uid,
      email: this.email,
      emailVerified: true,
      displayName: super.firstName + " " + super.lastName,
      photoURL: super.photo_url,
      disabled: false,
      customClaims: {
        first_name: super.firstName,
        id: super.social_id,
        last_name: super.lastName,
        social: super.social,
        sex: super.sex,
        city: "Челябинск",
        referal: super.referal
      }
    };
  }
  get link() {
    return {
      post: this.post_link,
      photo: this.photo_link,
      album: this.album_link,
      board: this.board_link
    };
  }
  set post_link(post_id) {
    this._post_link = "https://vk.com/wall" + super.vk_owner_id + "_" + post_id;
  }
  get post_link() {
    if (this._post_link) {
      return this._post_link;
    } else {
      return "https://vk.com/wall" + super.vk_owner_id;
    }
  }
  set photo_link(photo_id) {
    this._photo_link =
      "https://vk.com/photo" + super.vk_owner_id + "_" + photo_id;
  }
  get photo_link() {
    if (this._photo_link) {
      return this._photo_link;
    } else {
      return false;
    }
  }
  set album_link(album_id) {
    this._album_link =
      "https://vk.com/album" + super.vk_owner_id + "_" + album_id;
  }
  get album_link() {
    if (this._album_link) {
      return this._album_link;
    } else {
      return false;
    }
  }

  set board_link(id) {
    this._board_link =
      "https://vk.com/topic" +
      super.vk_owner_id +
      "_" +
      super.vk_topic_id +
      "?post=" +
      id;
  }
  get board_link() {
    if (this._board_link) {
      return this._board_link;
    } else {
      return false;
    }
  }

  get endDate() {
    if (this.hours) {
      switch (super.menu) {
        case "event":
        case "report":
          return new Date(
            momenttz(super.eventutcdate)
              .tz("Asia/Yekaterinburg")
              .subtract(5, "h")
              .add(this.hours, "h")
              .format()
          );
        default:
          return new Date(
            momenttz()
              .tz("Asia/Yekaterinburg")
              .add(this.hours, "hours")
              .format()
          );
      }
    } else {
      return false;
    }
  }

  static data_history_post(social, sender_id) {
    return {
      type: "history_post",
      tst: {
        create: new Date(
          momenttz()
            .tz("Asia/Yekaterinburg")
            .format()
        )
      },
      user_id: sender_id,
      social_type: social
    };
  }
  get ref() {
    switch (super.menu) {
      case "users":
        return usersCollection;
        break;
      case "now":
        return nowCollection;
        break;
      case "event":
        return eventCollection;
        break;
      case "report":
        return reportCollection;
        break;
      case "sos":
        return sosCollection;
        break;
      case "question":
        return questionCollection;
        break;
      case "market":
        return marketCollection;
        break;
    }
  }
};
