"use client"

import { Component, ReactNode } from "react"
import { ApiError } from "@/lib/api"

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <DefaultErrorFallback error={this.state.error} reset={this.reset} />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const isApiError = error instanceof ApiError
  const statusCode = isApiError ? error.statusCode : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            {statusCode === 401
              ? "Neovlašćeni pristup"
              : statusCode === 404
                ? "Nije pronađeno"
                : statusCode === 500
                  ? "Greška servera"
                  : "Nešto je pošlo po zlu"}
          </h1>

          <p className="text-gray-600 mb-6">
            {statusCode === 401
              ? "Molimo prijavite se ponovo da biste pristupili ovoj stranici."
              : error.message ||
                "Došlo je do neočekivane greške. Molimo pokušajte ponovo."}
          </p>

          {statusCode === 401 ? (
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("access_token")
                  window.location.href = "/login"
                }
              }}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Prijavite se
            </button>
          ) : (
            <button
              onClick={reset}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Pokušaj ponovo
            </button>
          )}

          {process.env.NODE_ENV === "development" && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Detalji greške (samo za razvoj)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export function QueryErrorBoundary({
  children,
  onReset,
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        const handleReset = () => {
          reset()
          onReset?.()
        }
        return <DefaultErrorFallback error={error} reset={handleReset} />
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
