// Yandex Cloud Function: принимает заявку с сайта и отправляет её на почту по SMTP.
//
// Требуемые переменные окружения (задаются в консоли Yandex Cloud, НЕ в коде):
//   SMTP_USER     — email-адрес отправителя (например, q.m.nmvl@mail.ru)
//   SMTP_PASSWORD — пароль приложения для SMTP (НЕ обычный пароль от почты, см. README.md)
//   NOTIFY_TO     — куда слать заявки (по умолчанию q.m.nmvl@mail.ru, если не задано)
//
// Позже, когда будет готов бот MAX (после оформления самозанятости), сюда же
// можно добавить пересылку в MAX Bot API — см. README.md, раздел "Позже: MAX".
//
// Деплой: см. functions/max-notify/README.md

const nodemailer = require('nodemailer');

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

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const notifyTo = process.env.NOTIFY_TO || 'q.m.nmvl@mail.ru';

  if (!smtpUser || !smtpPassword) {
    return jsonResponse(500, { ok: false, error: 'server_not_configured' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  const text =
    'Новая заявка с сайта\n\n' +
    `Имя: ${name}\n` +
    `Контакт: ${contact}\n` +
    `Тип проекта: ${projectType}`;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: notifyTo,
      replyTo: contact.includes('@') ? contact : undefined,
      subject: `Новая заявка с сайта — ${name}`,
      text,
    });

    return jsonResponse(200, { ok: true });
  } catch {
    return jsonResponse(502, { ok: false, error: 'smtp_error' });
  }
};
