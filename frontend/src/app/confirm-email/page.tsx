"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { confirmEmailApi } from "@/lib/api"

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Invalid confirmation link")
      return
    }

    confirmEmailApi(token)
      .then((response) => {
        setStatus("success")
        setMessage(response.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      })
      .catch((error) => {
        setStatus("error")
        setMessage(error.message || "Failed to confirm email")
      })
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Potvrda Email Adrese
        </h1>

        {status === "loading" && (
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600">Potvrđujemo vašu email adresu...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mb-4 text-6xl">✓</div>
            <p className="mb-4 text-lg font-semibold text-green-600">
              {message}
            </p>
            <p className="text-gray-600">
              Bićete preusmereni na stranicu za prijavu...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4 text-6xl">✗</div>
            <p className="mb-4 text-lg font-semibold text-red-600">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Nazad na prijavu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
