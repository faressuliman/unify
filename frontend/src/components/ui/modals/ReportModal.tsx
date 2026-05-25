import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  X,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  onReportSubmit: (reason: string, subReasons?: string[]) => void;
  username?: string;
  onBlockClick?: () => void;
}

const REPORT_REASONS = {
  "Harassment or bullying": {
    guidelines: [
      "Insults, humiliation, or mocking.",
      "Repeated harassment or intimidation.",
      "Cyberbullying targeting individuals.",
      "Personal attacks or degrading comments.",
      "Sexual harassment or unwanted sexual behavior.",
    ],
    subReasons: [
      "Insults or mocking",
      "Repeated harassment",
      "Cyberbullying",
      "Personal attacks",
      "Sexual harassment",
    ],
  },
  "Hate speech": {
    guidelines: [
      "Racist or discriminatory language.",
      "Religious or cultural hate speech.",
      "Offensive stereotypes targeting groups.",
      "Content encouraging hatred or exclusion.",
      "Attacks based on identity or background.",
    ],
    subReasons: [
      "Racist content",
      "Religious hate",
      "Discrimination",
      "Offensive stereotypes",
      "Encouraging hate",
    ],
  },
  "Threats or violence": {
    guidelines: [
      "Threats of physical harm.",
      "Violent or intimidating messages.",
      "Content encouraging violence.",
      "Dangerous or aggressive behavior.",
      "Threats toward individuals or groups.",
    ],
    subReasons: [
      "Physical threats",
      "Violent messages",
      "Encouraging violence",
      "Intimidation",
      "Dangerous behavior",
    ],
  },
  "Spam or scams": {
    guidelines: [
      "Repeated unwanted messages.",
      "Fake giveaways or misleading offers.",
      "Suspicious or harmful links.",
      "Phishing or account theft attempts.",
      "Requests for money under false pretenses.",
    ],
    subReasons: [
      "Repeated messages",
      "Fake giveaways",
      "Suspicious links",
      "Phishing attempts",
      "Money scams",
    ],
  },
  "Fake account / impersonation": {
    guidelines: [
      "Accounts pretending to be someone else.",
      "Use of fake or stolen photos.",
      "False identity information.",
      "Impersonation of public figures or organizations.",
      "Duplicate or deceptive accounts.",
    ],
    subReasons: [
      "Pretending to be someone else",
      "Using fake photos",
      "Fake identity information",
      "Impersonating a public figure",
      "Duplicate account",
    ],
  },
  "Suspicious behavior": {
    guidelines: [
      "Bot-like or automated activity.",
      "Suspicious account interactions.",
      "Attempts to hack or exploit users.",
      "Unusual or deceptive behavior.",
      "Requests that may compromise security.",
    ],
    subReasons: [
      "Strange activity",
      "Possible hacking attempt",
      "Bot-like behavior",
      "Suspicious requests",
      "Unusual interactions",
    ],
  },
  "Inappropriate content": {
    guidelines: [
      "Sexual or explicit content.",
      "Nudity or inappropriate imagery.",
      "Offensive or disturbing posts.",
      "Explicit or vulgar language.",
      "Content unsuitable for the platform.",
    ],
    subReasons: [
      "Sexual content",
      "Nudity",
      "Offensive images",
      "Disturbing posts",
      "Explicit language",
    ],
  },
  "False information": {
    guidelines: [
      "Fake or misleading news.",
      "False claims presented as facts.",
      "Manipulated or deceptive content.",
      "Incorrect profile or account information.",
      "Attempts to spread misinformation.",
    ],
    subReasons: [
      "Fake news",
      "Misleading claims",
      "False profile details",
      "Incorrect information",
      "Manipulated content",
    ],
  },
  "Graphic or disturbing content": {
    guidelines: [
      "Violent or graphic imagery.",
      "Gore or disturbing videos.",
      "Content showing abuse or cruelty.",
      "Shocking or traumatic material.",
      "Content intended to disturb users.",
    ],
    subReasons: [
      "Violent images",
      "Gore content",
      "Disturbing videos",
      "Animal abuse",
      "Shocking content",
    ],
  },
  "Illegal activity": {
    guidelines: [
      "Drug-related activity.",
      "Promotion of illegal weapons.",
      "Fraud, theft, or criminal behavior.",
      "Selling prohibited or illegal items.",
      "Content encouraging illegal acts.",
    ],
    subReasons: [
      "Drug-related activity",
      "Weapon-related content",
      "Fraud or theft",
      "Selling illegal items",
      "Criminal activity",
    ],
  },
  "Copyright violation": {
    guidelines: [
      "Stolen or copied images.",
      "Unauthorized reposting of content.",
      "Use of copyrighted material without permission.",
      "False ownership claims.",
      "Reuploading protected media or work.",
    ],
    subReasons: [
      "Stolen images",
      "Unauthorized reposting",
      "Copied content",
      "Using copyrighted material",
      "Fake ownership claims",
    ],
  },
  "Offensive language": {
    guidelines: [
      "Abusive or insulting language.",
      "Excessive swearing or vulgarity.",
      "Sexually offensive comments.",
      "Humiliating or degrading speech.",
      "Hate-filled or toxic remarks.",
    ],
    subReasons: [
      "Swearing",
      "Abusive language",
      "Sexually offensive words",
      "Insensitive jokes",
      "Humiliating comments",
    ],
  },
  "Fraudulent activity": {
    guidelines: [
      "Financial scams or deception.",
      "Identity theft attempts.",
      "Fake transactions or payments.",
      "Misleading financial requests.",
      "Attempts to steal sensitive information.",
    ],
    subReasons: [
      "Financial scam",
      "Identity theft",
      "Fake transactions",
      "Payment fraud",
      "Deceptive behavior",
    ],
  },
  "Misleading profile information": {
    guidelines: [
      "Fake names or identities.",
      "False age or personal details.",
      "Misleading profile photos.",
      "Fake education or job information.",
      "Edited or deceptive profile content.",
    ],
    subReasons: [
      "Fake name",
      "Fake age",
      "False job or education",
      "Edited or misleading photos",
      "Incorrect personal details",
    ],
  },
  "Repeated unwanted contact": {
    guidelines: [
      "Persistent unwanted messaging.",
      "Repeated follow or contact requests.",
      "Attempts to contact blocked users.",
      "Harassing communication patterns.",
      "Unwanted calls or spam interactions.",
    ],
    subReasons: [
      "Spam messaging",
      "Ignoring blocks",
      "Persistent harassment",
      "Unwanted calls or messages",
      "Repeated follow requests",
    ],
  },
  "Abuse of platform rules": {
    guidelines: [
      "Violations of community guidelines.",
      "Misuse of platform features.",
      "Attempts to manipulate the system.",
      "Creation of multiple abusive accounts.",
      "Use of banned or restricted content.",
    ],
    subReasons: [
      "Breaking community guidelines",
      "Using banned content",
      "Manipulating the platform",
      "Creating multiple accounts",
      "Misusing features",
    ],
  },
};

