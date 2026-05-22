import { useState, useEffect } from "react";
import { Loader2, Mail, CheckCircle2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, type BackendContactMessage } from "../../lib/api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function ContactMessagesPanel({
  t,
  isRTL,
  onReplied,
}: {
  t: { sectionTitles?: { contact_messages?: string } };
  isRTL: boolean;
  onReplied?: () => void;
}) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<BackendContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyingTo, setReplyingTo] = useState<BackendContactMessage | null>(null);

  const fetchMessages = async (p: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await adminApi.getContactMessages(token, { page: p, limit: 10 });
      setMessages(res.messages);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch contact messages", err);
      toast.error(isRTL ? "فشل جلب الرسائل" : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page, token]);

  const handleReply = async (messageId: string, replyText: string) => {
    if (!token) return;
    try {
      await adminApi.replyToContactMessage(messageId, replyText, token);
      toast.success(isRTL ? "تم إرسال الرد بنجاح" : "Reply sent successfully");
      setReplyingTo(null);
      // Refresh messages to show the "Replied" badge
      fetchMessages(page);
      if (onReplied) onReplied();
    } catch (err) {
      console.error("Failed to send reply", err);
      toast.error(isRTL ? "فشل إرسال الرد" : "Failed to send reply");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-tertiary font-bold text-start">
          {t?.sectionTitles?.contact_messages ||
            (isRTL ? "رسائل التواصل" : "Contact Messages")}
        </h2>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-secondary animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Mail className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          {isRTL ? "لا توجد رسائل حالياً" : "No messages found."}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {messages.map((msg) => (
            <li key={msg._id} className="p-4 sm:px-5 sm:py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col gap-2 w-full text-start">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-tertiary truncate">{msg.subject}</p>
                      {msg.isReplied && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold whitespace-nowrap">
                          <Check className="w-3 h-3" />
                          {isRTL ? "تم الرد" : "Replied"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{msg.name} ({msg.email})</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(msg.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(msg)}
                    disabled={msg.isReplied}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      msg.isReplied
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-secondary text-white hover:bg-secondary/90"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {isRTL ? "رد" : "Reply"}
                  </button>
                </div>
                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
          >
            {isRTL ? "السابق" : "Prev"}
          </button>
          <span className="text-xs text-slate-500">
            {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
          >
            {isRTL ? "التالي" : "Next"}
          </button>
        </div>
      )}

      <AnimatePresence>
        {replyingTo && (
          <ReplyModal
            message={replyingTo}
            onClose={() => setReplyingTo(null)}
            onSubmit={handleReply}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReplyModal({
  message,
  onClose,
  onSubmit,
  isRTL,
}: {
  message: BackendContactMessage;
  onClose: () => void;
  onSubmit: (id: string, text: string) => Promise<void>;
  isRTL: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onSubmit(message._id, replyText);
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 bg-slate-950/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? "rtl" : "ltr"}
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-start"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-tertiary">
              {isRTL ? "الرد على الرسالة" : "Reply to Message"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isRTL ? "إلى:" : "To:"} {message.name} ({message.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
            <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
              {isRTL ? "الرسالة الأصلية" : "Original Message"}
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.message}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              {isRTL ? "نص الرد" : "Reply Text"}
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isRTL ? "اكتب ردك هنا (سيتم إرساله كبريد إلكتروني)..." : "Write your reply here (will be sent as email)..."}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-secondary outline-none resize-none text-slate-700"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending || !replyText.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isRTL ? "إرسال" : "Send Reply"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}