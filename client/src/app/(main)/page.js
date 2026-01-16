"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoCloud } from "@/components/logo-cloud";
import { Button } from "@/components/ui/button";
import { RaisedButton } from "@/components/ui/raised-button";
import { LayoutGroup, motion } from "motion/react";
import TextRotate from "@/components/fancy/text/text-rotate";
import { TextHighlighter } from "@/components/fancy/text/text-highlighter";
import { ArrowRight } from "lucide-react";
import { FeatureSection } from "@/components/feature-section";
import { CallToAction } from "@/components/cta";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  // Prefetch jobs stats API so it's cached when user navigates to /jobs
  useEffect(() => {
    // Use low priority fetch to not block main content
    const prefetchStats = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/v1/jobs/stats`, {
          priority: 'low',
          cache: 'force-cache'
        });
      } catch {
        // Silently fail - this is just prefetching
      }
    };
    prefetchStats();
  }, []);
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hidden crawlable content for search engines - rendered in HTML without JS */}
      <div className="sr-only" aria-hidden="true">
        <h1>Tech & IT Jobs in Kerala | hirebase</h1>
        <p>Find your next role in Kerala's tech scene. Discover thousands of job opportunities from top companies in Technopark, Infopark, Cyberpark, and Kerala startups.</p>
        <h2>Why Choose hirebase?</h2>
        <ul>
          <li>Real-time job listings directly from company career portals</li>
          <li>No middlemen or expired posts</li>
          <li>Verified opportunities from Kerala's most ambitious teams</li>
          <li>Software engineer, frontend developer, UI/UX designer jobs</li>
          <li>Fresher and experienced tech jobs in Kochi, Trivandrum</li>
        </ul>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden md:min-h-[calc(100vh-64px)] flex flex-col">

        <div className="mx-auto max-w-6xl px-6 pt-8 md:pt-12 flex-shrink-0">
          <div className="mx-auto max-w-3xl text-center">
            {/* Animated Text - Hero */}
            <h1 className="flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-semibold px-2">
              <LayoutGroup>
                <motion.div className="flex flex-wrap md:flex-nowrap md:whitespace-nowrap justify-center items-center gap-x-1 sm:gap-x-2" layout>
                  <motion.span
                    className="selection:bg-[#149F65] pt-0.5 sm:pt-1 md:pt-2 text-foreground font-outfit"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    Where
                  </motion.span>
                  <TextRotate
                    texts={[
                      "engineers",
                      "visionaries",
                      "designers",
                      "thinkers",
                      "strategists",
                      "talents",
                      "leaders",
                      "builders",
                      "experts"
                    ]}
                    mainClassName="font-outfit selection:bg-[#149F65] text-foreground px-1.5 sm:px-2 md:px-3 bg-[#149F65] overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-md sm:rounded-lg"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                  <motion.span
                    className="selection:bg-[#149F65] font-outfit pt-0.5 sm:pt-1 md:pt-2 text-foreground"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    find their next move.
                  </motion.span>
                </motion.div>
              </LayoutGroup>
            </h1>

            {/* Headline
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find your{" "}
              <span className="squiggle">dream job</span>
              <br />
              without the hassle
            </h1> */}

            {/* Subheadline */}
            <p className="selection:bg-[#149F65] selection:text-white mt-4 font-outfit text-base text-muted-foreground md:text-lg">
              Discover thousands of job opportunities from top companies.
              <br className="hidden sm:block" />
              Your next career move is just a click away.
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 md:mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/jobs">
                <RaisedButton color="#107A4D" className="h-10 md:h-12 rounded-lg px-6 md:px-8 text-sm md:text-base select-none font-outfit">
                  Browse Jobs
                  {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                </RaisedButton>
              </Link>
              {/* <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-base">
                For Employers
              </Button> */}
            </div>
          </div>
        </div>

        {/* Hero Image - Full Width at Bottom */}
        <div
          className="mt-8 md:mt-auto w-full select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <picture>
            {/* Large screens - use hero-1 */}
            <source media="(min-width: 1024px)" srcSet="/hero-2.webp" />
            {/* Medium screens - use hero-2 */}
            <source media="(min-width: 640px)" srcSet="/hero-1.webp" />
            {/* Small screens - use hero-3 */}
            <source srcSet="/hero-3.webp" />
            <img
              src="/hero-1.webp"
              alt="hirebase job board interface showing tech job listings from Kerala companies including Technopark and Infopark"
              className="w-full h-auto pointer-events-none invert dark:invert-0"
              draggable="false"
            />
          </picture>
        </div>
        <br />
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] border-b border-border" />
      </section >

      <section className="selection:bg-[#149F65] selection:text-white min-h-screen place-content-center font-outfit pt-8 md:pt-0">
        <FeatureSection />
      </section>

      {/* Stats Section
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Job Seekers</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Trusted By Section */}
      <section className="relative mx-auto max-w-3xl">
        {/* <h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-3xl"> */}
        {/* <span className="text-muted-foreground">Trusted by experts.</span> */}
        {/* <br />
          <span className="font-semibold font-outfit">Ambitious teams hiring now.</span>
        </h2>
        <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mx-auto my-5 h-px max-w-sm " />
        <LogoCloud />
        <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mt-5 h-px " /> */}
        {/* Full-width border breakout */}
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] border-b border-border" />
      </section>

      {/* About Section */}
      <section className="py-24 relative overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          {/* Left vertical line */}
          <div className="absolute left-0 -top-24 -bottom-24 w-px bg-border hidden md:block" />
          {/* Right vertical line */}
          <div className="absolute right-0 -top-24 -bottom-24 w-px bg-border hidden md:block" />

          <h2 className="selection:bg-[#149F65] text-3xl md:text-4xl font-bold tracking-tight mb-12 font-outfit">
            Why hirebase?
          </h2>

          <div className="selection:bg-[#149F65] selection:text-white text-lg md:text-xl leading-relaxed space-y-6 text-muted-foreground font-outfit text-justify">
            <p>
              Finding your next opportunity shouldn't feel like a full-time job.{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-primary-foreground"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                We've built hirebase to change that.
              </TextHighlighter>{" "}

            </p>

            <p>
              The internet is rotting with
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-primary-foreground"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                dead links and ghost jobs.
              </TextHighlighter>{" "}
              Listings on major boards are already filled or were never real to begin with they exist solely to harvest your data, pad metrics, or simulate growth to investors.
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-primary-foreground"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                Traditional platforms are incentivized to keep you searching,
              </TextHighlighter>{" "}
              selling your information to resume farms and bootcamps while allowing third-party headhunters to spam you with irrelevant roles.
            </p>

            <p>

              <TextHighlighter
                className="rounded-[0.3em] px-1 text-primary-foreground"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                We're the bouncer at the door of your career.
              </TextHighlighter>{" "}
              Every listing on hirebase is verified for quality and legitimacy. If we can't verify the hiring manager's identity, the role doesn't get posted.
              Your job search should be focused on finding the right fit, not avoiding scams.{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-primary-foreground"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.5 }}
              >
                That's the firewall we built.
              </TextHighlighter>{" "}

            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="flex items-center justify-center py-10 font-outfit">
          <CallToAction />
        </div>
      </section>
      <div className="border-b-2 border-border" />
    </div >
  );
}
