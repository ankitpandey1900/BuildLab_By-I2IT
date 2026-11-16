"use client";

import React from "react";
import { motion } from "framer-motion";
import type { TeamMember } from "@/data/teamsData";

interface CarouselIndicatorsProps {
  members?: TeamMember[];
  mentors?: TeamMember[];
  activeIndex: number;
  onSelect: (index: number) => void;
  carouselId?: string;
}

export const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  members,
  mentors,
  activeIndex,
  onSelect,
  carouselId = "mentors",
}) => {
  const list = members || mentors || [];

  return (
    <div
      className="mt-6 flex items-center justify-center gap-2.5"
      role="tablist"
      aria-label="Select carousel slide"
    >
      {list.map((member, index) => {
        const isSelected = index === activeIndex;
        return (
          <button
            key={member.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={`View ${member.name}`}
            onClick={() => onSelect(index)}
            className="group relative flex h-6 items-center justify-center py-2 focus:outline-none"
          >
            {isSelected ? (
              <motion.span
                layoutId={`active-carousel-pill-${carouselId}`}
                className="h-2 w-7 rounded-full bg-zinc-900 dark:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] dark:shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            ) : (
              <span className="h-2 w-2 rounded-full bg-zinc-400/40 dark:bg-white/20 transition-all duration-200 group-hover:scale-125 group-hover:bg-zinc-700 dark:group-hover:bg-white/40" />
            )}
          </button>
        );
      })}
    </div>
  );
};
