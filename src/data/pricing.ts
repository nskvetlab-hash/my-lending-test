export interface PricingTier {
  title: string;
  price: string;
  features: string[];
}

// Ориентировочные вилки — ЗАМЕНИТЬ на реальные суммы перед публикацией.
export const pricingTiers: PricingTier[] = [
  { title: 'Сайт / лендинг', price: 'от 30 000 ₽', features: ['Дизайн в Figma', 'Адаптивная вёрстка', 'Форма заявки'] },
  { title: 'Чат-бот', price: 'от 40 000 ₽', features: ['Сценарий диалога', 'Интеграция с Telegram/WhatsApp', 'Базовая аналитика'] },
  { title: 'AI-агент / приложение', price: 'расчёт индивидуально', features: ['Сложность сильно варьируется', 'Оценка после брифа', 'Пилотная версия перед полным запуском'] },
];
