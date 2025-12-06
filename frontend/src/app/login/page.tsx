"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Greska pri logovanju");
            }

            const data = await res.json();
            localStorage.setItem("access_token", data.access_token);
            // Optionally store user info
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight font-outfit">Dobrodošli</h1>
                    <p className="text-white/70">Prijavite se na vaš nalog</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}
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
                        <div className="flex items-center justify-between ml-1">
                            <label htmlFor="password" className="text-sm font-medium text-white/90">
                                Lozinka
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-white/70 hover:text-white transition-colors"
                            >
                                Zaboravili ste lozinku?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
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
                        {loading ? "Prijavljivanje..." : "Prijavi se"}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/40 text-sm">ili nastavite sa</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <button
                    type="button"
                    className="w-full py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-3 group"
                >
                    <svg className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>

                <p className="mt-8 text-center text-white/60 text-sm">
                    Nemate nalog?{" "}
                    <Link href="/register" className="text-white font-medium hover:underline decoration-white/50 underline-offset-4">
                        Registrujte se
                    </Link>
                </p>
            </div>
        </div>
    );
}
