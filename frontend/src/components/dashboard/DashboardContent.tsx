"use client"

import { useState } from "react"
import { useUserProfile } from "@/lib/queries"
import { ProfileSidebar } from "./ProfileSidebar"
import { ChildrenTabs } from "./ChildrenTabs"
import { AddChildDialog } from "./AddChildDialog"

export function DashboardContent() {
  const { data: user } = useUserProfile()
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)

  return (
    <div className="min-h-screen relative bg-gray-50 pt-20">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-3">
            Dobrodošli, <span className="gradient-text">{user.full_name}</span>
          </h1>
          <p className="text-xl text-color-text-muted">
            Upravljajte vašim profilom i pratite status razmera.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar / Profile Card */}
          <ProfileSidebar fullName={user.full_name} email={user.email} />

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
                <button
                  onClick={() => setIsAddChildOpen(true)}
                  className="btn-secondary text-sm py-2 px-4 shadow-none"
                >
                  + Dodaj dete
                </button>
              </div>

              <ChildrenTabs children={user.children || []} />
            </div>
          </div>
        </div>
      </div>

      <AddChildDialog
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
      />
    </div>
  )
}
