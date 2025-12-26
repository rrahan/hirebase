"use client";

import { FaqsSection } from "@/components/faqs-section";
import { LogoCloud } from "@/components/logo-cloud";

export default function FaqsPage() {
    return (
        <div className="w-full font-outfit overflow-x-hidden">
            <FaqsSection />
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] border-b border-border" />
            <h2 className="mt-4 mb-3 text-center font-medium text-foreground text-xl tracking-tight md:text-2xl">
                <span className="font-semibold font-outfit">Ambitious teams hiring now.</span>
            </h2>
            <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mx-auto my-3 h-px max-w-sm " />
            <div className="max-w-3xl mx-auto mask-[linear-gradient(to_right,transparent_5%,black_20%,black_80%,transparent_95%)]">
                <LogoCloud />
            </div>
            <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mt-3 h-px " />
        </div>
    );
}
