import { Kindergarten } from "@repo/shared"

interface WishlistSectionProps {
  wishlists?: Array<{ target_kindergarten_id: string }> | null
  kindergartenMap: Map<string, Kindergarten>
}

export const WishlistSection = ({
  wishlists,
  kindergartenMap,
}: WishlistSectionProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
          ✨
        </div>
        <h3 className="text-lg font-bold">Želje</h3>
      </div>
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

