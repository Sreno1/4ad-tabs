import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center"
          role="alert"
        >
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-6 text-gray-300">
              An unexpected error occurred. Try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-800 p-4 rounded mb-6 text-sm">
                <summary className="cursor-pointer font-mono mb-2">
                  Error details
                </summary>
                <pre className="overflow-auto text-xs text-red-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
