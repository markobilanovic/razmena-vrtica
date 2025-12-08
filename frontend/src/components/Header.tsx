"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter() // We need to import useRouter
  const isDashboard = pathname === "/dashboard"

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem("access_token")
    setIsLoggedIn(!!token)

    // Optional: Listen for storage events if auth changes in other tabs
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token")
      setIsLoggedIn(!!token)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setMobileMenuOpen(false)
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">R</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold gradient-text">
              Razmena Vrtića
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {!isDashboard && (
              <>
                <a
                  href="/#features"
                  className="text-color-text-muted hover:text-color-text transition-colors font-medium"
                >
                  Mogućnosti
                </a>
                <a
                  href="/#how-it-works"
                  className="text-color-text-muted hover:text-color-text transition-colors font-medium"
                >
                  Kako funkcioniše
                </a>
                <a
                  href="/#testimonials"
                  className="text-color-text-muted hover:text-color-text transition-colors font-medium"
                >
                  Iskustva
                </a>
              </>
            )}

            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-700 font-medium transition-all"
              >
                Odjavi se
              </button>
            ) : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-700 font-medium transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-gradient-primary text-white hover:opacity-90 rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                Prijavi se
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-white/20 pt-4 mobile-menu-enter">
            {!isDashboard && (
              <>
                <a
                  href="/#features"
                  className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mogućnosti
                </a>
                <a
                  href="/#how-it-works"
                  className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kako funkcioniše
                </a>
                <a
                  href="/#testimonials"
                  className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iskustva
                </a>
              </>
            )}

            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="block w-full py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-medium text-center transition-all"
              >
                Odjavi se
              </button>
            ) : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="block w-full py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-medium text-center transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="block w-full py-3 bg-gradient-primary text-white rounded-xl font-bold text-center transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prijavi se
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
