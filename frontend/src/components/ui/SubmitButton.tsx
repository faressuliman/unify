import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface SubmitButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
}

export default function SubmitButton({ children, className = '', ...props }: SubmitButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary text-white shadow-2xl shadow-secondary/20 text-sm sm:text-base md:text-lg font-bold transition-all hover:bg-secondary/90 disabled:opacity-50 cursor-pointer font-sans ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
