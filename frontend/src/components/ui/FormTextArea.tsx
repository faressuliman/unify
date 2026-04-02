import React from 'react';

type FormTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: React.ReactNode;
  id: string;
  className?: string;
  labelClassName?: string;
};

const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, id, className = '', labelClassName, ...props }, ref) => {
    const baseTextAreaClass =
      'peer w-full rounded-md border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm text-slate-700 ring-offset-background placeholder:text-muted-foreground transition duration-300 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    return (
      <div className="space-y-2 text-start">
        {label !== null && label !== undefined ? (
          <label htmlFor={id} className={labelClassName ?? 'text-sm font-medium leading-none text-tertiary block text-start'}>
            {label}
          </label>
        ) : null}
        <div className="relative">
          <textarea id={id} ref={ref} className={`${baseTextAreaClass} ${className}`.trim()} {...props} />
        </div>
      </div>
    );
  }
);

FormTextArea.displayName = 'FormTextArea';

export default FormTextArea;