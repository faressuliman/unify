import { Info } from 'lucide-react';

interface IProps {
  msg?: string;
  className?: string;
}

const ErrorMessage = ({ msg, className = '' }: IProps) => {
  return msg ? (
    <p className={`mt-1 flex text-start items-center gap-1 text-red-500 font-semibold justify-start ${className}`.trim()}>
      <Info className="w-4 h-4 text-red-900 shrink-0" />
      {msg}
    </p>
  ) : null;
};

export default ErrorMessage;
