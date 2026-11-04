export const monthNames = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

// Родовий відмінок для дат: «7 травня», «1 січня».
export const monthNamesGenitive = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

export const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const demoDayNumbers = [2, 3, 5, 6, 9, 12, 13, 14, 20, 23, 27, 28, 30];

/** Скільки днів у місяці. `month` — індекс з нуля, як у `Date`. */
export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * ISO-ключ дати: `2026-11-04`.
 * `month` — індекс з нуля (як у `Date`), `day` — число з одиниці.
 * Такий ключ сортується лексикографічно за хронологією.
 */
export const dateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const ISO_DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const LEGACY_DATE_KEY = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** Перевіряє, чи рядок є коректним ISO-ключем (наявна дата, не «2026-02-30»). */
export const isValidDateKey = (key: string): boolean => {
  const match = ISO_DATE_KEY.exec(key);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  if (month < 1 || month > 12) return false;

  return day >= 1 && day <= daysInMonth(year, month - 1);
};

/**
 * Розбирає ключ старого формату v1 (`2025-11-30` = 30 грудня 2025):
 * місяць там був індексом з нуля і без доповнення нулем.
 * Повертає ISO-ключ або `null`, якщо дата некоректна.
 */
export const parseLegacyDateKey = (key: string): string | null => {
  const match = LEGACY_DATE_KEY.exec(key);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;

  return dateKey(year, month, day);
};

/** Дні календаря місяця з порожніми клітинками до першого числа (тиждень починається з понеділка). */
export const getCalendarDays = (year: number, month: number): Array<number | null> => {
  const firstDay = new Date(year, month, 1).getDay();
  const mondayIndex = firstDay === 0 ? 6 : firstDay - 1;

  return [
    ...Array<null>(mondayIndex).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1),
  ];
};
