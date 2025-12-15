"use client"

import { useState, Suspense, useMemo, useRef, useEffect } from "react"
import { useCreateChild, useKindergartens } from "@/lib/queries"

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

  const { data: kindergartensData } = useKindergartens()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const kindergartens = kindergartensData || []

  const sortedKindergartens = useMemo(() => {
    return [...kindergartens].sort((a, b) => a.name.localeCompare(b.name))
  }, [kindergartens])

  const filteredKindergartens = useMemo(() => {
    if (!searchTerm && !kindergartenId) return sortedKindergartens
    // If a kindergarten is selected and the search term matches it, show all (so user can switch)
    // Or if user is typing, filter.
    // To keep it simple: always filter by searchTerm if it exists.
    // If user clicked an item, searchTerm would be "Name - City".

    // Better UX: If dropdown is open, filter.
    const lower = searchTerm.toLowerCase()
    return sortedKindergartens.filter(
      (k) =>
        k.name.toLowerCase().includes(lower) ||
        k.city.toLowerCase().includes(lower),
    )
  }, [sortedKindergartens, searchTerm, kindergartenId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectKindergarten = (k: any) => {
    setKindergartenId(k.id)
    setSearchTerm(`${k.name} - ${k.city}`)
    setIsDropdownOpen(false)
    setError("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (kindergartenId) {
      setKindergartenId("")
    }
    setIsDropdownOpen(true)
  }
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
          Ime deteta
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Uzrasna grupa <span className="text-red-500">*</span>
        </label>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Izaberite uzrasnu grupu</option>
          <option value="MLADJA_JASLENA">Mlađa jaslena (0.5-1.5 god)</option>
          <option value="STARIJA_JASLENA">Starija jaslena (1.5-2.5 god)</option>
          <option value="MLADJA">Mlađa (2.5-3.5 god)</option>
          <option value="SREDNJA">Srednja (3.5-4.5 god)</option>
          <option value="STARIJA">Starija (4.5-5.5 god)</option>
          <option value="NAJSTARIJA">Najstarija (5.5-6.5 god)</option>
        </select>
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

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trenutni vrtić <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Pretražite vrtiće..."
          required={!kindergartenId} // Requires input if no ID selected, but handled by handleSubmit mostly
        />
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredKindergartens.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-sm">
                Nema rezultata
              </div>
            ) : (
              filteredKindergartens.map((k) => (
                <div
                  key={k.id}
                  onClick={() => handleSelectKindergarten(k)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                >
                  {k.name} - {k.city}
                </div>
              ))
            )}
          </div>
        )}
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
