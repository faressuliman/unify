import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  MessageCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import {
  chatApi,
  type BackendChat,
  type BackendChatUser,
  type BackendMessage,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        if (res.chats && res.chats.length > 0 && !activeChatId) {
          setActiveChatId(res.chats[0]._id);
        }
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
    };
    socket.on("chat:message", handleSidebarPing);
    return () => {
      socket.off("chat:message", handleSidebarPing);
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-[280px_1fr] h-[70vh] min-h-125">
          {/* Sidebar */}
          <aside
            className={`border-${isRTL ? "l" : "r"} border-slate-100 flex flex-col ${activeChatId ? "hidden md:flex" : "flex"}`}
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
                          onClick={() => setActiveChatId(chat._id)}
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
                            <p className="font-semibold text-tertiary truncate">
                              {partner?.name || (isRTL ? "مستخدم" : "User")}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
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
            className={`flex flex-col ${activeChatId ? "flex" : "hidden md:flex"}`}
          >
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 px-6">
                <MessageCircle className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm">
                  {isRTL
                    ? "اختر محادثة لعرض الرسائل."
                    : "Select a chat to view messages."}
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
    </div>
  );
}
