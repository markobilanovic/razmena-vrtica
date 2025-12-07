interface CurrentKindergartenSectionProps {
  currentKindergarten?: {
    name: string
    address: string
  } | null
}

export const CurrentKindergartenSection = ({
  currentKindergarten,
}: CurrentKindergartenSectionProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
          🏫
        </div>
        <h3 className="text-lg font-bold">Trenutni vrtić</h3>
      </div>
      {currentKindergarten ? (
        <div className="bg-white/50 p-4 rounded-xl">
          <p className="font-semibold text-lg">{currentKindergarten.name}</p>
          <p className="text-color-text-muted">{currentKindergarten.address}</p>
        </div>
      ) : (
        <p className="text-color-text-muted italic">Nije dodeljen</p>
      )}
    </div>
  )
}

