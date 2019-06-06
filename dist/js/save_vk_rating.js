//to do переделать в функцию,которая грузит token (статистику) в зависимости от типа группы
const admin = require("firebase-admin");
const { VK } = require("vk-io");
const { DateTime } = require("luxon");
const save_editor_rating = require("./save_editor_rating");
const update_widget_vk = require("./update_widget_vk");
const vk = new VK();

vk.setOptions({
  token:
    "6423f5516a73b74c31f82f8d47ccc6069ef00028fa347b6b766ace3157e83ad05f391bc7545afe4240a04" ||
    "53b007e5e32c059c0a8b6ebef3be94d98a6e91425d4ab201b0e0c7ef06dc44735a44371cb286ee890f8c1" ||
    "234b4a9024d92502aee129b1cba0685a7ac1b6f10a953e437918cd779c68e1f1ad5f0801361b9c9b3165e"
  // apiMode: "parallel_selected",
  // pollingGroupId: 90700964
});

const { collect, api } = vk;
var serviceAccount = require("./bike-chel-firebase-adminsdk-mcgva-ec4f6dcc7e.json");

const owner_id = -90700964;
const wall_counts = 300;
const start_time = DateTime.local()
  .startOf("month")
  .toSeconds();
const end_time = DateTime.local()
  .endOf("month")
  .toSeconds();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://bike-chel.firebaseio.com"
// });
var db = admin.firestore();
// db.settings({ timestampsInSnapshots: true });
const ratingRef = db.collection("rating");

const data_model = ({
  social,
  social_id,
  m_rating = 0,
  likes = 0,
  comments = 0,
  reposts = 0
}) => {
  return {
    type: "rating",
    user_id: social + "|" + social_id,
    [save_editor_rating.public_type()]: {
      years: {
        [save_editor_rating.year_title()]: {
          months: {
            [save_editor_rating.month_title()]: {
              vk: {
                rating: m_rating,
                likes: likes,
                comments: comments,
                reposts: reposts
              }
            }
          }
        }
      }
    }
  };
};

let month_social_rating = new Map();

const add_rating = ({ id, type, full_name, points }) => {
  function m_rating(type, points) {
    switch (type) {
      case "likes":
        return points;
      case "comments":
        return points;
      case "reposts":
        return points * 4;
    }
  }

  function get_rating(id, points, type) {
    return month_social_rating.get(id)
      ? month_social_rating.get(id)[save_editor_rating.public_type()].years[
          save_editor_rating.year_title()
        ].months[save_editor_rating.month_title()].vk.rating +
          m_rating(type, points)
      : m_rating(type, points);
  }
  function get_likes(id, points, type) {
    if (type === "likes") {
      return points;
    } else {
      return month_social_rating.get(id)
        ? month_social_rating.get(id)[save_editor_rating.public_type()].years[
            save_editor_rating.year_title()
          ].months[save_editor_rating.month_title()].vk.likes
        : 0;
    }
  }
  function get_comments(id, points, type) {
    if (type === "comments") {
      return points;
    } else {
      return month_social_rating.get(id)
        ? month_social_rating.get(id)[save_editor_rating.public_type()].years[
            save_editor_rating.year_title()
          ].months[save_editor_rating.month_title()].vk.comments
        : 0;
    }
  }
  function get_reposts(id, points, type) {
    if (type === "reposts") {
      return points;
    } else {
      return month_social_rating.get(id)
        ? month_social_rating.get(id)[save_editor_rating.public_type()].years[
            save_editor_rating.year_title()
          ].months[save_editor_rating.month_title()].vk.reposts
        : 0;
    }
  }

  month_social_rating.set(
    id,
    data_model({
      social: "vk",
      social_id: id,
      m_rating: get_rating(id, points, type),
      likes: get_likes(id, points, type),
      comments: get_comments(id, points, type),
      reposts: get_reposts(id, points, type)
    })
  );
};

