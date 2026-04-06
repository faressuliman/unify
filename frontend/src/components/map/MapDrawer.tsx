import type { ReactNode } from 'react';
import { ListFilter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface MapDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isRTL: boolean;
  triggerLabel: string;
  content: ReactNode;
}

export default function MapDrawer({
  isOpen,
  setIsOpen,
  isRTL,
  triggerLabel,
  content,
}: MapDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-tertiary font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer"
        >
          <ListFilter className="w-4 h-4" />
          {triggerLabel}
        </button>
      </SheetTrigger>

      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[85vw] sm:w-87.5 p-0"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}