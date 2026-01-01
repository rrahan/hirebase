"use client";

import { useState } from "react";

// Company logo component with optional logoUrl from API
export default function CompanyLogo({ name, logoUrl, size = "medium" }) {
    const [hasError, setHasError] = useState(false);

    // Use provided logoUrl, or fallback to logo.dev
    const finalLogoUrl = logoUrl || `https://img.logo.dev/${name?.toLowerCase().replace(/\s+/g, '')}.com?token=live_6a1a28fd-6420-4492-aeb0-b297461d9de2`;

    const sizeClasses = {
        small: "h-10 w-10 p-1",
        medium: "h-12 w-12 p-1.5",
        large: "h-16 w-16 p-2",
    };

    const textSizes = {
        small: "text-sm",
        medium: "text-base",
        large: "text-xl",
    };

    return (
        <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-xl bg-white border border-border overflow-hidden`}>
            {!hasError && finalLogoUrl ? (
                <img
                    src={finalLogoUrl}
                    alt={`${name} logo`}
                    className="h-full w-full object-contain pointer-events-none select-none"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className={`${textSizes[size]} font-semibold text-foreground flex items-center justify-center h-full w-full`}>
                    {name?.charAt(0).toUpperCase() || "?"}
                </span>
            )}
        </div>
    );
}

