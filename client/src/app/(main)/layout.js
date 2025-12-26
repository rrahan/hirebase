"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({ children }) {
    const pathname = usePathname();
    const isJobsPage = pathname?.startsWith("/jobs");

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            {!isJobsPage && <Footer />}
        </>
    );
}
