"use client"

import { useState, Suspense } from "react"
import { useCreateChild, useKindergartens } from "@/lib/queries"
import { SearchableKindergartenSelect } from "@/components/ui/SearchableKindergartenSelect"

interface AddChildDialogProps {
  isOpen: boolean
  onClose: () => void
}

function AddChildForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("")
  const [ageGroup, setAgeGroup] = useState("")
  const [kindergartenId, setKindergartenId] = useState("")
  const [error, setError] = useState("")
  const [showAgeInfo, setShowAgeInfo] = useState(false)

  const { data: kindergartensData } = useKindergartens()
  const kindergartens = kindergartensData || []

  const createChild = useCreateChild()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !ageGroup || !kindergartenId) {
      setError("Ime, uzrasna grupa i vrtić su obavezni")
      return
    }

    try {
      await createChild.mutateAsync({
        name,
        birth_date: birthDate || undefined,
        gender: gender || undefined,
        group: ageGroup,
        current_kindergarten_id: kindergartenId,
      })

      // Reset form and close
      setName("")
      setBirthDate("")
      setGender("")
      setAgeGroup("")
      setKindergartenId("")
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri dodavanju deteta",
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ime deteta <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Unesite ime"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Uzrasna grupa <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowAgeInfo(!showAgeInfo)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Uzrasti
          </button>
        </div>
        
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Izaberite uzrasnu grupu</option>
          <option value="MLADJA_JASLENA">Mlađa jaslena</option>
          <option value="STARIJA_JASLENA">Starija jaslena</option>
          <option value="MLADJA">Mlađa</option>
          <option value="SREDNJA">Srednja</option>
          <option value="STARIJA">Starija</option>
          <option value="NAJSTARIJA">Najstarija</option>
        </select>

        {showAgeInfo && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Uzrasne grupe po datumu rođenja:</h4>
            <div className="space-y-1 text-xs text-blue-800">
              <div><strong>Mlađa jaslena:</strong> mart 2024 - mart 2025</div>
              <div><strong>Starija jaslena:</strong> mart 2023 - mart 2024</div>
              <div><strong>Mlađa:</strong> mart 2022 - mart 2023</div>
              <div><strong>Srednja:</strong> mart 2021 - mart 2022</div>
              <div><strong>Starija:</strong> mart 2020 - mart 2021</div>
              <div><strong>Najstarija:</strong> mart 2019 - mart 2020</div>
            </div>
          </div>
        )}
      </div>

      {/*<div>*/}
      {/*  <label className="block text-sm font-medium text-gray-700 mb-1">*/}
      {/*    Datum rođenja <span className="text-gray-400">(opciono)</span>*/}
      {/*  </label>*/}
      {/*  <input*/}
      {/*    type="date"*/}
      {/*    value={birthDate}*/}
      {/*    onChange={(e) => setBirthDate(e.target.value)}*/}
      {/*    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"*/}
      {/*  />*/}
      {/*</div>*/}

      {/*<div>*/}
      {/*  <label className="block text-sm font-medium text-gray-700 mb-1">*/}
      {/*    Pol <span className="text-gray-400">(opciono)</span>*/}
      {/*  </label>*/}
      {/*  <select*/}
      {/*    value={gender}*/}
      {/*    onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE" | "")}*/}
      {/*    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"*/}
      {/*  >*/}
      {/*    <option value="">Nije navedeno</option>*/}
      {/*    <option value="MALE">Muško</option>*/}
      {/*    <option value="FEMALE">Žensko</option>*/}
      {/*  </select>*/}
      {/*</div>*/}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trenutni vrtić <span className="text-red-500">*</span>
        </label>
        <SearchableKindergartenSelect
          kindergartens={kindergartens}
          value={kindergartenId}
          onChange={(id) => {
            setKindergartenId(id)
            if (error) setError("")
          }}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Otkaži
        </button>
        <button
          type="submit"
          disabled={createChild.isPending}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createChild.isPending ? "Dodavanje..." : "Dodaj"}
        </button>
      </div>
    </form>
  )
}

export function AddChildDialog({ isOpen, onClose }: AddChildDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dodaj dete</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <AddChildForm onClose={onClose} />
        </Suspense>
      </div>
    </div>
  )
}
