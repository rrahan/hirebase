"use client";

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

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex flex-col">

        <div className="mx-auto max-w-6xl px-6 pt-8 md:pt-12 flex-shrink-0">
          <div className="mx-auto max-w-3xl text-center">
            {/* Animated Text - Hero */}
            <div className="flex items-center justify-center text-2xl sm:text-3xl md:text-5xl font-sans font-semibold">
              <LayoutGroup>
                <motion.div className="flex whitespace-pre" layout>
                  <motion.span
                    className="selection:bg-[#149F65] pt-0.5 sm:pt-1 md:pt-2 text-foreground font-outfit"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    Where{" "}
                  </motion.span>
                  <TextRotate
                    texts={[
                      "strategists",
                      "talents",
                      "leaders",
                      "builders",
                      "experts",
                      "engineers",
                      "visionaries",
                      "designers",
                      "thinkers",
                    ]}
                    mainClassName="font-outfit selection:bg-[#149F65] text-foreground px-2 sm:px-2 md:px-3 bg-[#149F65] overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
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
                    {" "}find their next move.
                  </motion.span>
                </motion.div>
              </LayoutGroup>
            </div>

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
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/jobs">
                <RaisedButton color="#107A4D" className="h-12 rounded-lg px-8 text-base select-none font-outfit">
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
          className="mt-auto w-full select-none"
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
              alt="Hero illustration"
              className="w-full h-auto pointer-events-none invert dark:invert-0"
              draggable="false"
            />
          </picture>
        </div>
        <br />
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] border-b border-border" />
      </section>

      <section className="min-h-screen place-content-center font-outfit">
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
        {/* Grid Background Lines */}
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -mx-[50vw] pointer-events-none">
          <div className="h-full max-w-6xl mx-auto grid grid-cols-4 lg:grid-cols-6">
            <div className="border-x border-border/50" />
            <div className="border-r border-border/50" />
            <div className="border-r border-border/50 hidden sm:block" />
            <div className="border-r border-border/50 hidden sm:block" />
            <div className="border-r border-border/50 hidden lg:block" />
            <div className="border-r border-border/50 hidden lg:block" />
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 font-outfit">
            Why hirebase?
          </h2>

          <div className="text-lg md:text-xl leading-relaxed space-y-6 text-muted-foreground font-outfit">
            <p>
              Finding your next opportunity shouldn't feel like a full-time job.{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-white"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                We've built hirebase to change that.
              </TextHighlighter>{" "}
              Our platform brings together thousands of verified job listings from top companies, all in one place.
            </p>

            <p>
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-white"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                Smart search and AI-powered recommendations
              </TextHighlighter>{" "}
              help you discover roles that truly match your skills and aspirations. No more endless scrolling through irrelevant postings.
            </p>

            <p>
              Apply to multiple positions with a single click.{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-white"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                Your profile does the work for you.
              </TextHighlighter>{" "}
              Track every application in real-time and never lose sight of an opportunity.
            </p>

            <p>
              Connect directly with{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-white"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.3 }}
              >
                recruiters and hiring managers
              </TextHighlighter>{" "}
              from startups to Fortune 500 enterprises. Build meaningful connections that accelerate your career.
            </p>

            <p>
              Every listing on hirebase is{" "}
              <TextHighlighter
                className="rounded-[0.3em] px-1 text-white"
                transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
                highlightColor="#149F65"
                useInViewOptions={{ once: true, initial: false, amount: 0.5 }}
              >
                verified for quality and legitimacy.
              </TextHighlighter>{" "}
              We believe your job search should be focused on finding the right fit—not avoiding scams.
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
    </div>
  );
}
