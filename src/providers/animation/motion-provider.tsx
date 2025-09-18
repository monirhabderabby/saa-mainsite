"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <motion.div
      initial={{ opacity: 0.6, filter: "blur(1px)" }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.7, delay: 0.1 },
      }}
      className=""
    >
      {children}
    </motion.div>
  );
}