const For_mergeRating = () => {
  // month_social_rating.forEach(({ m_rating, likes, comments, reposts }, key) => {
  //   mergeRating({
  //     id: key,
  //     m_rating: m_rating,
  //     likes: likes,
  //     comments: comments,
  //     reposts: reposts
  //   });
  // });
  mergeRating(month_social_rating);
  //сортировка по рейтингу
  const names_rating = [
    { label: "rating", title: "Короли рейтинга" },
    { label: "likes", title: "Короли лайков" },
    { label: "comments", title: "Короли комментариев" },
    { label: "reposts", title: "Короли репостов" }
  ];
  //перемешивание массива
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffleArray(names_rating);
  const random_name_rating =
    names_rating[Math.floor(Math.random() * names_rating.length)];

  console.log(
    "Короли рейтинга",
    [...month_social_rating]
      .sort((a, b) =>
        a[1][save_editor_rating.public_type()].years[
          save_editor_rating.year_title()
        ].months[save_editor_rating.month_title()].vk[
          random_name_rating.label
        ] ===
        b[1][save_editor_rating.public_type()].years[
          save_editor_rating.year_title()
        ].months[save_editor_rating.month_title()].vk[random_name_rating.label]
          ? 0
          : a[1][save_editor_rating.public_type()].years[
              save_editor_rating.year_title()
            ].months[save_editor_rating.month_title()].vk[
              random_name_rating.label
            ] >
            b[1][save_editor_rating.public_type()].years[
              save_editor_rating.year_title()
            ].months[save_editor_rating.month_title()].vk[
              random_name_rating.label
            ]
          ? -1
          : 1
      )
      .filter((n, i) => {
        return i === 0;
      })
  );
  let arr_update = [...month_social_rating];
  arr_update = [...month_social_rating]
    .sort((a, b) =>
      a[1][save_editor_rating.public_type()].years[
        save_editor_rating.year_title()
      ].months[save_editor_rating.month_title()].vk[
        random_name_rating.label
      ] ===
      b[1][save_editor_rating.public_type()].years[
        save_editor_rating.year_title()
      ].months[save_editor_rating.month_title()].vk[random_name_rating.label]
        ? 0
        : a[1][save_editor_rating.public_type()].years[
            save_editor_rating.year_title()
          ].months[save_editor_rating.month_title()].vk[
            random_name_rating.label
          ] >
          b[1][save_editor_rating.public_type()].years[
            save_editor_rating.year_title()
          ].months[save_editor_rating.month_title()].vk[
            random_name_rating.label
          ]
        ? -1
        : 1
    )
    .map((n, i) => n[1])
    .filter((n, i) => i < 3);
  update_widget_vk.appWidgetsUpdate(
    arr_update,
    save_editor_rating.public_type(),
    "vk",
    save_editor_rating.year_title(),
    save_editor_rating.month_title(),
    random_name_rating.title
  );
  console.log(
    "Короли лайков",
    [...month_social_rating].sort((a, b) =>
      a[1].likes === b[1].likes ? 0 : a[1].likes > b[1].likes ? -1 : 1
    )
  );
  console.log(
    "Короли комментариев",
    [...month_social_rating].sort((a, b) =>
      a[1].comments === b[1].comments
        ? 0
        : a[1].comments > b[1].comments
        ? -1
        : 1
    )
  );
  console.log(
    "Короли репостов",
    [...month_social_rating].sort((a, b) =>
      a[1].reposts === b[1].reposts ? 0 : a[1].reposts > b[1].reposts ? -1 : 1
    )
  );
};

let count_batch = 0;
let commitCounter = 0;
let batches = [];
batches[commitCounter] = db.batch();
//запись в базу данных
const mergeRating = async month_social_rating => {
  month_social_rating.forEach(({ m_rating, likes, comments, reposts }, key) => {
    if (count_batch <= 498) {
      batches[commitCounter].set(
        ratingRef.doc("vk|" + key),
        data_model({
          social: "vk",
          social_id: key,
          m_rating,
          likes,
          comments,
          reposts
        }),
        { merge: true }
      );
      count_batch = count_batch + 1;
    } else {
      count_batch = 0;
      commitCounter = commitCounter + 1;
      batches[commitCounter] = db.batch();
    }
  });
  for (var i = 0; i < batches.length; i++) {
    batches[i].commit().then(function() {
      console.count("wrote batch");
    });
  }
};

let count_iterations = 0;
let count_getResult = 0;

async function collectWallGet(params) {
  const collectStream = collect.wall.get(params);

  collectStream.on("error", console.error);

  collectStream.on("data", ({ total, percent, received, items }) => {
    // Information
    console.log("Total:", total);
    console.log("Percent:", percent);
    console.log("Received:", received);

    // console.log("Items:", items);
    likes(items);

    // .reduce((prev, next) => prev + next, 0)
  });

  collectStream.on("end", () => {
    console.log("Data received");
  });
}
let count_like = 0;
const arr_like_full = [];
const arr_like_uniq = new Set();
function collectLikesGetList(params) {
  const collectStream = collect.likes.getList(params);

  collectStream.on("error", console.error);

  collectStream.on("data", ({ total, percent, received, items }) => {
    // Information
    // console.log("Total:", total);
    // console.log("Percent:", percent);
    // console.log("Received:", received);

    // console.log("Items:", items);

    arr_like_full.push(...items);
    items.forEach(element => {
      arr_like_uniq.add(element.id);
    });

    // .reduce((prev, next) => prev + next, 0)
  });

  collectStream.on("end", () => {
    // console.log("Data received");
  });
  collectStream.then(res => {
    count_like = count_like + 1;
    // console.log("count_like" + count_like);
    if (count_like === count_iterations) {
      console.log("count_like finish>>>>>>>>>>>>");
      getResultLikes([...arr_like_uniq], arr_like_full);
    }
  });
}
let count_repost = 0;
const arr_repost_full = [];
const arr_repost_uniq = new Set();

