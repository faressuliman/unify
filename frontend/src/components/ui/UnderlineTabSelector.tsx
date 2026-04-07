import { motion } from 'framer-motion';

export interface UnderlineTabOption {
  value: string;
  label: string;
}

interface UnderlineTabSelectorProps {
  options: UnderlineTabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  indicatorLayoutId?: string;
}

export default function UnderlineTabSelector({
  options,
  value,
  onChange,
  className = '',
  indicatorLayoutId = 'activeTabIndicator',
}: UnderlineTabSelectorProps) {
  return (
    <div className={`flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`py-3 px-8 text-sm sm:text-base font-bold transition-all duration-300 relative cursor-pointer whitespace-nowrap ${
            value === option.value ? 'text-tertiary' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {option.label}
          {value === option.value && (
            <motion.div
              layoutId={indicatorLayoutId}
              className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}