import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Compass, Home } from "lucide-react";
import { RaisedButton } from "./ui/raised-button";
import Link from "next/link";

export function NotFoundPage() {
	return (
		<div className="selection:bg-[#149F65] selection:text-white flex w-full items-center justify-center font-outfit">
			<div className="flex h-screen items-center border-x">
				<div>
					<div className="absolute inset-x-0 h-px bg-border" />
					<Empty>
						<EmptyHeader>
							<EmptyTitle className="font-black font-mono text-8xl">
								404
							</EmptyTitle>
							<EmptyDescription className="text-nowrap">
								The page you're looking for might have been <br />
								moved or doesn't exist.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex gap-2">
								<Link href="/">
									<RaisedButton color="#107A4D" className="w-40 select-none">
										<Home />	<span className="text-base">Go Home</span>
									</RaisedButton>
								</Link>

								{/* <Button asChild variant="outline">
									<a href="#">
										<Compass /> Explore
									</a>
								</Button> */}
							</div>
						</EmptyContent>
					</Empty>
					<div className="absolute inset-x-0 h-px bg-border" />
				</div>
			</div>
		</div>
	);
}
