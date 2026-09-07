/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */
import ws from 'k6/ws';
import { check, sleep } from 'k6';

// ================= НАСТРОЙКИ =================
const SERVER_HOST = '127.0.0.1:2379'; // Твой порт
// ВСТАВЬ СЮДА СВОЙ ВАЛИДНЫЙ БИЛЕТ ЦЕЛИКОМ (без ws://..., только payload-signature)
const VALID_TICKET = 'RAwearsPRADA:6:1786989639761-95e3a7292bb94d55a6b9e962de30912757ad79ecb79f5cb774de205c0665bef8'; 
// =============================================

export const options = {
  stages: [
    { duration: '20s', target: 1500 }, // Быстрый наплыв до 1500 ботов за 20 секунд
    { duration: '20s', target: 3000 }, // Дожимаем до 3000 ботов
    { duration: '1m', target: 3000 },  // 3000 ботов жестко спамят целую минуту
    { duration: '10s', target: 0 },    // Отключение
  ],
  noConnectionReuse: false, 
};

export default function () {
  const url = `ws://${SERVER_HOST}?ticket=${encodeURIComponent(VALID_TICKET)}`; 
  
  const params = {
    tags: { my_tag: 'msg_spam_3k' }
  };

  const res = ws.connect(url, params, function (socket) {
    // 1. Событие успешного открытия сокета
    socket.on('open', function open() {
      socket.setInterval(function timeout() {
        if (socket.readyState === 1) { // OPEN
          socket.send(JSON.stringify({
            type: 'new message', 
            data: {
              messageTarget: 1, 
              user: null, 
              nick: `Bot_Clone_${__VU}`,
              lastMessageTimestamp: Date.now() 
            }
          }));
        }
      }, 100); // Спамим каждые 100 мс
    });

    // 2. Событие ошибки (вынесено отдельно, как и должно быть)
    socket.on('error', function (e) {
      // Ошибки сокетов, если будут
    });

    // 3. Событие закрытия
    socket.on('close', function () {
      // Лог закрытия
    });
    
    // Автоматическое закрытие сокета через 2 минуты
    socket.setTimeout(function () {
      socket.close();
    }, 120000); 
  });

  // Проверяем статус 101 Authorized
  check(res, { 'status is 101 (Authorized)': (r) => r && r.status === 101 });
  
  sleep(1); 
}
