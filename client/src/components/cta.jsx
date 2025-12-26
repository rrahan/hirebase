import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { RaisedButton } from "./ui/raised-button";

export function CallToAction() {
    return (
        <div
            className="relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-4 border-y px-4 py-8 dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)]">
            <PlusIcon
                className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6"
                strokeWidth={1} />
            <PlusIcon
                className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6"
                strokeWidth={1} />
            <PlusIcon
                className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6"
                strokeWidth={1} />
            <PlusIcon
                className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6"
                strokeWidth={1} />
            <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
            <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />
            <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed" />
            <h2 className="text-center font-semibold text-xl md:text-3xl">
                Your next job is just a query away.
            </h2>
            <p
                className="text-balance text-center font-medium text-muted-foreground text-sm md:text-base">
                Stop wading through the noise of generic boards. Access a structured, live feed of opportunities from the most ambitious teams.
            </p>
            <div className="flex items-center justify-center gap-2">
                {/* <Button variant="outline">Contact Sales</Button> */}
                <RaisedButton color="#107A4D" className={'cursor-pointer'}>
                    Browse All Jobs <ArrowRightIcon />
                </RaisedButton>
            </div>
        </div>
    );
}
