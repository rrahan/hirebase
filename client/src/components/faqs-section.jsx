import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export function FaqsSection() {
	return (
		<section
			className="mx-auto grid min-h-screen w-full max-w-5xl grid-cols-1 md:grid-cols-2 lg:border-x">
			<div className="px-4 pt-12 pb-6">
				<div className="space-y-5">
					<h2 className="text-balance font-bold text-4xl md:text-6xl lg:font-black">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground">
						Sourced at the source. A deep dive into our data integrity, privacy standards, and builder-first ethos.
					</p>
					<p className="text-muted-foreground">
						{"Can't find what you're looking for? "}
						<Link className="text-primary hover:underline" href="/contact">
							Contact Us
						</Link>
					</p>
				</div>
			</div>
			<div className="relative place-content-center">
				{/* vertical guide line */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-3 h-full w-px bg-border" />

				<Accordion collapsible type="single">
					{faqs.map((item) => (
						<AccordionItem
							className="group relative border-b pl-5 first:border-t last:border-b"
							key={item.id}
							value={item.id}>
							{/*  plus */}
							<PlusIcon
								aria-hidden="true"
								className="-bottom-[5.5px] -translate-x-1/2 pointer-events-none absolute left-[12.5px] size-2.5 text-muted-foreground group-last:hidden" />

							<AccordionTrigger className="px-4 py-4 text-[15px] leading-6 hover:no-underline">
								{item.title}
							</AccordionTrigger>

							<AccordionContent className="px-4 pb-4 text-muted-foreground">
								{item.content}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}

const faqs = [
	{
		id: "item-1",
		title: "Where do these job listings come from?",
		content:
			"We index official company career portals directly. No third-party aggregators or middlemen—just direct links to the source.",
	},
	{
		id: "item-2",
		title: "How do you prevent \"ghost jobs\"?",
		content:
			"Our engine re-verifies every listing every 3 hours. If a company removes a post, we purge it from our index immediately.",
	},
	{
		id: "item-3",
		title: "What does \"builder-first\" actually mean?",
		content:
			"It means zero ads, zero tracking, and zero corporate fluff. We design for focus and technical clarity, not engagement metrics.",
	},
	{
		id: "item-4",
		title: "How does the AI distillation work?",
		content:
			"Our LLM layer strips away jargon to highlight the only three things that matter: The Mission, The Stack, and The Requirements.",
	},
	{
		id: "item-5",
		title: "Is my data sold to recruiters?",
		content:
			"Never. We don't sell leads or track your browsing history. Your search is private and remains your own.",
	},
	{
		id: "item-6",
		title: "Can I suggest a company to track?",
		content:
			"Yes. Use the Reach Out form. We review all community suggestions for technical relevance before indexing them.",
	},
	{
		id: "item-7",
		title: "What does the \"New Jobs\" count represent?",
		content:
			"It's a transparency metric. It shows the real-time movement of the market and confirms our engine is successfully pulling fresh data.",
	},
];
