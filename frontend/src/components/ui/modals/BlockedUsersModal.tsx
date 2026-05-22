import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserX, Unlock, Loader2, User } from "lucide-react";
import { userApi, type BlockedUser } from "@/lib/api";
import { toast } from "sonner";

interface BlockedUsersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  token: string;
}

export default function BlockedUsersModal({
  isOpen,
  onOpenChange,
  isRTL,
  token,
}: BlockedUsersModalProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !token) return;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await userApi.getBlockedUsers(token);
        setBlockedUsers(res.blockedUsers || []);
      } catch (err) {
        toast.error(
          isRTL ? "فشل تحميل قائمة الحظر" : "Failed to load blocked users",
        );
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, [isOpen, token, isRTL]);

  const handleUnblock = async (user: BlockedUser) => {
    try {
      setUnblockingId(user._id);
      await userApi.unblockUser(user._id, token);
      setBlockedUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success(
        isRTL ? `تم إلغاء حظر ${user.name}` : `Unblocked ${user.name}`,
      );
    } catch (err) {
      toast.error(isRTL ? "فشل إلغاء الحظر" : "Failed to unblock user");
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-1.25rem)] max-h-[85vh] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-none"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div
                    className={`absolute top-5 ${isRTL ? "left-5" : "right-5"}`}
                  >
                    <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition-colors hover:bg-slate-200">
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  </div>
                  <div className="flex items-center gap-3 pe-10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <UserX className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                        {isRTL ? "المستخدمون المحظورون" : "Blocked Users"}
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description className="text-sm text-slate-500 mt-0.5">
                        {isRTL
                          ? "إدارة الأشخاص الذين قمت بحظرهم"
                          : "Manage people you have blocked"}
                      </DialogPrimitive.Description>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {loading ? (
                    <div className="py-12 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <UserX className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-700 mb-1">
                        {isRTL
                          ? "لا يوجد مستخدمين محظورين"
                          : "No blocked users"}
                      </p>
                      <p className="text-sm">
                        {isRTL
                          ? "قائمة الحظر الخاصة بك فارغة."
                          : "Your block list is empty."}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {blockedUsers.map((u) => (
                        <li
                          key={u._id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {u.idImagePath ? (
                                <img
                                  src={u.idImagePath}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 text-sm truncate">
                                {u.name}
                              </p>
                              {u.email && (
                                <p className="text-xs text-slate-500 truncate">
                                  {u.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblock(u)}
                            disabled={unblockingId === u._id}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {unblockingId === u._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                            {isRTL ? "إلغاء الحظر" : "Unblock"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
