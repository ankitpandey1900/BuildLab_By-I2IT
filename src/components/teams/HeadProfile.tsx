"use client";

import React from "react";
import { motion } from "framer-motion";
import type { TeamMember } from "@/data/teamsData";
import { TeamMemberCard } from "./TeamMemberCard";

interface HeadProfileProps {
  member: TeamMember;
}

export const HeadProfile: React.FC<HeadProfileProps> = ({ member }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto w-full max-w-4xl"
    >
      <TeamMemberCard member={member} prominent={true} />
    </motion.div>
  );
};
