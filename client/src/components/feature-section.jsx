// https://magicui.design/docs/components/grid-pattern
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import {
	Cpu,
	Fingerprint,
	Pencil,
	Settings2,
	Sparkles,
	Zap,
} from "lucide-react";
import { ZapIcon } from "./ui/zap";
import { ShieldCheckIcon } from "./ui/shield-check";
import { LockIcon } from "./ui/lock";
import { SlidersHorizontalIcon } from "./ui/sliders-horizontal";
import { BotIcon } from "./ui/bot";

export function FeatureSection() {
	return (
		<div className="mx-auto w-full max-w-5xl space-y-8">
			<div className="mx-auto max-w-3xl text-center">
				<h2 className="text-balance font-medium text-2xl md:text-4xl lg:text-5xl">
					Precision. Clarity. Trust.
				</h2>
				<p className="mt-4 text-balance text-muted-foreground text-sm md:text-base">
					The toolkit for the modern job search.
				</p>
			</div>
			<div className="overflow-hidden rounded-sm border">
				<div
					className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
					{features.map((feature) => (
						<FeatureCard feature={feature} key={feature.title} />
					))}
				</div>
			</div>
		</div>
	);
}

export function FeatureCard({
	feature,
	className,
	...props
}) {
	return (
		<div
			className={cn("relative overflow-hidden bg-background p-6", className)}
			{...props}>
			<div
				className="-mt-2 -ml-20 mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 size-full">
				<GridPattern
					className="absolute inset-0 size-full stroke-foreground/20"
					height={40}
					width={40}
					x={5} />
			</div>
			<feature.icon aria-hidden className="size-6 text-foreground/75" strokeWidth={1} />
			<h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
			<p className="relative z-20 mt-2 font-light text-muted-foreground text-xs">
				{feature.description}
			</p>
		</div>
	);
}

const features = [
	{
		title: "Direct Access",
		icon: ZapIcon,
		description: "Applications go directly to the hiring manager's inbox.",
	},
	{
		title: "Verified",
		icon: ShieldCheckIcon,
		description: "Every job is manually audited. No agencies. No scams",
	},
	{
		title: "Privacy First",
		icon: LockIcon,
		description: "Your profile is hidden from your current employer.",
	},
	{
		title: "Salary Transparency",
		icon: Pencil,
		description: "Mandatory compensation ranges on every single listing.",
	},
	{
		title: "Technical Filters",
		icon: SlidersHorizontalIcon,
		description: "Filter by tech stack, burn rate, engineering culture, and equity.",
	},
	{
		title: "No Al Slop",
		icon: BotIcon,
		description: "Humans write our job descriptions. Humans read your applications.",
	},
];
