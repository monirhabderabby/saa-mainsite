"use client";
import { logoSrcBlack, logoSrcWhite } from "@/constants/assets";
import { motion } from "framer-motion"; // Import framer-motion
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const LogoImageForLogin = () => {
  const { resolvedTheme, theme } = useTheme();
  const [isThemeResolved, setIsThemeResolved] = useState(false);

  useEffect(() => {
    if (theme !== undefined) {
      setIsThemeResolved(true);
    }
  }, [theme]); // Trigger when theme is resolved

  // Fallback until the theme is determined
  if (!isThemeResolved) {
    return (
      <motion.div
        initial={{ opacity: 0 }} // Start with opacity 0
        animate={{ opacity: 1 }} // Animate to opacity 1 (fade-in)
        transition={{ duration: 0.5 }} // Set transition duration
      >
        <Image
          src={logoSrcBlack} // Fallback to light logo
          alt="logo"
          width={180}
          height={57}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={resolvedTheme} // Ensure it animates correctly when theme changes
      initial={{ opacity: 0 }} // Start with opacity 0
      animate={{ opacity: 1 }} // Animate to opacity 1 (fade-in)
      exit={{ opacity: 0 }} // Fade out when changing themes
      transition={{ duration: 0.5 }} // Transition duration
    >
      <Image
        src={resolvedTheme === "light" ? logoSrcBlack : logoSrcWhite}
        alt="logo"
        width={180}
        height={57}
      />
    </motion.div>
  );
};

export default LogoImageForLogin;
