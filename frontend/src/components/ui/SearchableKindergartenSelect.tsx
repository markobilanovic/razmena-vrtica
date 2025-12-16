"use client"

import { useState, useRef, useEffect, useMemo, useId } from "react"
import { Kindergarten } from "@repo/shared"

interface SearchableKindergartenSelectProps {
    kindergartens: Kindergarten[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    required?: boolean
    label?: string
    error?: string
}

export function SearchableKindergartenSelect({
    kindergartens,
    value,
    onChange,
    placeholder = "Pretražite vrtiće...",
    className = "",
    required = false,
    label,
    error,
}: SearchableKindergartenSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeIndex, setActiveIndex] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listboxRef = useRef<HTMLUListElement>(null)
    
    const comboboxId = useId()
    const listboxId = useId()
    const labelId = useId()
    const errorId = useId()

    // Initialize/sync search term with selected value
    useEffect(() => {
        if (value) {
            const selected = kindergartens.find((k) => k.id === value)
            if (selected) {
                setSearchTerm(`${selected.name} - ${selected.city}`)
            }
        }
    }, [value, kindergartens])

    const sortedKindergartens = useMemo(() => {
        return [...kindergartens].sort((a, b) => a.name.localeCompare(b.name))
    }, [kindergartens])

    const filteredKindergartens = useMemo(() => {
        const lower = searchTerm.toLowerCase()
        
        // Check if search term is in formatted display format "Name - City"
        if (lower.includes(' - ')) {
            const [namePart, cityPart] = lower.split(' - ')
            return sortedKindergartens.filter(
                (k) =>
                    k.name.toLowerCase().startsWith(namePart) &&
                    k.city.toLowerCase().startsWith(cityPart)
            )
        }
        
        // Otherwise use fuzzy matching on name or city
        return sortedKindergartens.filter(
            (k) =>
                k.name.toLowerCase().includes(lower) ||
                k.city.toLowerCase().includes(lower),
        )
    }, [sortedKindergartens, searchTerm])

    // Reset active index when filtered results change
    useEffect(() => {
        setActiveIndex(-1)
    }, [filteredKindergartens])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
                setActiveIndex(-1)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (k: Kindergarten) => {
        onChange(k.id)
        setSearchTerm(`${k.name} - ${k.city}`)
        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.focus()
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        if (value) {
            onChange("")
        }
        setIsOpen(true)
        setActiveIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                if (!isOpen) {
                    setIsOpen(true)
                } else if (filteredKindergartens.length > 0) {
                    setActiveIndex(prev => 
                        prev < filteredKindergartens.length - 1 ? prev + 1 : 0
                    )
                }
                break
            case "ArrowUp":
                e.preventDefault()
                if (isOpen && filteredKindergartens.length > 0) {
                    setActiveIndex(prev => 
                        prev > 0 ? prev - 1 : filteredKindergartens.length - 1
                    )
                }
                break
            case "Enter":
                e.preventDefault()
                if (isOpen && activeIndex >= 0 && filteredKindergartens[activeIndex]) {
                    handleSelect(filteredKindergartens[activeIndex])
                }
                break
            case "Escape":
                e.preventDefault()
                setIsOpen(false)
                setActiveIndex(-1)
                break
            case "Tab":
                setIsOpen(false)
                setActiveIndex(-1)
                break
        }
    }

    // Scroll active option into view
    useEffect(() => {
        if (activeIndex >= 0 && listboxRef.current) {
            const activeElement = listboxRef.current.children[activeIndex] as HTMLElement
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth"
                })
            }
        }
    }, [activeIndex])

    const selectedKindergarten = kindergartens.find(k => k.id === value)

    return (
        <div className={className}>
            {label && (
                <label 
                    id={labelId}
                    htmlFor={comboboxId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-label="obavezno">*</span>}
                </label>
            )}
            
            <div className="relative" ref={wrapperRef}>
                <input
                    ref={inputRef}
                    id={comboboxId}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-activedescendant={
                        activeIndex >= 0 && filteredKindergartens[activeIndex] 
                            ? `option-${filteredKindergartens[activeIndex].id}` 
                            : undefined
                    }
                    aria-labelledby={label ? labelId : undefined}
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={error ? "true" : undefined}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onClick={() => setIsOpen(true)}
                    className={`
                        w-full px-4 py-2 border rounded-lg 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        placeholder:text-gray-400
                        ${error 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300"
                        }
                    `}
                    placeholder={placeholder}
                    required={required && !value}
                    autoComplete="off"
                />
                
                {/* Screen reader only status */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                    {isOpen && filteredKindergartens.length > 0 && (
                        `${filteredKindergartens.length} ${filteredKindergartens.length === 1 ? 'rezultat' : 'rezultata'} dostupno`
                    )}
                    {isOpen && filteredKindergartens.length === 0 && searchTerm && (
                        "Nema rezultata"
                    )}
                    {selectedKindergarten && (
                        `Izabrano: ${selectedKindergarten.name} - ${selectedKindergarten.city}`
                    )}
                </div>

                {isOpen && (
                    <ul
                        ref={listboxRef}
                        id={listboxId}
                        role="listbox"
                        aria-labelledby={label ? labelId : undefined}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        {filteredKindergartens.length === 0 ? (
                            <li 
                                role="option" 
                                aria-selected="false"
                                className="px-4 py-2 text-gray-500 text-sm"
                            >
                                Nema rezultata
                            </li>
                        ) : (
                            filteredKindergartens.map((k, index) => (
                                <li
                                    key={k.id}
                                    id={`option-${k.id}`}
                                    role="option"
                                    aria-selected={k.id === value}
                                    onClick={() => handleSelect(k)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`
                                        px-4 py-2 cursor-pointer text-sm text-gray-700
                                        ${index === activeIndex ? "bg-blue-100" : "hover:bg-blue-50"}
                                        ${k.id === value ? "bg-blue-50 font-medium" : ""}
                                    `}
                                >
                                    {k.name} - {k.city}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
            
            {error && (
                <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
