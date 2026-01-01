import Link from "next/link";
import { Home, Briefcase } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { RaisedButton } from "@/components/ui/raised-button";

export default function JobNotFound() {
    return (
        <div className="selection:bg-[#149F65] selection:text-white flex w-full items-center justify-center font-outfit min-h-screen">
            <div className="flex h-screen items-center border-x">
                <div>
                    <div className="absolute inset-x-0 h-px bg-border" />
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle className="font-black font-mono text-8xl">
                                404
                            </EmptyTitle>
                            <EmptyDescription className="text-nowrap">
                                This job listing may have been removed <br />
                                or the URL is incorrect.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Link href="/">
                                    <RaisedButton color="#107A4D" className="w-40 select-none">
                                        <Home /> <span className="text-base">Go Home</span>
                                    </RaisedButton>
                                </Link>
                                <Link href="/jobs">
                                    <RaisedButton color="#107A4D" className="w-40 select-none">
                                        <Briefcase /> <span className="text-base">Browse Jobs</span>
                                    </RaisedButton>
                                </Link>
                            </div>
                        </EmptyContent>
                    </Empty>
                    <div className="absolute inset-x-0 h-px bg-border" />
                </div>
            </div>
        </div>
    );
}
