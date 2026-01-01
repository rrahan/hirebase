"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({ children }) {
    const pathname = usePathname();
    // Hide footer on /jobs and /job/{slug} pages (they have their own SimpleFooter)
    const hideMainFooter = pathname?.startsWith("/jobs") || pathname?.startsWith("/job/");

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            {!hideMainFooter && <Footer />}
        </>
    );
}
