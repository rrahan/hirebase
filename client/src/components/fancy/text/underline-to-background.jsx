"use client";
import { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils"

const UnderlineToBackground = ({
  children,
  as,
  className,
  transition = { type: "spring", damping: 30, stiffness: 300 },

  // Default to 10% of font size
  underlineHeightRatio = 0.1,

  // Default to 1% of font size
  underlinePaddingRatio = 0.01,

  ...props
}) => {
  const textRef = useRef(null)

  // Create custom motion component based on the 'as' prop
  const MotionComponent = useMemo(() => motion.create(as ?? "span"), [as])

  // Update CSS custom properties based on font size
  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty("--underline-height", `${underlineHeight}px`)
        textRef.current.style.setProperty("--underline-padding", `${underlinePadding}px`)
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)

    return () => window.removeEventListener("resize", updateUnderlineStyles);
  }, [underlineHeightRatio, underlinePaddingRatio])

  // Animation variants for the underline background - expands from bottom to top
  const underlineVariants = {
    initial: {
      height: "var(--underline-height)",
    },
    target: {
      height: "100%",
      transition: transition,
    },
  }

  return (
    <MotionComponent
      className={cn("relative inline-block cursor-pointer group", className)}
      whileHover="target"
      ref={textRef}
      {...props}>
      <motion.div
        className="absolute bg-current w-full"
        style={{
          height: "var(--underline-height)",
          bottom: 0,
        }}
        variants={underlineVariants}
        aria-hidden="true" />
      <span className="relative transition-colors duration-200 group-hover:text-background">
        {children}
      </span>
    </MotionComponent>
  );
}

UnderlineToBackground.displayName = "UnderlineToBackground"

export default UnderlineToBackground
