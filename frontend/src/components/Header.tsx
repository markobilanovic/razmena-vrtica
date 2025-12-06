'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isDashboard = pathname === '/dashboard';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">R</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">Razmena Vrtića</span>
                    </Link>

                    {!isDashboard && (
                        <>
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-8">
                                <a href="/#features" className="text-color-text-muted hover:text-color-text transition-colors font-medium">Mogućnosti</a>
                                <a href="/#how-it-works" className="text-color-text-muted hover:text-color-text transition-colors font-medium">Kako funkcioniše</a>
                                <a href="/#testimonials" className="text-color-text-muted hover:text-color-text transition-colors font-medium">Iskustva</a>
                                <Link href="/login" className="text-color-text-muted hover:text-color-text transition-colors font-medium">Prijavi se</Link>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {!isDashboard && mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-white/20 pt-4 mobile-menu-enter">
                        <a
                            href="/#features"
                            className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Mogućnosti
                        </a>
                        <a
                            href="/#how-it-works"
                            className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Kako funkcioniše
                        </a>
                        <a
                            href="/#testimonials"
                            className="block text-color-text-muted hover:text-color-text transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Iskustva
                        </a>
                        <Link href="/login" className="block w-full btn-secondary text-center" onClick={() => setMobileMenuOpen(false)}>
                            Prijavi se
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
