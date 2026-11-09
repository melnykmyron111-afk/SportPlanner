import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToday } from './useToday';

const DayProbe = () => {
  const today = useToday();

  return <output>{`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`}</output>;
};

describe('useToday', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 23, 59));
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('оновлює дату після півночі', () => {
    act(() => root.render(<DayProbe />));
    expect(container.textContent).toBe('2026-11-15');

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(container.textContent).toBe('2026-11-16');
  });

  it('оновлює дату, коли вкладка знову стає видимою', () => {
    act(() => root.render(<DayProbe />));
    expect(container.textContent).toBe('2026-11-15');

    act(() => {
      vi.setSystemTime(new Date(2026, 10, 18, 10, 0));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(container.textContent).toBe('2026-11-18');
  });
});
