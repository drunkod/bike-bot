const { VK } = require("vk-io");
const { DateTime } = require("luxon");
const vk = new VK();
// рассылка сообщение по определенному сообществу
// to do функцию выбора токена в зависимости от сообщества
// to do сделать фильтр кому можно рассылать сообщения в зависимости от базы данных
module.exports = (attachments, message_to_all) => {
  vk.setOptions({
    token:
      "234b4a9024d92502aee129b1cba0685a7ac1b6f10a953e437918cd779c68e1f1ad5f0801361b9c9b3165e" ||
      "d301b92c97fd1bc043e9c7aaae1392cf6e4fe4a01f0c37e8d7aba210fc3208fe25e5584f39f60e279aad9" ||
      "9ed26c0ba9c6a789c05b2705a572e246a68d3982e64a654b7b005f9eef788fb2e231ea13c1881b31dd4db" //тест группа
    // apiMode: "parallel_selected",
    // pollingGroupId: 90700964, 71008034
  });

  const { collect } = vk;

  const wall_counts = 1500;

  let messages_to_user = [];
  let items = new Map();
  // создание массива тем кому можно отправлять рассылку
  const add_item = arr => {
    arr.forEach(({ conversation }) => {
      items.set(conversation.peer.id, {
        can_write: conversation.can_write.allowed
      });
    });
  };
  const add_message = ({ arr, attachment, message }) => {
    messages_to_user = arr
      //проверка кому можно отправлять рассылку
      .filter(({ id }) =>
        items.get(id) && id === 49915409 ? items.get(id).can_write : false
      )
      //название массива с сообщениями для отправки
      .map(({ id, first_name }) => {
        return {
          peer_id: id,
          random_id: id + DateTime.local().toMillis(),
          message: `❄ Добрый день, ${first_name}, с новым 2019!🎄 
          ${message || ""}`,
          attachment
        };
      });
    collect.executes("messages.send", messages_to_user).then(res => {
      console.log(JSON.stringify(res));
    });
  };
  //получение массива с диалогами от сообщества
  async function collectGetConversations(params, attachment, message) {
    const collectStream = collect.messages.getConversations(params);

    collectStream.on("error", console.error);

    collectStream.on(
      "data",
      ({ total, percent, received, items, profiles }) => {
        // Information
        console.log("Total:", total);
        console.log("Percent:", percent);
        console.log("Received:", received);

        // console.log("Items:", items);
        add_item(items);
        // console.log("profiles:", profiles);
        add_message({
          arr: profiles,
          attachment,
          message
        });
      }
    );

    collectStream.on("end", () => {
      console.log("Data received");
    });
  }

  //1500 записей в год
  try {
    collectGetConversations(
      {
        //   group_id: owner_id,
        count: wall_counts,
        extended: 1
      },
      attachments,
      message_to_all
    );
  } catch (error) {
    console.log(error);
  }
};
