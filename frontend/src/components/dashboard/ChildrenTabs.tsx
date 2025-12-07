import { Suspense, useState } from "react"
import { ChildDataSkeleton } from "@/components/LoadingFallback"
import { ChildTabContent } from "./ChildTabContent"

type Child = {
  id: string
  name: string
  group?: string | null
  current_kindergarten?: {
    id: string
    name: string
    address: string
  } | null
  wishlists?: Array<{
    target_kindergarten_id: string
  }> | null
  parent?: {
    full_name: string
    email: string
  } | null
}

interface ChildrenTabsProps {
  children: Child[]
}

export const ChildrenTabs = ({ children }: ChildrenTabsProps) => {
  const [selectedChildId, setSelectedChildId] = useState(
    children?.[0]?.id || ""
  )

  if (!children || children.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
        <div className="text-6xl mb-4 opacity-50">🧸</div>
        <h3 className="text-xl font-bold mb-2">Nema registrovane dece</h3>
        <p className="text-color-text-muted max-w-md mx-auto mb-6">
          Dodajte podatke o vašoj deci da biste započeli pretragu za razmenu
          vrtića.
        </p>
        <button className="btn-primary">
          <span>Dodaj prvo dete</span>
        </button>
      </div>
    )
  }

  const selectedChild = children.find((child) => child.id === selectedChildId)

  const handleDelete = (childId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete child:", childId)
    alert("Delete functionality will be implemented")
  }

  return (
    <div className="w-full">
      {/* Dropdown and Delete Button */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex-1 relative">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full px-4 py-3 pr-10 text-base font-medium bg-white border-2 border-blue-100 rounded-xl shadow-sm appearance-none cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <button
          onClick={() => handleDelete(selectedChildId)}
          className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 font-medium border-2 border-red-100 hover:border-red-200"
          title="Obriši dete"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="hidden sm:inline">Obriši</span>
        </button>
      </div>

      {/* Child Content */}
      {selectedChild && (
        <Suspense fallback={<ChildDataSkeleton />}>
          <ChildTabContent child={selectedChild} />
        </Suspense>
      )}
    </div>
  )
}

