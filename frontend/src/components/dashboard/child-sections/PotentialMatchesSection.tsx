interface PotentialMatchesSectionProps {
  potentials: unknown[]
}

export const PotentialMatchesSection = ({
  potentials,
}: PotentialMatchesSectionProps) => {
  return (
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
  )
}

