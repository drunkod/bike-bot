// инициализация и загрузка бота
const RiveScript = require("rivescript");
const error_handler = require("./error");
const vk_io = require("./vk_io");
const vk_init = require("./node_vk_bot_api");
const rive = new RiveScript({ utf8: true, debug: true });
rive.unicodePunctuation = new RegExp(/[!?;]/g);

// rive
//   .loadDirectory("./dist/rive")
//   .then(() => {
//     rive.sortReplies();
//     console.log("riveBrain loaded!");
//     vk_init(rive);
//   })
//   .catch(error_handler);
//загрузка Бота из файла в директории
rive.loadDirectory("./dist/rive", loading_done, error_handler);
function loading_done(batch_num) {
  console.log("Batch #" + batch_num + " has finished loading!");

  rive.sortReplies();
  //загрузка Веб хука
  vk_io(rive, "bike");
  // console.log(adminId);

  //загрузка бота стрима
  // vk_init(rive, "bike");
  // vk_init(rive, "overhear");
}
