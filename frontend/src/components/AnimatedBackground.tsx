import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  // SVG for a 4-point star like in the screenshot
  const Star = ({ className, style, animate, transition }: any) => (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      animate={animate}
      transition={transition}
    >
      <path
        d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
        fill="currentColor"
      />
    </motion.svg>
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#061419]">
      {/* Subtle background aurora glows */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0d2a33] blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0a232b] blur-[120px]"
      />

      {/* Floating 4-point stars */}
      {[...Array(30)].map((_, i) => {
        const size = Math.random() * 12 + 4; // 4px to 16px
        return (
          <Star
            key={i}
            className="absolute text-[#337a8b] drop-shadow-[0_0_8px_rgba(51,122,139,0.8)]"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        );
      })}

      {/* Very faint dotted grid for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNCkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-70" />
    </div>
  );
}
