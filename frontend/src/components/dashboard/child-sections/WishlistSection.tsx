"use client"

import { useState } from "react"
import { Kindergarten } from "@repo/shared"
import { useCreateWishlist, useKindergartens } from "@/lib/queries"

interface WishlistSectionProps {
  childId: string
  wishlists?: Array<{ target_kindergarten_id: string }> | null
  kindergartenMap: Map<string, Kindergarten>
}

export const WishlistSection = ({
  childId,
  wishlists,
  kindergartenMap,
}: WishlistSectionProps) => {
  const [isAddingWish, setIsAddingWish] = useState(false)
  const [selectedKindergartenId, setSelectedKindergartenId] = useState("")
  
  const { data: allKindergartens = [] } = useKindergartens()
  const createWishlist = useCreateWishlist()

  // Filter out kindergartens already in wishlist
  const existingKindergartenIds = new Set(
    (wishlists || []).map((w) => w.target_kindergarten_id)
  )
  const availableKindergartens = allKindergartens.filter(
    (k: Kindergarten) => !existingKindergartenIds.has(k.id)
  )

  const handleAddWish = async () => {
    if (!selectedKindergartenId) return

    try {
      await createWishlist.mutateAsync({
        child_id: childId,
        target_kindergarten_id: selectedKindergartenId,
      })
      setIsAddingWish(false)
      setSelectedKindergartenId("")
    } catch (error) {
      console.error("Failed to add wish:", error)
      alert("Greška pri dodavanju želje. Pokušajte ponovo.")
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
            ✨
          </div>
          <h3 className="text-lg font-bold">Želje</h3>
        </div>
        {!isAddingWish && (
          <button
            onClick={() => setIsAddingWish(true)}
            className="btn-secondary text-sm py-1.5 px-3 shadow-none"
          >
            + Dodaj želju
          </button>
        )}
      </div>

      {isAddingWish && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="block text-sm font-medium mb-2">
            Izaberite vrtić:
          </label>
          <select
            value={selectedKindergartenId}
            onChange={(e) => setSelectedKindergartenId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Izaberite vrtić --</option>
            {availableKindergartens.map((k: Kindergarten) => (
              <option key={k.id} value={k.id}>
                {k.name} - {k.address}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddWish}
              disabled={!selectedKindergartenId || createWishlist.isPending}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createWishlist.isPending ? "Dodavanje..." : "Dodaj"}
            </button>
            <button
              onClick={() => {
                setIsAddingWish(false)
                setSelectedKindergartenId("")
              }}
              className="btn-secondary text-sm py-2 px-4 shadow-none"
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {wishlists && wishlists.length > 0 ? (
        <ul className="space-y-2">
          {wishlists.map((wish, index) => {
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
  )
}

