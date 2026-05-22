'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / totalScroll) * 100;
      setScroll(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ width: `${scroll}%` }}
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 z-50 shadow-lg"
      ></motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-8 right-8 z-40 text-emerald-600 dark:text-emerald-400 pointer-events-none"
      >
        <div className="text-4xl">↓</div>
      </motion.div>
    </>
  );
}
