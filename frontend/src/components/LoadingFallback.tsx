export function DashboardSkeleton() {
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
        <div className="mb-10 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-2/3 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="p-4 bg-white/50 rounded-xl animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sm:p-8 rounded-3xl min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>

              <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="glass-card p-6 rounded-2xl border border-white/50">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/50">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChildDataSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass-card p-6 rounded-2xl border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-teal-100 bg-teal-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

