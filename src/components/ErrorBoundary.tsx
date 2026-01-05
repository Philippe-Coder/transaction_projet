import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You can log the error to an external service here if desired
    // console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-gray-600 mb-4">L'application a rencontré une erreur lors du rendu. Voir les détails ci-dessous.</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto" style={{maxHeight: 300}}>
              {String(this.state.error?.message)}
              {this.state.error?.stack ? '\n\n' + this.state.error.stack : null}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 text-white rounded"
              >
                Recharger
              </button>
              <button
                onClick={() => console.log('LocalStorage:', Object.fromEntries(Object.entries(localStorage)))}
                className="px-4 py-2 border rounded"
              >
                Log localStorage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
