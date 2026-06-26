import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-4xl font-black text-white uppercase italic mb-4">
            Oops! Something <span className="text-[#F28749]">went wrong</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">
            Don't worry, the neighborhood is still here.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
