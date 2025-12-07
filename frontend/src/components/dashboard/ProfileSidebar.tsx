"use client"

import { useRouter } from "next/navigation"

interface ProfileSidebarProps {
  fullName: string
  email: string
}

export const ProfileSidebar = ({ fullName, email }: ProfileSidebarProps) => {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    router.push("/login")
  }

  return (
    <div
      className="lg:col-span-1 animate-fade-in-up"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="glass-card p-6 rounded-3xl sticky top-24">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">Profil</h2>
            <p className="text-sm text-color-text-muted">Korisnički podaci</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-color-text-muted font-bold mb-1">
              Ime i prezime
            </p>
            <p className="font-semibold text-lg">{fullName}</p>
          </div>
          <div className="p-4 bg-white/50 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-color-text-muted font-bold mb-1">
              Email adresa
            </p>
            <p className="font-semibold text-lg break-all">{email}</p>
          </div>
        </div>

        <button
          className="w-full mt-6 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Odjavi se
        </button>
      </div>
    </div>
  )
}

