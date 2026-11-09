import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../lib/storage';
import { useWorkoutPlan } from './useWorkoutPlan';

const Probe = () => {
  const { plan } = useWorkoutPlan(new Date(2026, 10, 15));
  const workout = plan['2026-11-04'];

  return <output>{workout?.done ? 'done' : 'planned'}</output>;
};

const CountProbe = () => {
  const { plan } = useWorkoutPlan(new Date(2026, 10, 15));

  return <output>{Object.keys(plan).length}</output>;
};

const storedPlan = (done: boolean) => ({
  '2026-11-04': { type: 'run', minutes: 40, note: '', done },
});

describe('useWorkoutPlan', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPlan(false)));
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
  });

  it('синхронізує позначку виконання з іншої вкладки', () => {
    act(() => root.render(<Probe />));
    expect(container.textContent).toBe('planned');

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(storedPlan(true)),
        }),
      );
    });

    expect(container.textContent).toBe('done');
  });

  it('не перемальовує план, якщо зміни лише в іншому ключі', () => {
    act(() => root.render(<Probe />));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'sportplanner.other',
          newValue: JSON.stringify(storedPlan(true)),
        }),
      );
    });

    expect(container.textContent).toBe('planned');
  });

  it('перечитує план, коли сховище очистили в іншій вкладці', () => {
    act(() => root.render(<CountProbe />));
    expect(container.textContent).toBe('1');

    act(() => {
      localStorage.clear();
      window.dispatchEvent(
        new StorageEvent('storage', { key: null, newValue: null }),
      );
    });

    // Порожнє сховище знову дає демо-набір поточного місяця (13 днів).
    expect(container.textContent).toBe('13');
  });
});
