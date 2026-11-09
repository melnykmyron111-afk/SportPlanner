import { useEffect, useState } from 'react';

const dayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/**
 * Поточна дата, яка оновлюється після півночі або коли вкладка знову стає активною.
 * Потрібна, щоб серія днів не «застрягала» на даті відкриття застосунку.
 */
export const useToday = (): Date => {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => {
      const now = new Date();
      setToday((current) => (dayStart(current) === dayStart(now) ? current : now));
    };

    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return today;
};
