const firebaseadmin = require("firebase-admin");
let serviceAccount = require("./Bikechel-a031ac7e88bd.json");

// firebase init goes here
firebaseadmin.initializeApp({
  credential: firebaseadmin.credential.cert(serviceAccount)
});
console.log("init firebaseadmin");
// firebase utils
const db = firebaseadmin.firestore();
const auth = firebaseadmin.auth();
const currentUser = auth.currentUser;
const { FieldValue } = firebaseadmin.firestore;

// date issue fix according to firebase
// const settings = {
//   timestampsInSnapshots: true
// };
// db.settings(settings);

// firebase collections
const ratingCollection = db.collection("rating");
const history_postCollection = db.collection("history_post");
const likes_postCollection = db.collection("likes");
const nowCollection = db.collection("now");
const eventCollection = db.collection("event");
const usersCollection = db.collection("users");
const botCollection = db.collection("bot");
const reportCollection = db.collection("report");
const sosCollection = db.collection("sos");
const marketCollection = db.collection("market");
const questionCollection = db.collection("question");
const routesCollection = db.collection("routes");

module.exports = {
  db,
  FieldValue,
  auth,
  currentUser,
  nowCollection,
  usersCollection,
  botCollection,
  eventCollection,
  reportCollection,
  sosCollection,
  marketCollection,
  questionCollection,
  routesCollection,
  ratingCollection,
  history_postCollection,
  likes_postCollection
};
