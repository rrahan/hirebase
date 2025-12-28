"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RaisedButton } from "@/components/ui/raised-button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipPopup,
    TooltipProvider,
} from "@/components/ui/tooltip";


export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="flex h-16 w-full items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 md:gap-2">
                    <svg className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 108.76 103.9" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="#149F65"
                            d="M81.01,0H27.75C12.43,0,0,12.42,0,27.75v48.4c0,15.33,12.43,27.75,27.75,27.75h53.26c15.33,0,27.75-12.42,27.75-27.75V27.75c0-15.33-12.42-27.75-27.75-27.75ZM71.92,70.48c-23.66,22.24-50.1,32.54-59.07,23-8.96-9.54,2.95-35.3,26.6-57.54C63.11,13.7,89.55,3.4,98.51,12.94c8.97,9.53-2.94,35.29-26.59,57.53Z"
                        />
                    </svg>
                    <span className="select-none text-2xl md:text-4xl text-foreground font-semibold font-outfit tracking-tight">hirebase</span>
                </Link>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3 select-none font-outfit">
                    <ThemeToggle />
                    <TooltipProvider delay={100} closeDelay={100}>
                        <Tooltip>
                            <TooltipTrigger render={<RaisedButton color="#107A4D" className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2" />}>
                                <span className="hidden sm:inline">Public Alpha v1.0</span>
                                <span className="sm:hidden">Alpha v1.0</span>
                            </TooltipTrigger>
                            <TooltipPopup className={'font-outfit select-none'}>We're in public alpha. Expect bugs and improvements.</TooltipPopup>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </header>
    );
}
