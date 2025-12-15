"use client"

import Link from "next/link"
import Image from "next/image"

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
          Ups... izgleda da je{" "}
          <span className="text-blue-600">neko razbio</span> kompjuter
        </h2>

        <p className="text-lg text-gray-600 mb-12 leading-relaxed">
          Ne znamo da li je sok, igračka ili dugme koje nije trebalo pritisnuti,
          ali naša strana je trenutno na pauzi.
        </p>

        {/* Illustration placeholder */}
        <div className="mb-12 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <Image
            src="/500.png"
            alt="Ilustracija deteta pored laptopa sa greškom"
            width={500}
            height={500}
          />
        </div>

        {/* Button */}
        <Link href="/">
          <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors">
            Nazad na početnu
          </button>
        </Link>
      </div>
    </div>
  )
}