async function WallGetReposts(params) {
  const res = await api.wall.getReposts(params);
  const items = await res.items;
  count_repost = count_repost + 1;
  // console.log("count_repost" + count_repost);
  //добавление в общий массив
  arr_repost_full.push(...items);
  //перебор массива с репостами
  items.forEach(element => {
    //репосты и другие паблики Не учитываются
    if (element.to_id > 0) {
      //добавление в уникальный массив
      arr_repost_uniq.add(element.to_id);
    }
  });

  if (count_repost === count_iterations) {
    console.log("count_repost finish>>>>>>>>>>>>");
    getResultRepost([...arr_repost_uniq], arr_repost_full);
  }
}
let comment_count = 0;
const arr_comment_full = [];
const arr_comment_uniq = new Set();

async function WallGetComments(params) {
  const res = await api.wall.getComments(params);
  const items = await res.items;

  comment_count = comment_count + 1;
  // console.log("comment_count" + comment_count);
  arr_comment_full.push(...items);
  items.forEach(element => {
    //репосты и другие паблики Не учитываются
    if (element.from_id > 0) {
      arr_comment_uniq.add(element.from_id);
    }
  });

  if (comment_count === count_iterations) {
    console.log("comment_count finish>>>>>>>>>>>>");
    getResultComment([...arr_comment_uniq], arr_comment_full);
  }
}
//1500 записей в год
try {
  collectWallGet({ owner_id: owner_id, count: wall_counts });
} catch (error) {
  console.log(error);
}

function likes(arr) {
  // let arr_test = arr.filter(post => {
  //   return post.date > start_time && post.date < end_time;
  // });
  // count_iterations = arr_test.length;
  let res = arr.map(post => {
    if (post.date > start_time && post.date < end_time) {
      collectLikesGetList({
        type: post.post_type,
        owner_id: post.owner_id,
        item_id: post.id,
        filter: "likes",
        extended: 1
      });
      WallGetReposts({
        owner_id: post.owner_id,
        post_id: post.id,
        count: 100
      });
      WallGetComments({
        owner_id: post.owner_id,
        post_id: post.id,
        count: 100
      });
      count_iterations++;
      // console.log("count_iterations" + count_iterations);
    }
  });
}

function getResultLikes(arr_uniq, arr_full) {
  let sorted_arr = [];
  arr_uniq.forEach(element => {
    // console.log(
    //   "id: " +
    //     element.id +
    //     " likes: " +
    //     arr_full.filter(item => item.id === element.id).length
    // );

    add_rating({
      id: arr_full.filter(item => item.id === element)[0].id,
      type: "likes",
      points: arr_full.filter(item => item.id === element).length
    });

    // mergeRating({
    //   id: arr_full.filter(item => item.id === element)[0].id,
    //   type: "likes",
    //   points: arr_full.filter(item => item.id === element).length
    // });
  });
  count_getResult++;

  if (count_getResult === 3) {
    For_mergeRating();
  }
}

async function getResultRepost(arr_uniq, arr_full) {
  let sorted_arr = [];
  try {
    let detailSet = await Promise.all(
      arr_uniq.map(async element => {
        const res = await api.users.get({ user_ids: element });
        const full_name = await (res[0].first_name + " " + res[0].last_name);
        return { full_name, id: element };
      })
    );
    detailSet.forEach(element => {
      // console.log(
      //   "id: " +
      //     element.id +
      //     " likes: " +
      //     arr_full.filter(item => item.id === element.id).length
      // );

      // console.log(full_name + JSON.stringify(res));

      add_rating({
        id: arr_full.filter(item => item.from_id === element.id)[0].from_id,
        type: "reposts",
        points: arr_full.filter(item => item.from_id === element.id).length
      });
    });
    count_getResult++;
  } catch (error) {
    console.log(error);
  }

  if (count_getResult === 3) {
    For_mergeRating();
  }
}

async function getResultComment(arr_uniq, arr_full) {
  let sorted_arr = [];
  try {
    let detailSet = await Promise.all(
      arr_uniq.map(async element => {
        const res = await api.users.get({ user_ids: element });
        const full_name = await (res[0].first_name + " " + res[0].last_name);
        return { full_name, id: element };
      })
    );
    detailSet.forEach(element => {
      // console.log(
      //   "id: " +
      //     element.id +
      //     " likes: " +
      //     arr_full.filter(item => item.id === element.id).length
      // );

      // console.log(full_name + JSON.stringify(res));

      add_rating({
        id: arr_full.filter(item => item.from_id === element.id)[0].from_id,
        type: "comments",
        points: arr_full.filter(item => item.from_id === element.id).length
      });
    });
    count_getResult++;
  } catch (error) {
    console.log(error);
  }

  //sort by likes ...c,b,a
  // function compare(a, b) {
  //   const genreA = a.comments;
  //   const genreB = b.comments;

  //   let comparison = 0;
  //   if (genreA > genreB) {
  //     comparison = -1;
  //   } else if (genreA < genreB) {
  //     comparison = 1;
  //   }
  //   return comparison;
  // }
  // sorted_arr = await sorted_arr.sort(compare);

  if (count_getResult === 3) {
    For_mergeRating();
  }
}
