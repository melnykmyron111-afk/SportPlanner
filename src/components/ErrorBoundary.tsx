import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Запобігає білому екрану: якщо рендер падає, показує зрозуміле повідомлення
 * з можливістю перезавантажити сторінку.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SportPlanner: непередбачена помилка рендера', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell fallback-shell">
          <div className="fallback-card" role="alert">
            <div className="fallback-icon"><CircleAlert size={24} /></div>
            <h1>Щось пішло не так</h1>
            <p>Сторінку не вдалося показати. Спробуйте перезавантажити — ваш план збережено.</p>
            <button className="insert-button" onClick={() => window.location.reload()}>
              Перезавантажити
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
