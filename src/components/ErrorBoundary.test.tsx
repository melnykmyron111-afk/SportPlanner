import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const Boom = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  let container: HTMLDivElement;
  let root: Root;

  // jsdom друкує перехоплену React-помилку у stderr; для тесту це очікуваний шум.
  const suppressJsdomError = (event: ErrorEvent) => event.preventDefault();

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    window.addEventListener('error', suppressJsdomError);
    // React сам пише помилку в консоль під час перехоплення — глушимо очікуваний шум.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.removeEventListener('error', suppressJsdomError);
    vi.restoreAllMocks();
  });

  it('показує запасний екран замість білої сторінки', () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });

    expect(container.textContent).toContain('Щось пішло не так');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain('Перезавантажити');
  });

  it('рендерить дочірній вміст, коли помилки немає', () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          <p>План на місці</p>
        </ErrorBoundary>,
      );
    });

    expect(container.textContent).toBe('План на місці');
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
