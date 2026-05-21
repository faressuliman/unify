import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  MessageCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X,
  MoreVertical,
  Bell,
  BellOff,
  UserX,
  Flag,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import BlockModal from "../components/ui/modals/BlockModal";
import ReportModal from "../components/ui/modals/ReportModal";
import DeleteChatModal from "../components/ui/modals/DeleteChatModal";
import {
  chatApi,
  type BackendChat,
  type BackendChatUser,
  type BackendMessage,
  userApi,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import PageHeader from "../components/ui/PageHeader";
import { getSocket } from "../lib/socket";

function getOtherUser(
  chat: BackendChat,
  currentUserId: string,
): BackendChatUser | null {
  const initiator = chat.initiatorUserId;
  const responder = chat.responderUserId;
  const initiatorObj = typeof initiator === "object" ? initiator : null;
  const responderObj = typeof responder === "object" ? responder : null;

  const initiatorId =
    initiatorObj?._id || (typeof initiator === "string" ? initiator : "");
  if (initiatorId === currentUserId) {
    return responderObj;
  }
  return initiatorObj;
}

function getSenderId(message: BackendMessage): string {
  const sender = message.senderUserId;
  return typeof sender === "object" ? sender._id : sender;
}

export default function Chat() {
  const { token, user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [chats, setChats] = useState<BackendChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadChatIds, setUnreadChatIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeChat = useMemo(
    () => chats.find((c) => c._id === activeChatId) || null,
    [chats, activeChatId],
  );

  const otherUser = useMemo(() => {
    if (!activeChat || !user) return null;
    return getOtherUser(activeChat, user.id);
  }, [activeChat, user]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setChatsLoading(true);
        const res = await chatApi.getMyChats(token);
        setChats(res.chats || []);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      } finally {
        setChatsLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!activeChatId || !token) return;
    const load = async () => {
      try {
        setMessagesLoading(true);
        const res = await chatApi.getChatMessages(activeChatId, 1, 50, token);
        setMessages(res.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setMessagesLoading(false);
      }
    };
    void load();

    // Subscribe to realtime new-message events for this chat. We dedupe by
    // _id because the optimistic send + emit can otherwise duplicate.
    const socket = getSocket();
    if (!socket) return;
    socket.emit("chat:join", activeChatId);
    const handleMessage = (msg: BackendMessage) => {
      if (!msg || msg.chatId !== activeChatId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("chat:message", handleMessage);

    return () => {
      socket.emit("chat:leave", activeChatId);
      socket.off("chat:message", handleMessage);
    };
  }, [activeChatId, token]);

  // Listen for chat:message events even when no chat is open to refresh the
  // sidebar order (newest chats first).
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;
    const handleSidebarPing = (msg: BackendMessage) => {
      if (!msg) return;
      setChats((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.chatId);
        if (idx === -1) return prev;
        const next = [...prev];
        const [chat] = next.splice(idx, 1);
        next.unshift(chat);
        return next;
      });
      if (msg.chatId !== activeChatId) {
        setUnreadChatIds((prev) => new Set(prev).add(msg.chatId));
      }
    };
    socket.on("chat:message", handleSidebarPing);
    return () => {
      socket.off("chat:message", handleSidebarPing);
    };
  }, [user, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeChatId) {
        setActiveChatId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeChatId]);

  // Close dropdown menu when the chat is changed
  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeChatId]);

  // Handle clicking outside the dropdown menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !token) return;
    if (!newMsg.trim() && !attachment) return;
    try {
      setSending(true);
      const res = await chatApi.sendMessage(
        activeChatId,
        newMsg.trim() || undefined,
        attachment,
        token,
      );
      if (res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message];
        });
      }
      setNewMsg("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDeleteChat = async () => {
    if (!activeChatId || !token) return;
    const idToDelete = activeChatId;

    setChats((prev) => prev.filter((c) => c._id !== idToDelete));
    setActiveChatId(null);

    try {
      await chatApi.deleteChat(idToDelete, token);
      toast.success(isRTL ? "تم حذف المحادثة" : "Chat deleted");
    } catch (err) {
      console.error("Failed to delete chat", err);
      toast.error(isRTL ? "فشل حذف المحادثة" : "Failed to delete chat");
    }
  };

  const handleBlockUser = async () => {
    if (!otherUser?._id || !token) return;
    const idToDelete = activeChatId;

    if (idToDelete) {
      setChats((prev) => prev.filter((c) => c._id !== idToDelete));
      setActiveChatId(null);
    }

    try {
      await userApi.blockUser(otherUser._id, token);
      toast.success(isRTL ? "تم الحظر بنجاح" : "Blocked successfully");
    } catch (err) {
      console.error("Failed to block user", err);
      toast.error(isRTL ? "فشل الحظر" : "Failed to block user");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        navigatedTo={isRTL ? "الرسائل" : "Messages"}
        title={isRTL ? "الرسائل" : "Messages"}
        subtitle={
          isRTL
            ? "تحدث مع أصحاب المنشورات بعد الموافقة على المطالبة."
            : "Chat with post owners after a claim has been approved."
        }
        showArrow
      />

      <main className="w-full max-w-400 mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-4 h-[70vh] min-h-125">
          {/* Sidebar */}
          <aside
            className={`border-${isRTL ? "l" : "r"} border-slate-100 flex flex-col md:col-span-1 ${activeChatId ? "hidden md:flex" : "flex"}`}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <h2 className="font-bold text-tertiary">
                {isRTL ? "المحادثات" : "Chats"}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 text-secondary animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  {isRTL ? "لا توجد محادثات بعد." : "No conversations yet."}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {chats.map((chat) => {
                    const partner = user ? getOtherUser(chat, user.id) : null;
                    const isActive = chat._id === activeChatId;
                    const initial =
                      partner?.name?.charAt(0)?.toUpperCase() || "?";
                    return (
                      <li key={chat._id}>
                        <button
                          onClick={() => {
                            setActiveChatId(chat._id);
                            setUnreadChatIds((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(chat._id);
                              return newSet;
                            });
                          }}
                          className={`w-full text-start flex items-center gap-3 px-5 py-3 transition-colors ${
                            isActive
                              ? "bg-primary/15 border-s-4 border-secondary"
                              : "bg-transparent hover:bg-slate-50 border-s-4 border-transparent"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary font-bold flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-tertiary truncate flex justify-between items-center">
                              <span>
                                {partner?.name || (isRTL ? "مستخدم" : "User")}
                              </span>
                              {unreadChatIds.has(chat._id) && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  {isRTL ? "جديد" : "New"}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {new Date(chat.createdAt).toLocaleDateString(
                                isRTL ? "ar-EG" : "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Conversation */}
          <section
            className={`flex flex-col md:col-span-3 ${activeChatId ? "flex" : "hidden md:flex"}`}
          >
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 px-6">
                <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  {isRTL ? "رسائلك" : "Your Messages"}
                </h3>
                <p className="text-sm">
                  {isRTL
                    ? "أرسل رسالة لبدء محادثة"
                    : "send a message to start a chat"}
                </p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                  <button
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label={isRTL ? "العودة" : "Back"}
                  >
                    {isRTL ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <ArrowLeft className="h-4 w-4" />
                    )}
                  </button>
                  <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary font-bold flex items-center justify-center shrink-0">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-tertiary truncate">
                      {otherUser?.name || (isRTL ? "مستخدم" : "User")}
                    </p>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                      aria-label={isRTL ? "خيارات المحادثة" : "Chat options"}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {isMenuOpen && (
                      <div
                        className={`absolute top-full mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}
                      >
                        <div className="px-4 py-2 border-b border-slate-50">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {isRTL ? "تفاصيل المحادثة" : "Conversation Details"}
                          </p>
                        </div>
                        <div className="flex flex-col py-1">
                          <button
                            onClick={() => {
                              setIsMuted(!isMuted);
                              setIsMenuOpen(false);
                              toast.success(
                                isMuted
                                  ? isRTL
                                    ? "تم إلغاء الكتم"
                                    : "Unmuted"
                                  : isRTL
                                    ? "تم كتم الإشعارات"
                                    : "Muted",
                              );
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {isMuted ? (
                                <Bell className="h-4 w-4 text-slate-400" />
                              ) : (
                                <BellOff className="h-4 w-4 text-slate-400" />
                              )}
                              <span>
                                {isRTL ? "كتم الرسائل" : "Mute messages"}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMuted ? "bg-secondary/10 text-secondary" : "bg-slate-100 text-slate-500"}`}
                            >
                              {isMuted
                                ? isRTL
                                  ? "مفعل"
                                  : "On"
                                : isRTL
                                  ? "معطل"
                                  : "Off"}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsBlockModalOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-start"
                          >
                            <UserX className="h-4 w-4 text-slate-400" />
                            <span>{isRTL ? "حظر" : "Block"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsReportModalOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-start"
                          >
                            <Flag className="h-4 w-4 text-slate-400" />
                            <span>{isRTL ? "إبلاغ" : "Report"}</span>
                          </button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button
                            onClick={() => {
                              setActiveChatId(null);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-start"
                          >
                            <XCircle className="h-4 w-4 text-slate-400" />
                            <span>
                              {isRTL ? "إغلاق المحادثة" : "Close chat"}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsDeleteModalOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-start"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>
                              {isRTL ? "حذف المحادثة" : "Delete chat"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
                  {messagesLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-5 w-5 text-secondary animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-10">
                      {isRTL
                        ? "لا توجد رسائل بعد. ابدأ المحادثة!"
                        : "No messages yet. Say hi!"}
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isMine = user ? getSenderId(m) === user.id : false;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-xs ${
                              isMine
                                ? "bg-secondary text-white rounded-br-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                            }`}
                          >
                            {m.content && (
                              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                {m.content}
                              </p>
                            )}
                            {m.attachmentPath && (
                              <a
                                href={m.attachmentPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold underline ${
                                  isMine ? "text-white/90" : "text-secondary"
                                }`}
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                {isRTL ? "مرفق" : "Attachment"}
                              </a>
                            )}
                            <span
                              className={`block text-[10px] mt-1 ${
                                isMine ? "text-white/70" : "text-slate-400"
                              }`}
                            >
                              {formatTime(m.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="border-t border-slate-100 px-4 py-3 bg-white"
                >
                  {attachment && (
                    <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                      <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate max-w-40">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachment(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        title={isRTL ? "إزالة المرفق" : "Remove attachment"}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={isRTL ? "إرفاق ملف" : "Attach file"}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={(e) =>
                        setAttachment(e.target.files?.[0] || null)
                      }
                    />
                    <input
                      type="text"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder={
                        isRTL ? "اكتب رسالة..." : "Type a message..."
                      }
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-secondary outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!newMsg.trim() && !attachment)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isRTL ? "إرسال" : "Send"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      <BlockModal
        isOpen={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        isRTL={isRTL}
        username={otherUser?.name || (isRTL ? "مستخدم" : "User")}
        onBlockConfirm={handleBlockUser}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        isRTL={isRTL}
        username={otherUser?.name}
        onBlockClick={handleBlockUser}
        onReportSubmit={(reason, subReasons) => {
          // Report submission logic handled inside the modal or backend
        }}
      />

      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        isRTL={isRTL}
        onDeleteConfirm={handleDeleteChat}
      />
    </div>
  );
}
