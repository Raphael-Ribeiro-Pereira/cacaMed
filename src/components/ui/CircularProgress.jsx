import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CircularProgress({ progress, label, delay = 0, themeHex }) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setCurrentProgress(progress), delay * 1000);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="#1E293B" strokeWidth="2.5" fill="transparent" />
        <circle cx="24" cy="24" r={radius} stroke={themeHex} strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-[1500ms] ease-out" />
      </svg>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }} className="absolute text-[10px] text-white font-bold">{label}</motion.span>
    </div>
  );
}
