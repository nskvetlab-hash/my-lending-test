export interface PricingTier {
  title: string;
  price: string;
  features: string[];
}

// Ориентировочные вилки для старта без портфолио платных проектов — пересматривать по мере роста опыта.
export const pricingTiers: PricingTier[] = [
  { title: 'Сайт / лендинг', price: 'от 15 000 ₽', features: ['Дизайн в Figma', 'Адаптивная вёрстка', 'Форма заявки'] },
  { title: 'Чат-бот', price: 'от 20 000 ₽', features: ['Сценарий диалога', 'Интеграция с Telegram/WhatsApp', 'Базовая аналитика'] },
  { title: 'AI-агент / приложение', price: 'расчёт индивидуально', features: ['Сложность сильно варьируется', 'Оценка после брифа', 'Пилотная версия перед полным запуском'] },
];
