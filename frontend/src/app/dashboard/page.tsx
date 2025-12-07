"use client"

import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserProfile, useChildData, useKindergartensBatch } from "@/lib/queries"
import { QueryErrorBoundary } from "@/components/ErrorBoundary"
import {
  DashboardSkeleton,
  ChildDataSkeleton,
} from "@/components/LoadingFallback"
import {
  UserProfile,
  Kindergarten,
  MatchGroupWithDetails,
  AgeGroup,
  MatchStatus,
} from "@repo/shared"

// Type alias for convenience
type User = UserProfile
type Child = NonNullable<UserProfile["children"]>[number]

interface ChildTabContentProps {
  child: Child
}

const ChildTabContent = ({ child }: ChildTabContentProps) => {
  const { matches, matchGroups, potentials } = useChildData(
    child.id,
    child.group as AgeGroup | undefined,
  )

  // Extract unique kindergarten IDs from wishlists
  const wishlistKindergartenIds = (child.wishlists || [])
    .map((wish) => wish.target_kindergarten_id)
    .filter(Boolean)

  // Fetch kindergarten details only if there are wishlists
  const { data: kindergartens = [] } = useKindergartensBatch(
    wishlistKindergartenIds,
  )

  // Create a map for quick lookup
  const kindergartenMap = new Map(
    kindergartens.map((k) => [k.id, k]),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card p-6 rounded-2xl border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
            🏫
          </div>
          <h3 className="text-lg font-bold">Trenutni vrtić</h3>
        </div>
        {child.current_kindergarten ? (
          <div className="bg-white/50 p-4 rounded-xl">
            <p className="font-semibold text-lg">
              {child.current_kindergarten.name}
            </p>
            <p className="text-color-text-muted">
              {child.current_kindergarten.address}
            </p>
          </div>
        ) : (
          <p className="text-color-text-muted italic">Nije dodeljen</p>
        )}
      </div>

      {/* Active Exchanges Section */}
      <div className="glass-card p-6 rounded-2xl border border-teal-100 bg-teal-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
            🤝
          </div>
          <h3 className="text-lg font-bold text-teal-800">Aktivne razmene</h3>
        </div>
        {matchGroups.length > 0 ? (
          <div className="grid gap-3">
            {matchGroups.map((group) => {
              const isPending = group.status === MatchStatus.PENDING_ACCEPTANCE
              const isActive = group.status === MatchStatus.ACTIVE_CONTACT

              // Find other participants in the match
              const otherParticipants = (group.participants || [])
                .filter((p) => p.child?.id !== child.id)
                .map((p) => p.child)
                .filter((c): c is NonNullable<typeof c> => c !== undefined)

              return (
                <div
                  key={group.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-teal-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg mb-1">
                        {isActive
                          ? "Kontakt razmena aktivna!"
                          : "Potrebno prihvatanje"}
                      </p>
                      <p className="text-sm text-color-text-muted">
                        Status: {group.status}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {isActive ? "AKTIVNO" : "NA ČEKANJU"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Učesnici u razmeni:</p>
                    <ul className="text-sm space-y-1">
                      {otherParticipants.map((otherChild) => (
                        <li
                          key={otherChild.id}
                          className="flex flex-col bg-gray-50 p-2 rounded"
                        >
                          <span className="font-medium">{otherChild.name}</span>
                          <span className="text-xs text-color-text-muted">
                            Vrtić:{" "}
                            {otherChild.current_kindergarten?.name ||
                              "Nepoznato"}
                          </span>
                          {isActive && otherChild.parent && (
                            <div className="mt-1 pt-1 border-t border-gray-200">
                              <p className="text-xs font-bold text-teal-700">
                                Kontakt roditelja:
                              </p>
                              <p className="text-xs">
                                {otherChild.parent.full_name}
                              </p>
                              <p className="text-xs">
                                {otherChild.parent.email}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons for Pending */}
                  {isPending && (
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition">
                        Prihvati razmenu
                      </button>
                      <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition">
                        Odbij
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-color-text-muted italic">Nema aktivnih razmena.</p>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
            ✨
          </div>
          <h3 className="text-lg font-bold">Želje</h3>
        </div>
        {child.wishlists && child.wishlists.length > 0 ? (
          <ul className="space-y-2">
            {child.wishlists.map((wish, index) => {
              const kindergarten = kindergartenMap.get(wish.target_kindergarten_id)
              return (
                <li
                  key={index}
                  className="flex flex-col gap-1 bg-white/50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="font-semibold">
                      {kindergarten?.name || "Učitavanje..."}
                    </span>
                  </div>
                  {kindergarten?.address && (
                    <span className="text-sm text-color-text-muted ml-4">
                      {kindergarten.address}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-color-text-muted italic">Nema unetih želja.</p>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-green-100 bg-green-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
            ✅
          </div>
          <h3 className="text-lg font-bold text-green-800">
            Direktna podudaranja
          </h3>
        </div>
        {matches.length > 0 ? (
          <div className="grid gap-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg">{m.name}</p>
                  <p className="text-color-text-muted text-sm">{m.address}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Dostupno
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-color-text-muted italic">
            Nema direktnih podudaranja.
          </p>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-orange-100 bg-orange-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
            🔄
          </div>
          <h3 className="text-lg font-bold text-orange-800">
            Potencijalna kružna podudaranja
          </h3>
        </div>
        {potentials.length > 0 ? (
          <div className="text-sm bg-white/50 p-4 rounded-xl max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(potentials, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-color-text-muted italic">
            Nema potencijalnih podudaranja.
          </p>
        )}
      </div>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { data: user } = useUserProfile()

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 pt-20">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"></div>
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-3">
            Dobrodošli, <span className="gradient-text">{user.full_name}</span>
          </h1>
          <p className="text-xl text-color-text-muted">
            Upravljajte vašim profilom i pratite status razmera.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Card */}
          <div
            className="lg:col-span-1 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="glass-card p-6 rounded-3xl sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profil</h2>
                  <p className="text-sm text-color-text-muted">
                    Korisnički podaci
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl">
                  <p className="text-xs uppercase tracking-wider text-color-text-muted font-bold mb-1">
                    Ime i prezime
                  </p>
                  <p className="font-semibold text-lg">{user.full_name}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <p className="text-xs uppercase tracking-wider text-color-text-muted font-bold mb-1">
                    Email adresa
                  </p>
                  <p className="font-semibold text-lg break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                className="w-full mt-6 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  localStorage.removeItem("access_token")
                  router.push("/login")
                }}
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

          {/* Main Content / Children Tabs */}
          <div
            className="lg:col-span-2 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="glass-card p-6 sm:p-8 rounded-3xl min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">👶</span> Moja deca
                </h2>
                <button className="btn-secondary text-sm py-2 px-4 shadow-none">
                  + Dodaj dete
                </button>
              </div>

              {!user.children || user.children.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
                  <div className="text-6xl mb-4 opacity-50">🧸</div>
                  <h3 className="text-xl font-bold mb-2">
                    Nema registrovane dece
                  </h3>
                  <p className="text-color-text-muted max-w-md mx-auto mb-6">
                    Dodajte podatke o vašoj deci da biste započeli pretragu za
                    razmenu vrtića.
                  </p>
                  <button className="btn-primary">
                    <span>Dodaj prvo dete</span>
                  </button>
                </div>
              ) : (
                <Tabs defaultValue={user.children[0].id} className="w-full">
                  <TabsList className="mb-8 w-full flex flex-wrap gap-2 bg-blue-50/50 p-1.5 rounded-xl border border-blue-100">
                    {user.children.map((child) => (
                      <TabsTrigger
                        key={child.id}
                        value={child.id}
                        className="flex-1 min-w-[120px] rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all py-2.5 font-medium"
                      >
                        {child.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {user.children.map((child) => (
                    <TabsContent
                      key={child.id}
                      value={child.id}
                      className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                    >
                      <Suspense fallback={<ChildDataSkeleton />}>
                        <ChildTabContent child={child} />
                      </Suspense>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window === "undefined") return

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Show loading state during SSR or before client hydration
  if (!isClient) {
    return <DashboardSkeleton />
  }

  return (
    <QueryErrorBoundary
      onReset={() => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token")
          if (!token) {
            window.location.href = "/login"
          }
        }
      }}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </QueryErrorBoundary>
  )
}
