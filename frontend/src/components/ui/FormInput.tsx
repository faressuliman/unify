import React from 'react';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  id: string;
  className?: string;
  labelClassName?: string;
  suffix?: React.ReactNode;
};

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, className = '', labelClassName, suffix, ...props }, ref) => {
    const baseInputClass =
      'peer flex h-10 w-full rounded-md border-0 bg-gray-50/50 px-3 py-2 text-sm text-slate-700 ring-offset-background placeholder:text-muted-foreground transition duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

    return (
      <div className="space-y-2 text-start">
        {label !== null && label !== undefined ? (
          <label htmlFor={id} className={labelClassName ?? 'text-sm font-medium leading-none text-tertiary block text-start'}>
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input id={id} ref={ref} className={`${baseInputClass} ${className}`.trim()} {...props} />
          {suffix}
          <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-secondary opacity-0 peer-focus:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