const NOT_LISTED = "The problem isn't listed here";

export default function ReportModal({
  isOpen,
  onOpenChange,
  isRTL,
  onReportSubmit,
  username,
  onBlockClick,
}: ReportModalProps) {
  const navigate = useNavigate();
  const [selectedMainReason, setSelectedMainReason] = useState<string | null>(
    null,
  );
  const [selectedSubReasons, setSelectedSubReasons] = useState<Set<string>>(
    new Set(),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setSelectedMainReason(null);
    setSelectedSubReasons(new Set());
    setIsSubmitted(false);
    onOpenChange(false);
  };

  const toggleSubReason = (reason: string) => {
    setSelectedSubReasons((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!selectedMainReason) return;
    onReportSubmit(selectedMainReason, Array.from(selectedSubReasons));
    setIsSubmitted(true);
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={isRTL ? "rtl" : "ltr"}
          className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col gap-4 border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[85vh] overflow-hidden"
        >
          {isSubmitted ? (
            <div className="flex flex-col items-center text-center py-4 px-2 relative">
              <div
                className={`absolute -top-2 ${isRTL ? "-left-2" : "-right-2"}`}
              >
                <DialogPrimitive.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <DialogPrimitive.Title className="text-xl font-bold text-slate-800 mb-3">
                {isRTL
                  ? "شكراً، لقد تلقينا بلاغك"
                  : "Thanks, we received your report"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-600 leading-relaxed mb-8">
                {isRTL
                  ? "سنتخذ إجراءً ضد هذا الحساب إذا وجدنا أنه يتعارض مع معايير المجتمع الخاصة بنا. إذا كنت قلقاً من أن هذا الشخص في خطر داهم، فقد ترغب في التوصية بخط مساعدة أو الاتصال به بنفسك. يمكنك العثور على مزيد من المعلومات في مواردنا."
                  : "We'll take action against this account if we find that it goes against our Community Standards. If you are worried this person is in immediate danger, you might want to recommend helpline or call one yourself. You can find more info in our resources."}
              </DialogPrimitive.Description>

              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (onBlockClick) onBlockClick();
                    else
                      toast.success(
                        isRTL ? "تم الحظر بنجاح" : "Blocked successfully",
                      );
                    handleClose();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  {isRTL
                    ? `حظر ${username || "المستخدم"}`
                    : `Block ${username || "user"}`}
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    navigate("/contact");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  {isRTL ? "الحصول على الدعم" : "Get support"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between shrink-0 mb-2">
                <div className="flex items-center gap-2">
                  {selectedMainReason && (
                    <button
                      onClick={() => {
                        setSelectedMainReason(null);
                        setSelectedSubReasons(new Set());
                      }}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      {isRTL ? (
                        <ArrowRight className="h-5 w-5" />
                      ) : (
                        <ArrowLeft className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {!selectedMainReason && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    {selectedMainReason
                      ? isRTL
                        ? "تفاصيل البلاغ"
                        : "Report Details"
                      : isRTL
                        ? "الإبلاغ عن مشكلة"
                        : "Report a Problem"}
                  </h2>
                </div>
                <DialogPrimitive.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                {!selectedMainReason ? (
                  <div className="space-y-1 pb-4">
                    <p className="text-sm text-slate-500 mb-4 px-1">
                      {isRTL
                        ? "الرجاء تحديد سبب الإبلاغ عن هذه المحادثة:"
                        : "Select a problem to report:"}
                    </p>
                    {Object.keys(REPORT_REASONS).map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setSelectedMainReason(reason)}
                        className="w-full text-start px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 flex justify-between items-center"
                      >
                        <span>{reason}</span>
                        {isRTL ? (
                          <ArrowLeft className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedMainReason(NOT_LISTED)}
                      className="w-full text-start px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 flex justify-between items-center"
                    >
                      <span>{NOT_LISTED}</span>
                      {isRTL ? (
                        <ArrowLeft className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                ) : selectedMainReason === NOT_LISTED ? (
                  <div className="space-y-4 pb-4 px-1">
                    <h3 className="font-bold text-lg text-slate-800">
                      Everyone deserves to feel safe
                    </h3>
                    <p className="text-sm text-slate-600">
                      If you don't see your problem listed, you can still report
                      the chat.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-3 list-disc pl-5">
                      <li>
                        We'll use automation or a review team to check recent
                        messages for anything not allowed on Unify.
                      </li>
                      <li>
                        If you or someone you know is in immediate danger, call
                        local emergency services. Don't wait.
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4 px-1">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-3">
                        {selectedMainReason}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        We take action if we find:
                      </p>
                      <ul className="text-sm text-slate-500 space-y-1.5 list-disc pl-5 mb-6">
                        {REPORT_REASONS[
                          selectedMainReason as keyof typeof REPORT_REASONS
                        ].guidelines.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        Please select specific issues (optional):
                      </p>
                      <div className="space-y-2">
                        {REPORT_REASONS[
                          selectedMainReason as keyof typeof REPORT_REASONS
                        ].subReasons.map((sub) => (
                          <label
                            key={sub}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubReasons.has(sub)}
                              onChange={() => toggleSubReason(sub)}
                              className="w-4 h-4 rounded text-secondary focus:ring-secondary border-slate-300"
                            />
                            <span className="text-sm text-slate-700">
                              {sub}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedMainReason && (
                <div className="pt-4 border-t border-slate-100 shrink-0 mt-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                  >
                    {isRTL ? "إرسال البلاغ" : "Submit Report"}
                  </button>
                </div>
              )}
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
