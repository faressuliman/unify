import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface SubmitButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function SubmitButton({
  children,
  className = '',
  isLoading = false,
  disabled,
  ...props
}: SubmitButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.01 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={`flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary text-white shadow-2xl shadow-secondary/20 text-sm sm:text-base md:text-lg font-bold transition-all hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary cursor-pointer font-sans ${className}`}
      {...props}
      disabled={isDisabled}
    >
      {isLoading ? (
        <div
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </motion.button>
  );
}
