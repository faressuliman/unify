import { Info } from 'lucide-react';

interface IProps {
  msg?: string;
  className?: string;
}

const ErrorMessage = ({ msg, className = '' }: IProps) => {
  return msg ? (
    <p className={`mt-1 flex text-start items-center gap-1.5 text-red-500 font-semibold justify-start whitespace-normal break-words text-xs sm:text-sm ${className}`.trim()}>
      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-900 shrink-0" />
      <span className="leading-snug">{msg}</span>
    </p>
  ) : null;
};

export default ErrorMessage;
