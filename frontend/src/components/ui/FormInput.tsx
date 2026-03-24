import React from 'react';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  id: string;
  className?: string;
  labelClassName?: string;
};

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, className = '', labelClassName, ...props }, ref) => {
    return (
      <div className="space-y-2 text-start">
        <label htmlFor={id} className={labelClassName ?? 'text-sm font-medium leading-none text-tertiary block text-start'}>
          {label}
        </label>
        <div className="relative">
          <input id={id} ref={ref} className={`peer ${className}`} {...props} />
          <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-secondary opacity-0 peer-focus:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
