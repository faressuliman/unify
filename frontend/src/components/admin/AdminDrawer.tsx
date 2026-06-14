import type { ComponentType } from 'react';
import { Sheet, SheetContent, SheetClose } from '../ui/sheet';
import { X } from 'lucide-react';

export type AdminDrawerItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  tone: 'red' | 'amber' | 'slate' | 'blue' | 'secondary';
};

interface AdminDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isRTL: boolean;
  title: string;
  subtitle: string;
  items: AdminDrawerItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function AdminDrawer({
  isOpen,
  setIsOpen,
  isRTL,
  title,
  subtitle,
  items,
  activeId,
  onSelect,
}: AdminDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[85vw] sm:w-87.5 p-0 overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-tertiary">{title}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <SheetClose className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-secondary shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-start">{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                       className={`shrink-0 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold ${
                        item.tone === 'red'
                          ? 'bg-red-500 text-white'
                          : item.tone === 'amber'
                            ? 'bg-amber-500 text-white'
                            : item.tone === 'secondary'
                              ? 'bg-secondary text-white'
                              : isActive
                                ? 'bg-secondary text-white'
                                : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
