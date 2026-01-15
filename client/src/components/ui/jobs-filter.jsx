"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { Spinner } from "@/components/kibo-ui/spinner";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Checkbox component with animation
const FilterCheckbox = ({ checked }) => (
    <div
        className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0",
            checked
                ? "bg-white border-white"
                : "border-muted-foreground/50 group-hover:border-muted-foreground"
        )}
    >
        {checked && (
            <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-3 h-3 text-background"
                viewBox="0 0 12 12"
                fill="none"
            >
                <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </motion.svg>
        )}
    </div>
);

// Filter column component - no animation
const FilterColumn = ({ title, items, selectedItems, onToggle, type = "checkbox" }) => (
    <div className="flex flex-col gap-2 min-w-0">
        {/* Column Header */}
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-3 pb-1 font-outfit">
            {title}
        </h3>

        {/* Column Items */}
        <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto scrollbar-hide">
            {items.map((item) => {
                const value = typeof item === "string" ? item : item.value || item.label;
                const label = typeof item === "string" ? item : item.label;
                const isSelected = selectedItems.includes(value);

                return (
                    <button
                        key={value}
                        onClick={() => onToggle(value)}
                        className={cn(
                            "flex items-center px-3 py-2 rounded-md",
                            "transition-colors duration-100 text-left group",
                            "hover:bg-secondary/50",
                            isSelected && "bg-secondary"
                        )}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {type === "checkbox" && (
                                <FilterCheckbox checked={isSelected} />
                            )}
                            {type === "radio" && (
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0",
                                        isSelected
                                            ? "border-white"
                                            : "border-muted-foreground/50 group-hover:border-muted-foreground"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            )}
                            <span className="text-[13px] text-foreground truncate font-outfit">
                                {label}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
);

// Filter Button Component (goes inside search input)
export function JobsFilterButton({ isOpen, onClick, totalSelected }) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium font-outfit",
                "bg-transparent text-muted-foreground hover:text-foreground",
                "transition-all duration-150",
                isOpen && "text-foreground"
            )}
        >
            <SlidersHorizontal size={18} className="flex-shrink-0 cursor-pointer" />
            <span className="hidden sm:inline cursor-pointer">Filters</span>
            {totalSelected > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-1.5 py-0.5 rounded-full bg-foreground text-background text-xs font-semibold min-w-[20px] text-center"
                >
                    {totalSelected}
                </motion.span>
            )}
        </motion.button>
    );
}

// Filter Panel Component (goes below search section, in document flow)
export function JobsFilterPanel({
    isOpen,
    selectedFilters,
    onFiltersChange,
    filterOptions,
    loading,
    onClearAll
}) {
    const toggleFilter = (category, value) => {
        const current = selectedFilters[category] || [];
        const isSelected = current.includes(value);

        // For dateRange, only allow one selection (radio behavior)
        if (category === "dateRange") {
            onFiltersChange({
                ...selectedFilters,
                [category]: isSelected ? [] : [value]
            });
        } else {
            onFiltersChange({
                ...selectedFilters,
                [category]: isSelected
                    ? current.filter((v) => v !== value)
                    : [...current, value]
            });
        }
    };

    const getTotalSelected = () => {
        return Object.values(selectedFilters).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    };

    const totalSelected = getTotalSelected();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{
                        opacity: 0,
                        height: 0
                    }}
                    animate={{
                        opacity: 1,
                        height: "auto"
                    }}
                    exit={{
                        opacity: 0,
                        height: 0
                    }}
                    transition={{
                        duration: 0.25,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="overflow-hidden"
                >
                    <div
                        className={cn(
                            "mt-3 p-4",
                            "bg-popover border border-border rounded-xl",
                            "shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.1)]"
                        )}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Spinner size={20} />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* Level Column */}
                                    <FilterColumn
                                        title="Level"
                                        items={filterOptions.levels || []}
                                        selectedItems={selectedFilters.level || []}
                                        onToggle={(value) => toggleFilter("level", value)}
                                    />

                                    {/* Location Column */}
                                    <FilterColumn
                                        title="Location"
                                        items={filterOptions.locations || []}
                                        selectedItems={selectedFilters.location || []}
                                        onToggle={(value) => toggleFilter("location", value)}
                                    />

                                    {/* Company Column */}
                                    <FilterColumn
                                        title="Company"
                                        items={filterOptions.companies || []}
                                        selectedItems={selectedFilters.company || []}
                                        onToggle={(value) => toggleFilter("company", value)}
                                    />

                                    {/* Date Posted Column */}
                                    <FilterColumn
                                        title="Date Posted"
                                        items={filterOptions.dateRanges || []}
                                        selectedItems={selectedFilters.dateRange || []}
                                        onToggle={(value) => toggleFilter("dateRange", value)}
                                        type="radio"
                                    />
                                </div>

                                {/* Clear Filters Button */}
                                {totalSelected > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <button
                                            onClick={onClearAll}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg text-sm font-medium font-outfit",
                                                "bg-secondary text-foreground hover:bg-secondary/80",
                                                "transition-colors duration-150 cursor-pointer"
                                            )}
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Main hook for filter state management
export function useJobsFilter() {
    const [isOpen, setIsOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        levels: [],
        locations: [],
        companies: [],
        dateRanges: []
    });
    const [loading, setLoading] = useState(false);

    const fetchFilterOptions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/v1/jobs/filters`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFilterOptions(data.data);
                }
            }
        } catch (err) {
            console.error("Error fetching filter options:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch filter options when popover opens
    useEffect(() => {
        if (isOpen && filterOptions.levels.length === 0) {
            fetchFilterOptions();
        }
    }, [isOpen]);

    const toggleOpen = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        toggleOpen,
        close,
        filterOptions,
        loading
    };
}

// Scrollbar hide styles - add to global CSS or include in component
export const scrollbarHideStyles = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
    }
`;

// Legacy combined component for backward compatibility
export function JobsFilter({ selectedFilters, onFiltersChange }) {
    const { isOpen, toggleOpen, filterOptions, loading } = useJobsFilter();

    const getTotalSelected = () => {
        return Object.values(selectedFilters).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    };

    const clearAllFilters = () => {
        onFiltersChange({
            level: [],
            location: [],
            company: [],
            dateRange: []
        });
    };

    return (
        <div className="relative">
            <JobsFilterButton
                isOpen={isOpen}
                onClick={toggleOpen}
                totalSelected={getTotalSelected()}
            />
            <div className="absolute top-full right-0 mt-1 z-50 w-[calc(100vw-3rem)] sm:w-max sm:min-w-[600px] max-w-[800px]">
                <JobsFilterPanel
                    isOpen={isOpen}
                    selectedFilters={selectedFilters}
                    onFiltersChange={onFiltersChange}
                    filterOptions={filterOptions}
                    loading={loading}
                    onClearAll={clearAllFilters}
                />
            </div>
            <style jsx global>{scrollbarHideStyles}</style>
        </div>
    );
}

export default JobsFilter;
