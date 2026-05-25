import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  X,
  ShieldCheck,
  MessageCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import { claimApi, type BackendClaim } from "@/lib/api";

interface ClaimsListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postName: string;
  isRTL: boolean;
  token: string;
  onStartChat: (claim: BackendClaim) => void;
}

export default function ClaimsListModal({
  isOpen,
  onOpenChange,
  postId,
  postName,
  isRTL,
  token,
  onStartChat,
}: ClaimsListModalProps) {
  const [claims, setClaims] = useState<BackendClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !postId || !token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await claimApi.getClaimsByPost(postId, token);
        const approved = (res.claims || []).filter(
          (claim) => claim.status === "approved",
        );
        setClaims(approved);
      } catch (err) {
        const e = err as Error;
        setError(
          e.message || (isRTL ? "فشل تحميل المطالبات" : "Failed to load claims"),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isOpen, postId, token, isRTL]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-slate-950/40 modal-overlay" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-1.25rem)] max-h-[90vh] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-none modal-pop"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="modal-panel flex h-full min-h-0 flex-col">
            <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <div
                    className={`absolute top-5 ${isRTL ? "left-5" : "right-5"}`}
                  >
                    <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition-colors hover:bg-slate-200">
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  </div>
                  <div className="flex items-start gap-3 pe-10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-secondary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                        {isRTL ? "المطالبات المعتمدة" : "Approved Claims"}
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description className="text-sm text-slate-500 mt-0.5">
                        {isRTL ? `للحالة: ${postName}` : `For: ${postName}`}
                      </DialogPrimitive.Description>
                    </div>
                  </div>
                </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
                  {loading ? (
                    <div className="py-12 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                    </div>
                  ) : error ? (
                    <div className="py-12 text-center text-red-600">
                      {error}
                    </div>
                  ) : claims.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p>
                        {isRTL
                          ? "لا توجد مطالبات معتمدة بعد."
                          : "No approved claims yet."}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {claims.map((claim) => {
                        const claimUser =
                          typeof claim.claimUserId === "object"
                            ? claim.claimUserId
                            : null;
                        const claimName =
                          claimUser?.name ||
                          (isRTL ? "مستخدم" : "User");
                        const claimEmail = claimUser?.email;

                        return (
                          <li
                            key={claim._id}
                            className="rounded-2xl p-4 border border-slate-100 bg-slate-50/40 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => onStartChat(claim)}
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  {claimName}
                                </p>
                                {claimEmail && (
                                  <p className="text-xs text-slate-500 mt-0.5" dir="ltr">
                                    {claimEmail}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onStartChat(claim);
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/20 transition-colors cursor-pointer"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {isRTL ? "بدء المحادثة" : "Start chat"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
