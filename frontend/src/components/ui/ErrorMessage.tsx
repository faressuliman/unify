import { Info } from 'lucide-react';

interface IProps {
  msg?: string;
}

const ErrorMessage = ({ msg }: IProps) => {
  return msg ? (
    <p className="mt-1 flex items-center gap-1 text-xs sm:text-base text-red-500 font-semibold">
      <Info className="w-4 h-4 text-red-900" />
      {msg}
    </p>
  ) : null;
};

export default ErrorMessage;
