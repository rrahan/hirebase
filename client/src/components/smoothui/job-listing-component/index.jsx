"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { RaisedButton } from "@/components/ui/raised-button";

export default function JobListingComponent({
  jobs,
  className,
  onJobClick
}) {
  const [activeItem, setActiveItem] = useState(null);
  const ref = useRef(null);
  const router = useRouter();

  useOnClickOutside(ref, () => {
    if (activeItem) {
      // Update URL back to /jobs when closing
      window.history.pushState(null, '', '/jobs');
      setActiveItem(null);
    }
  });

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && activeItem) {
        window.history.pushState(null, '', '/jobs');
        setActiveItem(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeItem]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeItem) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [activeItem]);

  const handleJobClick = (role, index) => {
    setActiveItem({ ...role, _index: index });
    // Update URL without navigation (shallow routing)
    if (role.slug) {
      window.history.pushState(null, '', `/job/${role.slug}`);
    }
    if (onJobClick) {
      onJobClick(role);
    }
  };

  // Get apply URL - use website from job data or fallback to company name
  const getApplyUrl = (job) => {
    if (job.website) {
      // Ensure URL has protocol
      return job.website.startsWith('http') ? job.website : `https://${job.website}`;
    }
    // Fallback: generate URL from company name
    const domain = job.company?.toLowerCase().replace(/\s+/g, '') + '.com';
    return `https://${domain}`;
  };

  return (
    <>
      <AnimatePresence>
        {activeItem ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="pointer-events-auto fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => {
              window.history.pushState(null, '', '/jobs');
              setActiveItem(null);
            }} />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {activeItem ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              className="flex h-fit w-[95%] max-w-4xl cursor-default flex-col items-start gap-4 overflow-hidden border bg-background p-6 shadow-lg font-geist"
              layoutId={`workItem-${activeItem.company}-${activeItem._index}`}
              ref={ref}
              style={{ borderRadius: 12 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}>
              <div className="flex w-full items-center gap-4">
                <motion.div layoutId={`workItemLogo-${activeItem.company}-${activeItem._index}`}>
                  {activeItem.logo}
                </motion.div>
                <div className="flex grow items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <motion.div
                      className="font-medium text-foreground text-base"
                      layoutId={`workItemCompany-${activeItem.company}-${activeItem._index}`}>
                      {activeItem.title}
                    </motion.div>
                    <motion.div
                      className="text-muted-foreground text-sm"
                      layoutId={`workItemTitle-${activeItem.company}-${activeItem._index}`}>
                      {activeItem.company} · {activeItem.location} · {activeItem.remote === "Yes" ? "Remote" : activeItem.remote === "Hybrid" ? "Hybrid" : "On-site"}
                    </motion.div>
                    <div className="flex flex-row flex-wrap gap-2 text-muted-foreground text-xs mt-1">
                      {activeItem.level && (
                        <span className="bg-secondary px-2 py-0.5 rounded">{activeItem.level}</span>
                      )}
                      <span className="bg-secondary px-2 py-0.5 rounded">{activeItem.job_time || "Full-time"}</span>
                      {activeItem.date_posted && (
                        <span className="bg-secondary px-2 py-0.5 rounded">{activeItem.date_posted}</span>
                      )}
                    </div>
                  </div>
                  {/* Apply Button */}
                  <a
                    href={`mailto:${activeItem.company_email}?subject=Application for ${encodeURIComponent(activeItem.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 shrink-0"
                  >
                    <RaisedButton color="#107A4D">
                      Apply Now
                    </RaisedButton>
                  </a>
                </div>
              </div>
              <motion.div
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto pr-2"
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                initial={{ opacity: 0 }}
                layout>
                {activeItem.job_description}
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className={`relative flex items-start ${className || ""}`}>
        <div className="relative flex w-full flex-col divide-y divide-border">
          {jobs.map((role, index) => (
            <motion.div
              className="group flex w-full cursor-pointer flex-row items-center gap-4 bg-background p-4 hover:bg-secondary/50 transition-colors font-geist"
              key={`${role.company}-${index}`}
              layoutId={`workItem-${role.company}-${index}`}
              onClick={() => handleJobClick(role, index)}
              style={{ borderRadius: 8 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}>
              <motion.div layoutId={`workItemLogo-${role.company}-${index}`}>
                {role.logo}
              </motion.div>
              <div className="flex w-full flex-col items-start justify-between gap-0.5">
                <motion.div
                  className="font-medium text-foreground text-sm"
                  layoutId={`workItemCompany-${role.company}-${index}`}>
                  {role.title}
                </motion.div>
                <motion.div
                  className="text-muted-foreground text-xs"
                  layoutId={`workItemTitle-${role.company}-${index}`}>
                  {role.company} · {role.location}{role.date_posted && ` · Posted on ${role.date_posted}`}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
