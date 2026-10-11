import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#FAF6ED] dark:bg-[#0C0A0E] text-[#3D2E23] dark:text-[#EDE7F7] font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#FAF6ED] dark:bg-[#1C1922] border border-[#EADBCB] dark:border-[#312C3C] text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl">
              🌸
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-semibold mb-2">
              Sana &amp; Me
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
              Something unexpected happened while opening the sanctuary. Tap below to reload.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-2xl bg-[#E8638F] hover:bg-[#CC4373] text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
              >
                Reload Sanctuary
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
