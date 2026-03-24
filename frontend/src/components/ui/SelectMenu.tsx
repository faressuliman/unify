import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  id: string;
  label: ReactNode;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  isRTL?: boolean;
}

export default function SelectMenu({ id, label, value, options, onChange, isRTL = false }: SelectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 text-start" ref={dropdownRef}>
      <label htmlFor={id} className="text-sm font-medium leading-none text-tertiary block text-start">
        {label}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`peer w-full h-10 rounded-md border-0 bg-gray-50/50 ps-3 pe-10 text-sm text-slate-700 focus:outline-none transition duration-300 cursor-pointer flex items-center justify-start ${isOpen ? 'focus-visible:ring-0' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{selectedOption?.label ?? ''}</span>
        </button>

        <div className={`pointer-events-none absolute inset-0 rounded-md border-2 border-secondary transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'peer-focus:opacity-100 opacity-0'}`} />

        <ChevronDown
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${isRTL ? 'left-3' : 'right-3'}`}
        />

        {isOpen && (
          <div className="absolute z-30 mt-1 w-full rounded-md border border-input bg-white shadow-md max-h-52 overflow-y-auto">
            <ul role="listbox" className="py-1">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-start px-3 py-2 text-sm cursor-pointer transition-colors ${
                      option.value === value
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
