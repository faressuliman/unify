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
        <svg
          className="h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}
