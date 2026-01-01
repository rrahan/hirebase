"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toastManager } from "@/components/ui/toast";

export default function CopyButton({ text, className = "" }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            // Show toast notification
            toastManager.add({
                title: "Copied to clipboard",
                type: "success",
            });

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
            toastManager.add({
                title: "Failed to copy",
                type: "error",
            });
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center h-6 w-6 rounded hover:bg-secondary/80 transition-colors ${className}`}
            title="Copy to clipboard"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-[#149F65]" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
        </button>
    );
}
