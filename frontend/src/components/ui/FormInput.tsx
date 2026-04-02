import React from 'react';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  id?: string;
  className?: string;
  labelClassName?: string;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  isRTL?: boolean;
};

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, className = '', labelClassName, suffix, icon, isRTL, ...props }, ref) => {
    const baseInputClass =
      `peer flex h-10 w-full rounded-md border border-gray-300 bg-gray-50/50 ${icon ? (isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3') : 'px-3'} py-2 text-sm text-slate-700 ring-offset-background placeholder:text-muted-foreground transition duration-300 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:opacity-50`;

    return (
      <div className="space-y-2 text-start">
        {label !== null && label !== undefined ? (
          <label htmlFor={id} className={labelClassName ?? 'text-sm font-medium leading-none text-tertiary block text-start'}>
            {label}
          </label>
        ) : null}
        <div className="relative">
          {icon && (
            <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400 transition-colors`}>
              {icon}
            </div>
          )}
          <input id={id} ref={ref} className={`${baseInputClass} ${className}`.trim()} {...props} />
          {suffix}
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
