import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, copied: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  copyErrorToClipboard = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    const text = `${error.toString()}\n\n${errorInfo?.componentStack || ''}`;

    // Try navigator.clipboard API first
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: textarea + execCommand
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      // ignore copy errors
      console.warn('Copy failed', err);
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, copied } = this.state;
      const detailsText = error ? `${error.toString()}\n\n${errorInfo?.componentStack || ''}` : '';

      return (
        <div
          className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center"
          role="alert"
        >
          <div className="w-full max-w-4xl bg-slate-800 border border-slate-700 rounded p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
                <p className="mb-4 text-slate-300">An unexpected error occurred. You can refresh the page or copy the error details to report it.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={this.copyErrorToClipboard}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm border border-slate-600"
                >
                  {copied ? 'Copied ✓' : 'Copy Error'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
                >
                  Refresh
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-4 bg-slate-900 p-4 rounded text-sm">
                <div className="font-mono text-xs mb-2 text-amber-400">Error details</div>
                <pre className="overflow-auto text-xs text-red-400 max-h-72">{detailsText}</pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
