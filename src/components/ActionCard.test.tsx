import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Notice, Workout } from '../types';
import ActionCard from './ActionCard';

type Props = {
  selectedDay: number | null;
  month: number;
  workout?: Workout;
  notice: Notice;
  onSave: (workout: Workout) => void;
  onRemove: () => void;
};

const findButton = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll('button')].find((button) =>
    button.textContent?.includes(label),
  );

const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('ActionCard', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderCard = (props: Partial<Props> = {}) => {
    const onSave = props.onSave ?? vi.fn();
    const onRemove = props.onRemove ?? vi.fn();

    act(() => {
      root.render(
        <ActionCard
          selectedDay={5}
          month={10}
          notice="idle"
          {...props}
          onSave={onSave}
          onRemove={onRemove}
        />,
      );
    });

    return { onSave, onRemove };
  };

  it('показує деталі наявного тренування', () => {
    renderCard({ workout: { type: 'cardio', minutes: 30, note: 'Інтервали' } });

    expect(container.textContent).toContain('Кардіо');
    expect(container.textContent).toContain('30 хв');
    expect(container.textContent).toContain('Інтервали');
    expect(container.querySelector('form')).toBeNull();
  });

  it('зберігає вибраний тип, тривалість і нотатку', () => {
    const { onSave } = renderCard();

    expect(container.querySelector('form')).not.toBeNull();

    act(() => findButton(container, 'Біг')?.click());
    act(() => findButton(container, '45 хв')?.click());

    const input = container.querySelector('input') as HTMLInputElement;
    act(() => setInputValue(input, '  Парк  '));

    const form = container.querySelector('form') as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ type: 'run', minutes: 45, note: 'Парк' });
  });

  it('дозволяє перейти до редагування та скасувати зміни', () => {
    renderCard({ workout: { type: 'strength', minutes: 60, note: 'Ноги' } });

    act(() => findButton(container, 'Редагувати')?.click());
    expect(container.querySelector('form')).not.toBeNull();
    expect(findButton(container, 'Зберегти')).not.toBeUndefined();

    act(() => findButton(container, 'Скасувати')?.click());
    expect(container.querySelector('form')).toBeNull();
    expect(container.textContent).toContain('Ноги');
  });

  it('викликає видалення для запланованого дня', () => {
    const { onRemove } = renderCard({ workout: { type: 'run', minutes: 40, note: '' } });

    act(() => findButton(container, 'Вичеркнути')?.click());

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('без обраного дня показує підказку замість форми', () => {
    renderCard({ selectedDay: null });

    expect(container.querySelector('form')).toBeNull();
    expect(container.textContent).toContain('Вибір дати займає секунду');
  });
});
