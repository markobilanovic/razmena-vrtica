"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi, ApiError } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await registerApi(email, password, fullName);
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 pt-24">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight font-outfit">Dobrodošli</h1>
                    <p className="text-white/70">Kreirajte vaš nalog</p>
                </div>

                <form className="space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-white/90 ml-1">
                            Ime i Prezime
                        </label>
                        <div className="relative">
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Petar Petrović"
                                required
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-white/90 ml-1">
                            Email adresa
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vas@email.com"
                                required
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-white/90 ml-1">
                            Lozinka
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 bg-white text-indigo-600 hover:bg-white/90 active:scale-[0.98] rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Kreiram nalog..." : "Registruj se"}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/40 text-sm">ili se prijavite</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <p className="mt-8 text-center text-white/60 text-sm">
                    Već imate nalog?{" "}
                    <Link href="/login" className="text-white font-medium hover:underline decoration-white/50 underline-offset-4">
                        Prijavite se
                    </Link>
                </p>
            </div>
        </div>
    );
}
