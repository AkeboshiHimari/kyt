"use client";

import { motion } from "framer-motion";
import { BoxReveal } from "@/components/ui/box-reveal";

interface SessionIntroProps {
  onComplete: () => void;
}

export function SessionIntro({ onComplete }: SessionIntroProps) {
  return (
    <motion.div 
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <BoxReveal 
        duration={1}
        onComplete={onComplete}
      >
        세션 완료
      </BoxReveal>
    </motion.div>
  );
}
