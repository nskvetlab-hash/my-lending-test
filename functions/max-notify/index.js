// Yandex Cloud Function: принимает заявку с сайта и пересылает её в MAX через MAX Bot API.
//
// Требуемые переменные окружения (задаются в консоли Yandex Cloud, НЕ в коде):
//   MAX_BOT_TOKEN — токен бота, выданный @MasterBot в MAX
//   MAX_USER_ID   — ваш числовой user_id в MAX (куда слать уведомления)
//
// Деплой: см. functions/max-notify/README.md

const MAX_API_URL = 'https://platform-api2.max.ru/messages';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_json' });
  }

  // Honeypot: если скрытое поле заполнено — это бот, тихо отвечаем "успехом", ничего не отправляем.
  if (data['bot-field']) {
    return jsonResponse(200, { ok: true });
  }

  const name = String(data.name || '').trim();
  const contact = String(data.contact || '').trim();
  const projectType = String(data['project-type'] || 'Не знаю').trim();

  if (!name || !contact) {
    return jsonResponse(400, { ok: false, error: 'missing_fields' });
  }

  const token = process.env.MAX_BOT_TOKEN;
  const userId = process.env.MAX_USER_ID;

  if (!token || !userId) {
    return jsonResponse(500, { ok: false, error: 'server_not_configured' });
  }

  const text =
    'Новая заявка с сайта\n' +
    `Имя: ${name}\n` +
    `Контакт: ${contact}\n` +
    `Тип проекта: ${projectType}`;

  try {
    const maxResponse = await fetch(`${MAX_API_URL}?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ text }),
    });

    if (!maxResponse.ok) {
      return jsonResponse(502, { ok: false, error: 'max_api_error' });
    }

    return jsonResponse(200, { ok: true });
  } catch {
    return jsonResponse(502, { ok: false, error: 'max_api_unreachable' });
  }
};
