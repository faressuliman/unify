import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";

interface DeleteChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  onDeleteConfirm: () => void;
}

export default function DeleteChatModal({
  isOpen,
  onOpenChange,
  isRTL,
  onDeleteConfirm,
}: DeleteChatModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={isRTL ? "rtl" : "ltr"}
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <DialogPrimitive.Title className="text-xl font-bold text-slate-800 mb-2">
                {isRTL
                  ? "حذف المحادثة من صندوق الرسائل؟"
                  : "Delete chat from inbox?"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-500 px-2 leading-relaxed">
                {isRTL ? (
                  <>
                    سيؤدي هذا إلى إزالة المحادثة من صندوق الرسائل الخاص بك ومسح
                    سجل المحادثة. للتوقف عن تلقي رسائل جديدة من هذا الحساب،{" "}
                    <strong className="font-semibold text-slate-700">
                      قم بحظر الحساب أولاً ثم احذف المحادثة.
                    </strong>
                  </>
                ) : (
                  <>
                    This will remove the chat from your inbox and erase the chat
                    history. To stop receiving new messages from this account,{" "}
                    <strong className="font-semibold text-slate-700">
                      first block the account then delete the chat.
                    </strong>
                  </>
                )}
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => {
                onDeleteConfirm();
                onOpenChange(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isRTL ? "حذف" : "Delete"}
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
