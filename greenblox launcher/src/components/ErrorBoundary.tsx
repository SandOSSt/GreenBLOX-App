import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary for the GreenBlox Launcher.
 * Catches any unhandled render error and shows a friendly "Something went wrong"
 * screen with a reload button — instead of a blank white page.
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[GreenBlox Launcher] Uncaught render error:", error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#050805] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="text-5xl font-black tracking-tight text-emerald-400 mb-4 select-none">
            GreenBLOX
          </div>

          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 3h.01M3.27 17.44l7.46-12.89a1.5 1.5 0 012.54 0l7.46 12.89A1.5 1.5 0 0119.46 20H4.54a1.5 1.5 0 01-1.27-2.56z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-white mb-2">
            Что-то пошло не так
          </h1>

          {/* Error message */}
          <p className="text-white/50 text-sm mb-1">
            Произошла непредвиденная ошибка при отображении приложения.
          </p>
          {this.state.error && (
            <p className="text-red-400/70 text-xs font-mono mb-6 break-all max-h-24 overflow-auto">
              {this.state.error.message}
            </p>
          )}

          {/* Reload button */}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" />
            </svg>
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }
}
