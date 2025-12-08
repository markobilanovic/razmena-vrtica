import { Kindergarten } from "@repo/shared"

interface DirectMatchesSectionProps {
  matches: Kindergarten[]
}

export const DirectMatchesSection = ({
  matches,
}: DirectMatchesSectionProps) => {
  return (
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
  )
}
