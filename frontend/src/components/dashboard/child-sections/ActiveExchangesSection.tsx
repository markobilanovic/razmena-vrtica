import { MatchGroupWithDetails, MatchStatus } from "@repo/shared"
import {
  HideMatchConfirmation,
  HideMatchConfirmationRef,
} from "../../ui/HideMatchConfirmation"
import { useHideMatch, useCompleteMatch, useCancelMatch } from "../../../lib/queries"
import { useRef, useState } from "react"

interface ActiveExchangesSectionProps {
  matchGroups: MatchGroupWithDetails[]
  currentChildId: string
  onMatchHidden?: (matchGroupId: string) => void
}

export const ActiveExchangesSection = ({
  matchGroups,
  currentChildId,
  onMatchHidden,
}: ActiveExchangesSectionProps) => {
  const hideConfirmationRef = useRef<HideMatchConfirmationRef>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const hideMatchMutation = useHideMatch()
  const completeMatchMutation = useCompleteMatch()
  const cancelMatchMutation = useCancelMatch()

  const handleHideClick = (matchGroupId: string) => {
    setSelectedMatchId(matchGroupId)
    hideConfirmationRef.current?.show()
  }

  const handleHideConfirm = async () => {
    if (!selectedMatchId) return

    try {
      await hideMatchMutation.mutateAsync(selectedMatchId)
      onMatchHidden?.(selectedMatchId)
    } catch (error) {
      console.error("Failed to hide match:", error)
    } finally {
      setSelectedMatchId(null)
    }
  }

  const handleHideCancel = () => {
    setSelectedMatchId(null)
    hideMatchMutation.reset() // Clear any error state
  }

  const handleCompleteMatch = async (matchGroupId: string) => {
    if (!confirm("Da li ste sigurni da ste uspešno razmenili vrtić sa svim učesnicima?")) {
      return
    }

    try {
      await completeMatchMutation.mutateAsync(matchGroupId)
    } catch (error) {
      console.error("Failed to complete match:", error)
      alert("Greška pri potvrđivanju razmene. Pokušajte ponovo.")
    }
  }

  const handleCancelMatch = async (matchGroupId: string) => {
    if (!confirm("Da li ste sigurni da želite da otkažete ovu razmenu?")) {
      return
    }

    try {
      await cancelMatchMutation.mutateAsync(matchGroupId)
    } catch (error) {
      console.error("Failed to cancel match:", error)
      alert("Greška pri otkazivanju razmene. Pokušajte ponovo.")
    }
  }
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
            const isActive = group.status === MatchStatus.ACTIVE
            const isCanceled = group.status === MatchStatus.CANCELLED
            const isCompleted = group.status === MatchStatus.COMPLETED

            // Find other participants in the match
            const otherParticipants = (group.participants || [])
              .filter((p) => p.child?.id !== currentChildId)
              .map((p) => p.child)
              .filter(
                (c): c is NonNullable<typeof c> =>
                  c !== null && c !== undefined,
              )

            return (
              <div
                key={group.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-teal-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg mb-1">
                      {isCompleted
                        ? "Razmena završena"
                        : isCanceled
                          ? "Razmena otkazana"
                          : "Razmena u toku"}
                    </p>
                    <p className="text-sm text-color-text-muted">
                      {isCompleted
                        ? "Uspešno ste razmenili vrtić!"
                        : isCanceled
                          ? "Ova razmena je otkazana"
                          : "Kontaktirajte učesnike i dogovorite razmenu"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        isCompleted
                          ? "bg-blue-100 text-blue-700"
                          : isCanceled
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isCompleted
                        ? "ZAVRŠENO"
                        : isCanceled
                          ? "OTKAZANO"
                          : "AKTIVNO"}
                    </span>
                    {(isCanceled || isCompleted) && (
                      <button
                        onClick={() => handleHideClick(group.id)}
                        disabled={hideMatchMutation.isPending}
                        className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isCompleted ? "Sakrij ovu završenu razmenu" : "Sakrij ovu otkazanu razmenu"}
                      >
                        {hideMatchMutation.isPending &&
                        selectedMatchId === group.id
                          ? "Sakrivam..."
                          : "Sakrij"}
                      </button>
                    )}
                  </div>
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
                        {otherChild.parent && isActive && (
                          <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-xs font-bold text-teal-700">
                              Kontakt roditelja:
                            </p>
                            <p className="text-xs">
                              {otherChild.parent.full_name}
                            </p>
                            <a 
                              href={`mailto:${otherChild.parent.email}`}
                              className="text-xs text-teal-600 hover:underline"
                            >
                              {otherChild.parent.email}
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons for Active matches */}
                {isActive && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-600 italic">
                      Kontaktirajte sve učesnike i dogovorite razmenu. Nakon što se dogovorite, potvrdite razmenu ili je otkažite.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCompleteMatch(group.id)}
                        disabled={completeMatchMutation.isPending}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completeMatchMutation.isPending ? "Potvrđujem..." : "✓ Razmena završena"}
                      </button>
                      <button 
                        onClick={() => handleCancelMatch(group.id)}
                        disabled={cancelMatchMutation.isPending}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelMatchMutation.isPending ? "Otkažem..." : "✗ Otkaži razmenu"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-color-text-muted italic">Nema aktivnih razmena.</p>
      )}

      {(hideMatchMutation.error || completeMatchMutation.error || cancelMatchMutation.error) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Greška:</strong>{" "}
            {hideMatchMutation.error instanceof Error
              ? hideMatchMutation.error.message
              : completeMatchMutation.error instanceof Error
              ? completeMatchMutation.error.message
              : cancelMatchMutation.error instanceof Error
              ? cancelMatchMutation.error.message
              : "Došlo je do greške"}
          </p>
        </div>
      )}

      <HideMatchConfirmation
        ref={hideConfirmationRef}
        onConfirm={handleHideConfirm}
        onCancel={handleHideCancel}
      />
    </div>
  )
}
