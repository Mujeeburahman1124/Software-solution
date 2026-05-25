'use client'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">⚠️</span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">Oops! Something went wrong</h1>
        <p className="text-secondary mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
