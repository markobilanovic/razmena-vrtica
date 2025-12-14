"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { ChildDataSkeleton } from "@/components/LoadingFallback"
import { ChildTabContent } from "./ChildTabContent"
import { useDeleteChild } from "@/lib/queries"
import {
  ConfirmationPopover,
  ConfirmationPopoverRef,
} from "@/components/ui/ConfirmationPopover"

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
    id: string
    target_kindergarten_id: string
  }> | null
  parent?: {
    full_name: string
    email: string
  } | null
}

interface ChildrenTabsProps {
  children: Child[]
  openAddChildDialog: () => void
}

export const ChildrenTabs = ({
  children,
  openAddChildDialog,
}: ChildrenTabsProps) => {
  const [selectedChildId, setSelectedChildId] = useState(
    children?.[0]?.id || "",
  )
  const [childToDelete, setChildToDelete] = useState<Child | null>(null)
  const deleteChildMutation = useDeleteChild()
  const popoverRef = useRef<ConfirmationPopoverRef>(null)

  // Update selected child when children array changes
  useEffect(() => {
    // If no child is selected or selected child no longer exists, select the first one
    if (
      children.length > 0 &&
      (!selectedChildId || !children.find((c) => c.id === selectedChildId))
    ) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId])

  if (!children || children.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
        <div className="text-6xl mb-4 opacity-50">🧸</div>
        <h3 className="text-xl font-bold mb-2">Nema registrovane dece</h3>
        <p className="text-color-text-muted max-w-md mx-auto mb-6">
          Dodajte podatke o vašoj deci da biste započeli pretragu za razmenu
          vrtića.
        </p>
        <button className="btn-primary" onClick={openAddChildDialog}>
          <span>Dodaj prvo dete</span>
        </button>
      </div>
    )
  }

  const selectedChild = children.find((child) => child.id === selectedChildId)

  const showDeleteConfirm = (childId: string) => {
    const child = children.find((c) => c.id === childId)
    if (!child) return
    setChildToDelete(child)
    popoverRef.current?.show()
  }

  const handleDeleteChild = async () => {
    if (!childToDelete) return

    try {
      await deleteChildMutation.mutateAsync(childToDelete.id)
    } catch (error) {
      console.error("Failed to delete child:", error)
      alert(
        "Greška pri brisanju deteta. Molimo pokušajte ponovo ili kontaktirajte podršku.",
      )
    } finally {
      setChildToDelete(null)
    }
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
          onClick={() => showDeleteConfirm(selectedChildId)}
          disabled={deleteChildMutation.isPending}
          className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 font-medium border-2 border-red-100 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Obriši dete"
        >
          {deleteChildMutation.isPending ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="hidden sm:inline">Brisanje...</span>
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      </div>

      {/* Child Content */}
      {selectedChild && (
        <Suspense fallback={<ChildDataSkeleton />}>
          <ChildTabContent child={selectedChild} />
        </Suspense>
      )}

      {/* Delete Confirmation Popover */}
      <ConfirmationPopover
        ref={popoverRef}
        title="Potvrda brisanja"
        message={
          childToDelete
            ? `Da li ste sigurni da želite da obrišete dete "${childToDelete.name}"?\n\nOvo će obrisati:\n- Sve želje za razmenu\n- Učešće u svim aktivnim razmenama\n\nOva akcija se ne može poništiti.`
            : ""
        }
        onConfirm={handleDeleteChild}
        onCancel={() => setChildToDelete(null)}
      />
    </div>
  )
}
