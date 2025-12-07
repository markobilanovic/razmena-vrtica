import { MatchGroupWithDetails, MatchStatus } from "@repo/shared"

interface ActiveExchangesSectionProps {
  matchGroups: MatchGroupWithDetails[]
  currentChildId: string
}

export const ActiveExchangesSection = ({
  matchGroups,
  currentChildId,
}: ActiveExchangesSectionProps) => {
  return (
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
              .filter((p) => p.child?.id !== currentChildId)
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
                          {otherChild.current_kindergarten?.name || "Nepoznato"}
                        </span>
                        {isActive && otherChild.parent && (
                          <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-xs font-bold text-teal-700">
                              Kontakt roditelja:
                            </p>
                            <p className="text-xs">{otherChild.parent.full_name}</p>
                            <p className="text-xs">{otherChild.parent.email}</p>
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
  )
}

