import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  Paperclip,
  MessageCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  X,
  MoreVertical,
  Bell,
  BellOff,
  UserX,
  Flag,
  Trash2,
  XCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { toast } from "sonner";
import BlockModal from "../components/ui/modals/BlockModal";
import ReportModal from "../components/ui/modals/ReportModal";
import DeleteChatModal from "../components/ui/modals/DeleteChatModal";
import {
  chatApi,
  contactApi,
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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openSidebarMenuId, setOpenSidebarMenuId] = useState<string | null>(
    null,
  );
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const handledChatUserRef = useRef<string | null>(null);
  const scrollMessagesToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const updateJumpVisibility = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.clientHeight - container.scrollTop;
    setShowJumpToLatest(distanceFromBottom > 64);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;

    updateJumpVisibility();
    const handleScroll = () => updateJumpVisibility();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeChatId, messages.length]);

  const [pinnedChats, setPinnedChats] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("pinnedChats") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [mutedChats, setMutedChats] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("mutedChats") || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "pinnedChats",
      JSON.stringify(Array.from(pinnedChats)),
    );
  }, [pinnedChats]);
  useEffect(() => {
    localStorage.setItem("mutedChats", JSON.stringify(Array.from(mutedChats)));
  }, [mutedChats]);

  const isMuted = activeChatId ? mutedChats.has(activeChatId) : false;
  const isPinned = activeChatId ? pinnedChats.has(activeChatId) : false;
  const activeChat = useMemo(
    () => chats.find((c) => c._id === activeChatId) || null,
    [chats, activeChatId],
  );

  const otherUser = useMemo(() => {
    if (!activeChat || !user) return null;
    return getOtherUser(activeChat, user.id);
  }, [activeChat, user]);

  // Fetch blocked users to instantly hide their chats
  useEffect(() => {
    if (token) {
      userApi
        .getBlockedUsers(token)
        .then((res) =>
          setBlockedUserIds(new Set(res.blockedUsers.map((u) => u._id))),
        )
        .catch(console.error);
    }
  }, [token]);

  const sortedChats = useMemo(() => {
    return [...chats]
      .filter((c) => {
        if (!user) return true;
        const partner = getOtherUser(c, user.id);
        return partner && !blockedUserIds.has(partner._id);
      })
      .sort((a, b) => {
        const aPinned = pinnedChats.has(a._id);
        const bPinned = pinnedChats.has(b._id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        // Fallback sorting: chronological (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [chats, pinnedChats, user, blockedUserIds]);

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
    const chatWith = searchParams.get("chatWith");
    if (!chatWith || !token) return;
    if (handledChatUserRef.current === chatWith) return;

    handledChatUserRef.current = chatWith;
    const openChat = async () => {
      try {
        const res = await chatApi.startChat(chatWith, token);
        setChats((prev) => {
          const existingIndex = prev.findIndex((chat) => chat._id === res.chat._id);
          if (existingIndex !== -1) {
            const next = [...prev];
            next[existingIndex] = res.chat;
            return next;
          }
          return [res.chat, ...prev];
        });
        setActiveChatId(res.chat._id);
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.delete("chatWith");
          return next;
        }, { replace: true });
      } catch (err) {
        console.error("Failed to open chat from notification", err);
      }
    };

    void openChat();
  }, [searchParams, token, setSearchParams]);

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
      requestAnimationFrame(scrollMessagesToBottom);
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
      if (!(e.target as Element).closest(".sidebar-menu-container")) {
        setOpenSidebarMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setTimeout(scrollMessagesToBottom, 50);
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
    const idToDelete = chatToDelete || activeChatId;
    if (!idToDelete || !token) return;

    setChats((prev) => prev.filter((c) => c._id !== idToDelete));
    if (activeChatId === idToDelete) {
      setActiveChatId(null);
    }
    setChatToDelete(null);

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
      setBlockedUserIds((prev) => new Set(prev).add(otherUser._id));
      toast.success(isRTL ? "تم الحظر بنجاح" : "Blocked successfully");
    } catch (err) {
      console.error("Failed to block user", err);
      toast.error(isRTL ? "فشل الحظر" : "Failed to block user");
    }
  };

  return (
    <div
      className={`bg-slate-50 flex flex-col h-dvh overflow-hidden ${activeChatId ? "fixed inset-0 z-50 md:static md:z-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:pt-8 md:pb-12" : "pt-4 md:pt-8 pb-4 md:pb-12"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={activeChatId ? "hidden md:block shrink-0" : "block shrink-0"}>
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
      </div>

      <main
        className={`w-full max-w-400 mx-auto flex-1 flex flex-col min-h-0 ${activeChatId ? "px-0 md:px-6 lg:px-12" : "px-2 sm:px-6 lg:px-12"}`}
      >
        <div
          className={`bg-white overflow-hidden flex flex-col md:flex-row flex-1 min-h-0 ${activeChatId ? "border-0 md:border border-slate-200 md:rounded-2xl md:shadow-xs" : "rounded-2xl border border-slate-200 shadow-xs"}`}
        >
          {/* Sidebar */}
          <aside
            className={`border-${isRTL ? "l" : "r"} border-slate-100 flex flex-col w-full md:w-80 lg:w-96 shrink-0 min-w-0 ${activeChatId ? "hidden md:flex" : "flex"}`}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <h2 className="font-bold text-tertiary">
                {isRTL ? "المحادثات" : "Chats"}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
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
                  {sortedChats.map((chat) => {
                    const partner = user ? getOtherUser(chat, user.id) : null;
                    const isActive = chat._id === activeChatId;
                    const isPinned = pinnedChats.has(chat._id);
                    const isChatMuted = mutedChats.has(chat._id);
                    const initial =
                      partner?.name?.charAt(0)?.toUpperCase() || "?";
                    const partnerAvatar = partner?.profilePicture || "";

                    const sidebarMenu = (
                      <div className="relative shrink-0 sidebar-menu-container ms-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSidebarMenuId(
                              openSidebarMenuId === chat._id ? null : chat._id,
                            );
                          }}
                          className={`p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors ${openSidebarMenuId === chat._id ? "bg-slate-200 text-slate-600" : ""}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openSidebarMenuId === chat._id && (
                          <div
                            className={`absolute top-full mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}
                          >
                            <div className="flex flex-col py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinnedChats((prev) => {
                                    const next = new Set(prev);
                                    if (isPinned) next.delete(chat._id);
                                    else next.add(chat._id);
                                    return next;
                                  });
                                  setOpenSidebarMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-start"
                              >
                                {isPinned ? (
                                  <PinOff className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <Pin className="h-4 w-4 text-slate-400" />
                                )}
                                <span>
                                  {isPinned
                                    ? isRTL
                                      ? "إلغاء التثبيت"
                                      : "Unpin"
                                    : isRTL
                                      ? "تثبيت"
                                      : "Pin"}
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMutedChats((prev) => {
                                    const next = new Set(prev);
                                    if (isChatMuted) next.delete(chat._id);
                                    else next.add(chat._id);
                                    return next;
                                  });
                                  setOpenSidebarMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-start"
                              >
                                {isChatMuted ? (
                                  <Bell className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-slate-400" />
                                )}
                                <span>
                                  {isChatMuted
                                    ? isRTL
                                      ? "إلغاء الكتم"
                                      : "Unmute"
                                    : isRTL
                                      ? "كتم"
                                      : "Mute"}
                                </span>
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatToDelete(chat._id);
                                  setIsDeleteModalOpen(true);
                                  setOpenSidebarMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-start"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>{isRTL ? "حذف" : "Delete"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                    return (
                      <li key={chat._id} className="relative group">
                        <div
                          onClick={() => {
                            setActiveChatId(chat._id);
                            setUnreadChatIds((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(chat._id);
                              return newSet;
                            });
                          }}
                          className={`w-full cursor-pointer text-start flex items-center gap-3 px-5 py-3 transition-colors ${
                            isActive
                              ? "bg-primary/15 border-s-4 border-secondary"
                              : "bg-transparent hover:bg-slate-50 border-s-4 border-transparent"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary font-bold flex items-center justify-center shrink-0 overflow-hidden">
                            {partnerAvatar ? (
                              <img
                                src={partnerAvatar}
                                alt={partner?.name || (isRTL ? "مستخدم" : "User")}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initial
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center w-full min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="font-semibold text-tertiary truncate">
                                  {partner?.name || (isRTL ? "مستخدم" : "User")}
                                </span>
                                {isPinned && (
                                  <Pin className="h-3 w-3 text-secondary shrink-0" />
                                )}
                                {isChatMuted && (
                                  <BellOff className="h-3 w-3 text-slate-400 shrink-0" />
                                )}
                                {sidebarMenu}
                              </div>

                              {unreadChatIds.has(chat._id) && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ms-2 shrink-0">
                                  {isRTL ? "جديد" : "New"}
                                </span>
                              )}
                            </div>
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
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Conversation */}
          <section
            className={`flex flex-col flex-1 min-w-0 min-h-0 ${activeChatId ? "flex h-full" : "hidden md:flex"}`}
          >
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 px-6 min-h-0">
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
                <header className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden p-2 -ml-2 mr-1 rtl:-mr-2 rtl:ml-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                    aria-label={isRTL ? "العودة" : "Back"}
                  >
                    {isRTL ? (
                      <ArrowRight className="h-5 w-5" />
                    ) : (
                      <ArrowLeft className="h-5 w-5" />
                    )}
                  </button>
                  <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary font-bold flex items-center justify-center shrink-0 overflow-hidden">
                    {otherUser?.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt={otherUser.name || (isRTL ? "مستخدم" : "User")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      otherUser?.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {!isRTL && (
                      <>
                        {isPinned && (
                          <Pin className="h-4 w-4 text-secondary shrink-0" />
                        )}
                        {isMuted && (
                          <BellOff className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </>
                    )}
                    <p className="font-bold text-tertiary truncate">
                      {otherUser?.name || (isRTL ? "مستخدم" : "User")}
                    </p>
                    {isRTL && (
                      <>
                        {isMuted && (
                          <BellOff className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        {isPinned && (
                          <Pin className="h-4 w-4 text-secondary shrink-0" />
                        )}
                      </>
                    )}
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
                              if (activeChatId) {
                                setPinnedChats((prev) => {
                                  const next = new Set(prev);
                                  if (isPinned) next.delete(activeChatId);
                                  else next.add(activeChatId);
                                  return next;
                                });
                              }
                              setIsMenuOpen(false);
                              toast.success(
                                isPinned
                                  ? isRTL
                                    ? "تم إلغاء التثبيت"
                                    : "Unpinned"
                                  : isRTL
                                    ? "تم التثبيت"
                                    : "Pinned",
                              );
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {isPinned ? (
                                <PinOff className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Pin className="h-4 w-4 text-slate-400" />
                              )}
                              <span>
                                {isPinned
                                  ? isRTL
                                    ? "إلغاء التثبيت"
                                    : "Unpin"
                                  : isRTL
                                    ? "تثبيت المحادثة"
                                    : "Pin chat"}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPinned ? "bg-secondary/10 text-secondary" : "bg-slate-100 text-slate-500"}`}
                            >
                              {isPinned
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
                              if (activeChatId) {
                                setMutedChats((prev) => {
                                  const next = new Set(prev);
                                  if (isMuted) next.delete(activeChatId);
                                  else next.add(activeChatId);
                                  return next;
                                });
                              }
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
                              setChatToDelete(activeChatId);
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

                <div className="relative flex-1 min-h-0">
                  <div ref={messagesContainerRef} className="h-full overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40 min-h-0">
                    {messagesLoading ? (
                      <div className="flex h-full items-center justify-center">
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
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${
                                isMine
                                  ? "bg-secondary text-white rounded-br-md"
                                  : "bg-white text-slate-800 border border-slate-100 rounded-bl-md"
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
                  </div>

                  {showJumpToLatest && (
                    <button
                      type="button"
                      onClick={() => {
                        scrollMessagesToBottom();
                        setShowJumpToLatest(false);
                      }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-black shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                      aria-label={
                        isRTL
                          ? "الانتقال إلى أحدث الرسائل"
                          : "Jump to latest"
                      }
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      {isRTL ? "الأحدث" : "Latest"}
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleSend}
                  className="border-t border-slate-100 px-4 py-3 bg-white shrink-0"
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
                      className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
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
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[16px] md:text-sm focus:bg-white focus:border-secondary outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!newMsg.trim() && !attachment)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="hidden lg:inline">
                        {isRTL ? "إرسال" : "Send"}
                      </span>
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
        onReportSubmit={async (reason, subReasons) => {
          if (!user || !otherUser) return;
          try {
            const subject = `User Report: ${otherUser.name}`;
            const messageText = `Reported User: ${otherUser.name} (${otherUser.email || "N/A"})\nReported By: ${user.name || "User"} (${user.email || "N/A"})\n\nReason: ${reason}\nSub-reasons: ${subReasons?.join(", ") || "None"}\nChat ID: ${activeChatId}`;
            await contactApi.sendMessage({
              name: user.name || "User Report",
              email: user.email || "report@unify.eg",
              subject,
              message: messageText,
            });
          } catch (err) {
            console.error("Failed to send report", err);
            toast.error(isRTL ? "فشل إرسال البلاغ" : "Failed to send report");
          }
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
