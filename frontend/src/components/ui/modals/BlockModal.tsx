import * as DialogPrimitive from '@radix-ui/react-dialog';
import { UserX } from 'lucide-react';

interface BlockModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  username: string;
  onBlockConfirm: () => void;
}

export default function BlockModal({ isOpen, onOpenChange, isRTL, username, onBlockConfirm }: BlockModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <UserX className="h-6 w-6" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {isRTL ? `حظر ${username}؟` : `Block ${username}?`}
              </h2>
              <p className="text-sm text-slate-500 px-2 leading-relaxed">
                {isRTL 
                  ? "لن يتمكنوا من العثور على ملفك الشخصي أو منشوراتك على Unify. لن نخبرهم أنك قمت بحظرهم." 
                  : "They won't be able to find your profile or posts on Unify. Unify won't let them know you blocked them."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => {
                onBlockConfirm();
                onOpenChange(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isRTL ? "حظر" : "Block"}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
