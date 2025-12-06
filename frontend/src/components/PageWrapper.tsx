'use client';

import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes that manage their own padding/layout (e.g. full-screen backgrounds)
    const fullScreenRoutes = ['/', '/login', '/register', '/forgot-password'];

    const shouldAddPadding = !fullScreenRoutes.includes(pathname);

    return (
        <div className={shouldAddPadding ? "pt-24" : ""}>
            {children}
        </div>
    );
}
