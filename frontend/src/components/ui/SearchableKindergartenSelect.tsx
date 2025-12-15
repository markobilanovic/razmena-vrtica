"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Kindergarten } from "@repo/shared"

interface SearchableKindergartenSelectProps {
    kindergartens: Kindergarten[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    required?: boolean
}

export function SearchableKindergartenSelect({
    kindergartens,
    value,
    onChange,
    placeholder = "Pretražite vrtiće...",
    className = "",
    required = false,
}: SearchableKindergartenSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Initialize/sync search term with selected value
    useEffect(() => {
        if (value) {
            const selected = kindergartens.find((k) => k.id === value)
            if (selected) {
                setSearchTerm(`${selected.name} - ${selected.city}`)
            }
        } else {
            // If value is cleared externally and we are not typing (e.g. form reset), 
            // we might want to clear searchTerm. 
            // However, if we are typing, we are clearing the value ourselves.
            // We'll rely on the fact that if value is empty, the input shows searchTerm.
            // If we just opened the component, searchTerm is empty.
        }
    }, [value, kindergartens])

    const sortedKindergartens = useMemo(() => {
        return [...kindergartens].sort((a, b) => a.name.localeCompare(b.name))
    }, [kindergartens])

    const filteredKindergartens = useMemo(() => {
        const lower = searchTerm.toLowerCase()
        return sortedKindergartens.filter(
            (k) =>
                k.name.toLowerCase().includes(lower) ||
                k.city.toLowerCase().includes(lower),
        )
    }, [sortedKindergartens, searchTerm])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (k: Kindergarten) => {
        onChange(k.id)
        setSearchTerm(`${k.name} - ${k.city}`)
        setIsOpen(false)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        if (value) {
            onChange("")
        }
        setIsOpen(true)
    }

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                placeholder={placeholder}
                required={required && !value}
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredKindergartens.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                            Nema rezultata
                        </div>
                    ) : (
                        filteredKindergartens.map((k) => (
                            <div
                                key={k.id}
                                onClick={() => handleSelect(k)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                            >
                                {k.name} - {k.city}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
