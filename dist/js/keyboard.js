const { DateTime, Settings } = require("luxon");
Settings.defaultZoneName = "Asia/Yekaterinburg";
Settings.defaultLocale = "ru";
const EkbDateTime = DateTime.local();
const Markup = require("node-vk-bot-api/lib/markup");
const TEMPLATE_MENU_HELP = [Markup.button("Меню", "default"), Markup.button("Помощь", "default")]
// array with dates for event topics
const template_event = () => {
  let arr = [];
  let i;
  for (i = 0; i < 8; i++) {
    arr.push(
      EkbDateTime.plus({ day: i }).toFormat("dd-LL-yyyy ccc") +
        (i <= 1
          ? " (" + (EkbDateTime.plus({ day: i }).toRelativeCalendar() === 'today' ? 'сегодня': 'завтра') + ")"
          : "")
    );
  }
  return arr;
};
const arr_template_event = template_event();
// array with dates for report topics
const template_report = () => {
  let arr = [];
  let i;
  for (i = 7; i > -1; i--) {
    arr.push(
      EkbDateTime.minus({ day: i }).toFormat("dd-LL-yyyy ccc") +
        (i <= 1
          ? " (" + (EkbDateTime.minus({ day: i }).toRelativeCalendar() === 'today' ? 'сегодня': 'вчера') + ")"
          : "")
    );
  }
  return arr;
};
const arr_template_report = template_report();
module.exports = topic => {
  switch (topic) {






    
    
   
  
 case 'event_title':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'event_hashtag':
    return [

    [
Markup.button('утро', 'primary'),
 Markup.button('день', 'primary'),
 Markup.button('вечер', 'primary'),
    ],
 
    [
Markup.button('ночь', 'primary'),

 Markup.button('тур', 'primary'),

 Markup.button('поход', 'primary'),

    ],
 
    [
Markup.button('соревнование', 'primary'),

 Markup.button('квест', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'event_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'event_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'market_title':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'market_hashtag':
    return [

    [
Markup.button('куплю', 'primary'),
 Markup.button('продам', 'primary'),
 Markup.button('отдам', 'primary'),
    ],
 
    [
Markup.button('примуВдар', 'primary'),

 Markup.button('другое', 'primary'),

    ],
 
   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'market_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'market_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'menu':
    return [

    [
Markup.button('сейчас', 'positive'),
 Markup.button('создать встречу', 'primary'),
 Markup.button('📷 отчет', 'primary'),
    ],
 
    [
Markup.button('вопрос', 'primary'),

 Markup.button('куплю продам отдам', 'primary'),

    ],
 
    [
Markup.button('помогите sos', 'negative'),

 Markup.button('велоквест', 'primary'),

 Markup.button('велотур', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'now_time':
    return [

    [
Markup.button('1', 'primary'),
 Markup.button('2', 'primary'),
 Markup.button('3', 'primary'),
    ],
 
    [
Markup.button('4', 'primary'),

 Markup.button('5', 'primary'),

 Markup.button('6', 'primary'),

    ],
 
   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'now_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'now_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'question_title':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'question_hashtag':
    return [

    [
Markup.button('ремонт', 'primary'),
 Markup.button('выборВелосипеда', 'primary'),
 Markup.button('обновление', 'primary'),
    ],
 
    [
Markup.button('настройка', 'primary'),

 Markup.button('выборМаршрута', 'primary'),

    ],
 
    [
Markup.button('выборМагазина', 'primary'),

 Markup.button('другое', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'question_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'question_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_region':
    return [



   


        [ Markup.button('1', 'primary'), Markup.button('2', 'primary'), Markup.button('3', 'primary'), Markup.button('4', 'primary') ], [ Markup.button('5', 'primary'), Markup.button('6', 'primary'), Markup.button('7', 'primary'), Markup.button('8', 'primary') ], [Markup.button('9', 'primary'), Markup.button('10', 'primary') ],
        
    
        
     ];
       
   
  
  case 'region_1':
 case 'region_2':
 case 'region_3':
 case 'region_4':
 case 'region_5':
 case 'region_6':
 case 'region_7':
 case 'region_8':
 case 'region_9':
 case 'region_10':
 
 case 'region':
    return [



   


        [ Markup.button('1', 'primary'), Markup.button('2', 'primary'), Markup.button('3', 'primary'), Markup.button('4', 'primary') ], [ Markup.button('5', 'primary'), Markup.button('6', 'primary'), Markup.button('7', 'primary'), Markup.button('8', 'primary') ], [Markup.button('9', 'primary'), Markup.button('10', 'primary') ],
        
    
        
     ];
       
   
  
 case 'change_mobile':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_bikemodel':
    return [



   


        [Markup.button('БеруНапрокат', 'primary') ],  [Markup.button('Электро', 'primary'), Markup.button('Чоппер', 'primary'), Markup.button('Круизер', 'primary') ], [ Markup.button('ФэтБайк', 'primary'), Markup.button('Фикс', 'primary'), Markup.button('BMX', 'primary') ], [ Markup.button('GT', 'primary'), Markup.button('SPECIALIZED', 'primary'), Markup.button('MERIDA', 'primary'), Markup.button('CUBE', 'primary') ], [ Markup.button('MONGOOSE', 'primary'), Markup.button('JAMIS', 'primary'), Markup.button('NORCO', 'primary'), Markup.button('GIANT', 'primary') ], [ Markup.button('TREK', 'primary'), Markup.button('FORMAT', 'primary'), Markup.button('FORWARD', 'primary'), Markup.button('STELS', 'primary') ], [Markup.button('пропустить', 'primary') ], [Markup.button('menu', 'default') ]
        
    
        
     ];
       
   
  
 case 'change_route':
    return [

    [
Markup.button('Напомнить позже', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_style':
    return [

    [
Markup.button('Прогулки', 'primary'),
 Markup.button('Кросс кантри', 'primary'),
 Markup.button('Поход выходного дня', 'primary'),
    ],
 
    [
Markup.button('Даунхил Фрирайд', 'primary'),

 Markup.button('Шоссе', 'primary'),

 Markup.button('Длительные велопоходы', 'primary'),

    ],
 
    [
Markup.button('Рандоннёр', 'primary'),

 Markup.button('Трюковые и гравити', 'primary'),

 Markup.button('Трек', 'primary'),

 Markup.button('Эндуро', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_distance':
    return [

    [
Markup.button('затрудняюсь ответить/небольшие прогулки', 'primary'),
 Markup.button('0-10', 'primary'),
    ],
 
    [
Markup.button('10-20', 'primary'),

 Markup.button('20-40', 'primary'),

 Markup.button('40-60', 'primary'),

    ],
 
    [
Markup.button('60-80', 'primary'),

 Markup.button('80-100', 'primary'),

 Markup.button('100-150', 'primary'),

    ],
    
    [
Markup.button('150-200', 'primary'),

 Markup.button('200-300', 'primary'),

 Markup.button('300-1000', 'primary'),

    ],
 

            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_winter':
    return [

    [
Markup.button('зимой до минус 10 градусов', 'primary'),
 Markup.button('зимой до минус 15 градусов', 'primary'),
    ],
 
    [
Markup.button('зимой до минус 25 градусов', 'primary'),

 Markup.button('только летом', 'primary'),

    ],
 
    [
Markup.button('только весной летом и осенью', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_rain':
    return [

    [
Markup.button('после дождя', 'primary'),
 Markup.button('под летним дождем', 'primary'),
    ],
 
    [
Markup.button('под дождем', 'primary'),

 Markup.button('только в хорошую погоду', 'primary'),

    ],
 
   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_volunteer':
    return [

    [
Markup.button('в организации мероприятий', 'primary'),
 Markup.button('Онлайн активизм', 'primary'),
 Markup.button('Распространение листовок', 'primary'),
 Markup.button('Фотограф', 'primary'),
    ],
 
    [
Markup.button('Видеооператор', 'primary'),

 Markup.button('Монтаж видео', 'primary'),

 Markup.button('Графический дизайн', 'primary'),

 Markup.button('Вебдизайн', 'primary'),

    ],
 
    [
Markup.button('Проектирование', 'primary'),

 Markup.button('Архитектура и градостроительство', 'primary'),

 Markup.button('Музыкант', 'primary'),

 Markup.button('Ведущий на мероприятие', 'primary'),

    ],
    
    [
Markup.button('SMM', 'primary'),

 Markup.button('Программист', 'primary'),

 Markup.button('Спонсор', 'primary'),

 Markup.button('Распечатка промо-материалов', 'primary'),

    ],
 
    [
Markup.button('Поиск финансирования', 'primary'),

 Markup.button('Физическая помощь', 'primary'),

 Markup.button('Водитель', 'primary'),

 Markup.button('Не знаю', 'primary'),

    ],
 
            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_conversation':
    return [

    [
Markup.button('Только по существу встречи и сбора', 'primary'),
 Markup.button('Только Велотематика', 'primary'),
 Markup.button('Свободное общение', 'primary'),
 Markup.button('Все беседы', 'primary'),
    ],
 
    [
Markup.button('Не люблю беседы и чаты', 'primary'),

    ],
 
   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'change_verno':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'report_title':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'report_hashtag':
    return [

    [
Markup.button('утро', 'primary'),
 Markup.button('день', 'primary'),
 Markup.button('вечер', 'primary'),
    ],
 
    [
Markup.button('ночь', 'primary'),

 Markup.button('тур', 'primary'),

 Markup.button('поход', 'primary'),

    ],
 
    [
Markup.button('соревнование', 'primary'),

 Markup.button('квест', 'primary'),

    ],
    


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
    
    
   
  
 case 'report_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'report_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'sos_title':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'sos_hashtag':
    return [

    [
Markup.button('пробилколесо', 'primary'),
 Markup.button('проблемасцепью', 'primary'),
 Markup.button('настройка', 'primary'),
    ],
 
    [
Markup.button('кража', 'primary'),

 Markup.button('другое', 'primary'),

    ],
 
   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'sos_geo':
    return [



   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'sos_about':
    return [

    [
Markup.button('пропустить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'sos_send':
    return [

    [
Markup.button('отправить', 'primary'),
 Markup.button('изменить', 'primary'),
    ],
 

   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
   
  
 case 'tour':
    return [



   


            [Markup.button('Меню', 'default'),Markup.button('Помощь', 'default'),],
       
     ];
       
  






    case "change_eventdate":
      return [
        [
          Markup.button(arr_template_event[0], "primary"),
          Markup.button(arr_template_event[1], "primary")
        ],
        [
          Markup.button(arr_template_event[2], "primary"),
          Markup.button(arr_template_event[3], "primary"),
          Markup.button(arr_template_event[4], "primary")
        ],
        [
          
          Markup.button(arr_template_event[5], "primary"),
          Markup.button(arr_template_event[6], "primary"),
          Markup.button(arr_template_event[7], "primary")
        ],
        TEMPLATE_MENU_HELP
      ];
    case "change_reportdate":
      return [
        [
          Markup.button(arr_template_report[0], "primary"),
          Markup.button(arr_template_report[1], "primary"),
          Markup.button(arr_template_report[2], "primary")
        ],
        [
          
          Markup.button(arr_template_report[3], "primary"),
          Markup.button(arr_template_report[4], "primary"),
          Markup.button(arr_template_report[5], "primary")
        ],
        [
          Markup.button(arr_template_report[6], "primary"),
          Markup.button(arr_template_report[7], "primary")
        ],
        TEMPLATE_MENU_HELP
      ];
    case "change_eventtime":
    case "change_reporttime":
      return [
        [
          Markup.button("05:00", "primary"),
          Markup.button("06:00", "primary"),
          Markup.button("07:00", "primary"),
          Markup.button("08:00", "primary")
        ],
        [
          Markup.button("09:00", "primary"),
          Markup.button("10:00", "primary"),
          Markup.button("11:00", "primary"),
          Markup.button("12:00", "primary")
        ],
                [
          Markup.button("13:00", "primary"),
          Markup.button("14:00", "primary"),
          Markup.button("15:00", "primary"),
          Markup.button("16:00", "primary")
        ],
        [
          Markup.button("17:00", "primary"),
          Markup.button("18:00", "primary"),
          Markup.button("19:00", "primary"),
          Markup.button("20:00", "primary")
        ],
        [
          Markup.button("21:00", "primary"),
          Markup.button("22:00", "primary"),
          Markup.button("23:00", "primary"),
          Markup.button("00:00", "primary")
        ],
        TEMPLATE_MENU_HELP
      ];
      

    //custom topics
    // case "topic_name":
    //   return [
    //     TEMPLATE_MENU_HELP
    //   ];
    default:
    return [TEMPLATE_MENU_HELP
    ];
  }
};