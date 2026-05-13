import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  Search,
  PlusCircle,
  FileImage,
  MapPin,
  Globe,
  Mail,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import unifyLogo from "../../assets/unify.png";
import { notificationApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const LazyDrawer = lazy(() =>
  import("../ui/Drawer").then((module) => ({ default: module.Drawer })),
);

const prefetchCoreRoutes = () => {
  void Promise.all([
    import("../../pages/Search"),
    import("../../pages/CreatePost"),
    import("../../pages/PosterBuilder"),
  ]);
};

const prefetchAuthRoutes = () => {
  void Promise.all([
    import("../../pages/Login"),
    import("../../pages/Register"),
  ]);
};

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, isAuthenticated } = useAuth();
  const {
    language,
    toggleLanguage,
    t,
    isLocked: isLanguageLocked,
  } = useLanguage();
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasActiveChats] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDrawerLoaded, setIsDrawerLoaded] = useState(false);
  const hasPrefetchedCoreRoutes = useRef(false);
  const hasPrefetchedAuthRoutes = useRef(false);
  const hasBoundMobileGesturePrefetch = useRef(false);

  // Helper to determine current page from path
  const getCurrentPage = () => {
    const normalizedPath =
      location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (normalizedPath === "/") return "landing";

    const [, firstSegment] = normalizedPath.split("/");
    return firstSegment || "landing";
  };

  const currentPage = getCurrentPage();

  const handleLogout = () => {
    logout();
    navigate("/");
    setSheetOpen(false);
  };

  const handleNotificationClick = () => {
    if (currentPage === "notifications") {
      navigate("/search");
    } else {
      navigate("/notifications");
    }
  };

  // Handle navigation
  const handleNavClick = (page: string) => {
    if (page === "landing") navigate("/");
    else if (page === "register") navigate("/register");
    else navigate(`/${page}`);
    setSheetOpen(false);
  };

  const preloadMobileDrawer = () => {
    if (!isDrawerLoaded) {
      setIsDrawerLoaded(true);
    }
    void import("../ui/Drawer");
  };

  const preloadCoreRoutes = () => {
    if (hasPrefetchedCoreRoutes.current) {
      return;
    }

    hasPrefetchedCoreRoutes.current = true;
    prefetchCoreRoutes();
  };

  const preloadAuthRoutes = () => {
    if (hasPrefetchedAuthRoutes.current) {
      return;
    }

    hasPrefetchedAuthRoutes.current = true;
    prefetchAuthRoutes();
  };

  const handleOpenDrawer = () => {
    if (!isDrawerLoaded) {
      setIsDrawerLoaded(true);
    }
    preloadCoreRoutes();
    preloadAuthRoutes();
    setSheetOpen(true);
  };

  const isRTL = language === "ar";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReady, setIsReady] = useState(() => {
    return Boolean(
      (window as unknown as { __unifyLoadingComplete?: boolean })
        .__unifyLoadingComplete,
    );
  });
  const isAuthLikePage =
    currentPage === "login" ||
    currentPage === "signup" ||
    currentPage === "register" ||
    currentPage === "forgot-password" ||
    currentPage === "reset-password";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      (window as unknown as { __unifyLoadingComplete?: boolean })
        .__unifyLoadingComplete
    ) {
      return;
    }

    const handleReady = () => setIsReady(true);
    window.addEventListener("loadingComplete", handleReady);

    // Fallback if loading screen was bypassed or already removed
    const timer = setTimeout(() => setIsReady(true), 1200);

    return () => {
      window.removeEventListener("loadingComplete", handleReady);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (hasBoundMobileGesturePrefetch.current) {
      return;
    }

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarsePointer) {
      return;
    }

    hasBoundMobileGesturePrefetch.current = true;

    const handleFirstMobileGesture = () => {
      preloadMobileDrawer();
      preloadCoreRoutes();
      window.removeEventListener("touchstart", handleFirstMobileGesture);
      window.removeEventListener("scroll", handleFirstMobileGesture);
      window.removeEventListener("pointerdown", handleFirstMobileGesture);
    };

    window.addEventListener("touchstart", handleFirstMobileGesture, {
      passive: true,
      once: true,
    });
    window.addEventListener("scroll", handleFirstMobileGesture, {
      passive: true,
      once: true,
    });
    window.addEventListener("pointerdown", handleFirstMobileGesture, {
      passive: true,
      once: true,
    });

    return () => {
      window.removeEventListener("touchstart", handleFirstMobileGesture);
      window.removeEventListener("scroll", handleFirstMobileGesture);
      window.removeEventListener("pointerdown", handleFirstMobileGesture);
    };
  }, [isDrawerLoaded]);

  useEffect(() => {
    if (!sheetOpen) {
      return;
    }

    preloadAuthRoutes();
  }, [sheetOpen]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotificationCount(0);
      return;
    }

    let cancelled = false;
    const fetchCount = async () => {
      try {
        const res = await notificationApi.getMyNotifications(token, 1, 1);
        if (!cancelled) setNotificationCount(res.unreadCount);
      } catch (e) {
        console.error("Failed to fetch notifications count", e);
      }
    };

    void fetchCount();

    // Subscribe to realtime updates so the badge reflects new notifications
    // and read events immediately. Polling stays as a safety net in case the
    // socket is briefly disconnected.
    const socket = getSocket();
    const handleUnreadCount = ({ unreadCount }: { unreadCount: number }) => {
      setNotificationCount(unreadCount);
    };
    const handleNew = () => {
      setNotificationCount((c) => c + 1);
    };
    if (socket) {
      socket.on("notification:unread-count", handleUnreadCount);
      socket.on("notification:new", handleNew);
    }

    const interval = setInterval(fetchCount, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (socket) {
        socket.off("notification:unread-count", handleUnreadCount);
        socket.off("notification:new", handleNew);
      }
    };
  }, [isAuthenticated, token]);

  const isScrolledActive =
    isScrolled && !isAuthLikePage && currentPage !== "map";
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={isReady ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => {
        preloadCoreRoutes();
        preloadAuthRoutes();
      }}
      className={`${isAuthLikePage || currentPage === "map" ? "relative" : "sticky"} top-0 z-50 w-full transition-all duration-300 
        ${
          isScrolledActive
            ? "bg-white/95 border-b shadow-md backdrop-blur-md border-gray-200/50 2xl:bg-transparent 2xl:backdrop-blur-none 2xl:border-transparent 2xl:shadow-none 2xl:pointer-events-none"
            : "bg-white/95 border-b shadow-sm backdrop-blur-md border-gray-200/50 pointer-events-auto"
        }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 pointer-events-auto">
        <div
          className={`w-full flex h-20 items-center justify-between transition-all duration-300
          ${
            isScrolledActive
              ? "2xl:bg-white/95 2xl:backdrop-blur-md 2xl:border-x 2xl:border-b 2xl:border-gray-200/50 2xl:shadow-md 2xl:rounded-b-4xl 2xl:px-6"
              : "2xl:bg-transparent 2xl:border-transparent 2xl:shadow-none"
          }`}
        >
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                if (location.pathname === "/" && window.scrollY > 0) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  handleNavClick("landing");
                }
              }}
              className="flex items-center gap-2 hover:opacity-80 hover:cursor-pointer transition-opacity bg-transparent border-none p-0"
            >
              <img src={unifyLogo} alt="Unify" className="h-14 w-auto" />
              <span className="text-2xl font-extrabold tracking-normal text-tertiary">
                {isRTL ? "يونيفاي" : "Unify"}
              </span>
            </button>
          </div>

          {/* Center: Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full border border-gray-200/50 bg-white hidden 2xl:flex">
            <nav className="hidden 2xl:flex items-center gap-2  px-3 py-2  ">
              <button
                onClick={() => handleNavClick("search")}
                className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                  currentPage === "search"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-transparent hover:bg-white text-gray-700 hover:shadow-sm"
                }`}
              >
                <Search
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    currentPage === "search" ? "" : "text-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">{t("nav.search")}</span>
              </button>
              <button
                onClick={() => handleNavClick("create-post")}
                className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                  currentPage === "create-post"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-transparent hover:bg-white text-gray-700 hover:shadow-sm"
                }`}
              >
                <PlusCircle
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    currentPage === "create-post" ? "" : "text-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {t("nav.createPost")}
                </span>
              </button>
              <button
                onClick={() => handleNavClick("poster-builder")}
                className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                  currentPage === "poster-builder"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-transparent hover:bg-white text-gray-700 hover:shadow-sm"
                }`}
              >
                <FileImage
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    currentPage === "poster-builder" ? "" : "text-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {t("nav.posterBuilder")}
                </span>
              </button>
              <button
                onClick={() => handleNavClick("map")}
                className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                  currentPage === "map"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-transparent hover:bg-white text-gray-700 hover:shadow-sm"
                }`}
              >
                <MapPin
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    currentPage === "map" ? "" : "text-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">{t("nav.map")}</span>
              </button>
            </nav>
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  disabled={isLanguageLocked}
                  className={`hidden 2xl:flex relative w-10 h-10 rounded-full items-center justify-center transition-all duration-200 border-none ${
                    isLanguageLocked
                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                      : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  }`}
                  aria-label="Change Language"
                  title={
                    isLanguageLocked
                      ? language === "ar"
                        ? "تم تعطيل تغيير اللغة أثناء إنشاء منشور"
                        : "Language switching is disabled while creating a post"
                      : language === "en"
                        ? "العربية"
                        : "الانجليزية"
                  }
                >
                  <Globe className="h-5 w-5 text-gray-700" strokeWidth={2} />
                </button>

                {/* Messages */}
                <button
                  onClick={() => handleNavClick("chat")}
                  className="hidden 2xl:flex relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                  aria-label="Messages"
                >
                  <Mail className="h-5 w-5 text-gray-700" strokeWidth={2} />
                  {hasActiveChats && (
                    <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white"></span>
                  )}
                </button>

                {/* Notifications */}
                <button
                  onClick={handleNotificationClick}
                  className="hidden 2xl:flex relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-700" strokeWidth={2} />
                  {notificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Desktop: User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="hidden 2xl:flex w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                      aria-label="User menu"
                    >
                      <User className="h-5 w-5 text-gray-700" strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-3 py-2 bg-linear-to-br from-primary-50 to-primary-100/50">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavClick("profile")}
                      onSelect={() => handleNavClick("profile")}
                      className="cursor-pointer"
                    >
                      <User className="me-2 h-4 w-4 text-primary-600" />
                      <span className="font-medium">{t("nav.profile")}</span>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => handleNavClick("admin")}
                        onSelect={() => handleNavClick("admin")}
                        className="cursor-pointer"
                      >
                        <ShieldCheck className="me-2 h-4 w-4 text-primary-600" />
                        <span className="font-medium">{t("nav.admin")}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      onSelect={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-700"
                    >
                      <LogOut className="me-2 h-4 w-4" />
                      <span className="font-medium">{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden 2xl:flex items-center gap-3">
                <button
                  onClick={toggleLanguage}
                  disabled={isLanguageLocked}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-none ${
                    isLanguageLocked
                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                      : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  }`}
                  aria-label="Change Language"
                  title={
                    isLanguageLocked
                      ? language === "ar"
                        ? "تم تعطيل تغيير اللغة أثناء إنشاء منشور"
                        : "Language switching is disabled while creating a post"
                      : language === "en"
                        ? "العربية"
                        : "English"
                  }
                >
                  <Globe className="h-5 w-5 text-gray-700" strokeWidth={2} />
                </button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick("login")}
                  className="rounded-full px-6 font-medium hover:bg-gray-100 cursor-pointer"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  onClick={() => handleNavClick("register")}
                  className="rounded-full px-6 font-medium bg-primary hover:bg-[#e6dcaf] shadow-lg shadow-primary/30 hover:shadow-xl transition-colors duration-300 cursor-pointer text-primary-foreground"
                >
                  {t("nav.register")}
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="cursor-pointer 2xl:hidden"
              onClick={handleOpenDrawer}
              onMouseEnter={() => {
                preloadMobileDrawer();
                preloadCoreRoutes();
                preloadAuthRoutes();
              }}
              onFocus={() => {
                preloadMobileDrawer();
                preloadCoreRoutes();
                preloadAuthRoutes();
              }}
              onTouchStart={() => {
                preloadMobileDrawer();
                preloadCoreRoutes();
                preloadAuthRoutes();
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {isDrawerLoaded ? (
              <Suspense fallback={null}>
                <LazyDrawer
                  isOpen={sheetOpen}
                  setIsOpen={setSheetOpen}
                  currentPage={currentPage}
                  handleNavClick={handleNavClick}
                  handleLogout={handleLogout}
                  notificationCount={notificationCount}
                />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
