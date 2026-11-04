"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import type { TeamMember } from "@/data/teamsData";
import { TeamMemberCard } from "./TeamMemberCard";
import { CarouselIndicators } from "./CarouselIndicators";

interface MentorCarouselProps {
  mentors: TeamMember[];
}

export const MentorCarousel: React.FC<MentorCarouselProps> = ({ mentors }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const total = mentors.length;
  const maxIndex = Math.max(0, total - 1);

  // ResizeObserver to calculate exact pixel positioning for responsive centering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.offsetWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (total <= 1) return;
      if (next < 0) {
        setActiveIndex(maxIndex);
      } else if (next > maxIndex) {
        setActiveIndex(0);
      } else {
        setActiveIndex(next);
      }
    },
    [maxIndex, total]
  );

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const handlePrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  // Auto-play animation with 3-second delay
  useEffect(() => {
    if (total <= 1 || isPaused || isDragging) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(timer);
  }, [total, isPaused, isDragging, activeIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    const swipeThreshold = 40;
    const velocityThreshold = 300;
    const { offset, velocity } = info;

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      handleNext();
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      handlePrev();
    }
  };

  if (total === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Mentor profiles will appear here.
      </p>
    );
  }

  // Calculate card width & gap based on container width
  const isMobile = containerWidth < 640;
  const gap = isMobile ? 16 : 24;
  const cardWidth = containerWidth
    ? isMobile
      ? Math.max(280, Math.min(containerWidth - 52, 440))
      : Math.min(containerWidth * 0.78, 700)
    : 660;

  // Center offset so active card is centered exactly in container
  const centerOffset = (containerWidth - cardWidth) / 2;
  const targetX = centerOffset - activeIndex * (cardWidth + gap);

  // Drag boundaries for elastic feedback
  const minX = centerOffset - maxIndex * (cardWidth + gap);
  const maxX = centerOffset;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-4 outline-none select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Mentors Carousel - Swipe left or right to change"
    >
      {/* Animated track with touch & mouse drag swipe */}
      <motion.div
        className="flex items-stretch cursor-grab active:cursor-grabbing"
        style={{
          touchAction: "pan-y",
          gap: `${gap}px`,
        }}
        drag="x"
        dragConstraints={{
          left: minX,
          right: maxX,
        }}
        dragElastic={0.25}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{
          x: targetX,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 28,
          mass: 0.8,
        }}
      >
        {mentors.map((mentor, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.div
              key={mentor.id}
              onClick={() => {
                if (!isActive) goTo(index);
              }}
              style={{
                width: `${cardWidth}px`,
              }}
              className={`shrink-0 transition-all duration-300 ${
                isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              }`}
              animate={{
                scale: isActive ? 1 : 0.92,
                opacity: isActive ? 1 : 0.35,
                filter: isActive ? "blur(0px)" : "blur(1.5px)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              aria-hidden={!isActive}
            >
              <TeamMemberCard member={mentor} prominent={isActive} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Indicator dots with smooth morphing animation */}
      <CarouselIndicators
        mentors={mentors}
        activeIndex={activeIndex}
        onSelect={goTo}
      />
    </div>
  );
};
