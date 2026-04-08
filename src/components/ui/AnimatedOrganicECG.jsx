import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function AnimatedOrganicECG({ isHardcore }) {
  const controls = useAnimation();
  
  useEffect(() => {
    let isMounted = true;
    const animate = async () => {
      while (isMounted) {
        const topY = Math.random() * 5 + 1;
        const botY = Math.random() * 5 + 18;
        const waitTime = isHardcore ? Math.random() * 300 + 200 : Math.random() * 800 + 400;
        const beatDuration = isHardcore ? Math.random() * 0.1 + 0.1 : Math.random() * 0.15 + 0.15;
        const beatPath = `M 2 12 L 6 12 L 9 ${topY} L 15 ${botY} L 18 12 L 22 12`;
        const restPath = `M 2 12 L 6 12 L 9 11 L 15 13 L 18 12 L 22 12`;

        if (!isMounted) break;
        await controls.start({ d: beatPath, transition: { duration: beatDuration, ease: "easeOut" } });
        if (!isMounted) break;
        await controls.start({ d: restPath, transition: { duration: beatDuration * 1.5, ease: "easeInOut" } });
        await new Promise(r => setTimeout(r, waitTime));
      }
    };
    animate();
    return () => { isMounted = false; };
  }, [controls, isHardcore]);

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-full h-full transition-colors duration-500 ${isHardcore ? 'text-rose-500' : 'text-cyan-400'}`}>
      <motion.path initial={{ d: "M 2 12 L 6 12 L 9 11 L 15 13 L 18 12 L 22 12" }} animate={controls} />
    </svg>
  );
}
