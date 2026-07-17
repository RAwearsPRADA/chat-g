import crypto from 'crypto';
import { performance } from 'perf_hooks';

const ITERATIONS = 10000;
const SECRET = 'super_secret_key_for_benchmark';
const PAYLOAD = { nick: 'user_test_name', id: 123456 };

// === 1. Генерируем билет (как это сделает HTTP-сервер авторизации) ===
const expiresAt = Date.now() + 60000;
const hmacString = `${PAYLOAD.nick}:${PAYLOAD.id}:${expiresAt}`;
const hmacSignature = crypto.createHmac('sha256', SECRET).update(hmacString).digest('hex');
const hmacTicket = `${hmacString}:${hmacSignature}`;

console.log(`🏁 Запуск нативного C++ бенчмарка на ${ITERATIONS} проверок...\n`);

// === 2. Замер производительности ===
const startHmac = performance.now();
let hmacSuccess = 0;

for (let i = 0; i < ITERATIONS; i++) {
    try {
        // Парсим строку билета (ровно так, как будет в uWS upgrade)
        const [nick, idStr, expiresAtStr, incomingSignature] = hmacTicket.split(':');
        
        // Быстрая проверка времени жизни билета
        if (Date.now() > Number(expiresAtStr)) continue;

        // Вычисляем хэш на уровне С++ (OpenSSL)
        const expectedPayload = `${nick}:${idStr}:${expiresAtStr}`;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET)
            .update(expectedPayload)
            .digest('hex');

        // Сверяем подписи
        if (incomingSignature === expectedSignature) {
            hmacSuccess++;
        }
    } catch (e) {
        // Защита от кривой строки
    }
}

const endHmac = performance.now();
const totalTime = endHmac - startHmac;

console.log(`🚀 Нативный HMAC (OpenSSL / C++ под капотом):`);
console.log(`   Суммарное время на все 10k: ${totalTime.toFixed(2)} мс`);
console.log(`   Среднее время на 1 проверку: ${(totalTime / ITERATIONS).toFixed(4)} мс\n`);
console.log(`Успешно проверено билетов: ${hmacSuccess} из ${ITERATIONS}`);
