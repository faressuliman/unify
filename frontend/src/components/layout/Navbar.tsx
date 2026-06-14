import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Search, PlusCircle, FileImage, MapPin, Globe, Mail, Menu, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import unifyLogo from '../../assets/unify.png';
import { notificationApi, adminApi, type BackendNotification, type BackendNotificationPost } from '@/lib/api';
import { getSocket } from '@/lib/socket';

const LazyDrawer = lazy(() => import('../ui/Drawer').then((module) => ({ default: module.Drawer })));

const prefetchCoreRoutes = () => {
  void Promise.all([
    import('../../pages/Search'),
    import('../../pages/CreatePost'),
    import('../../pages/PosterBuilder'),
  ]);
};

const prefetchAuthRoutes = () => {
  void Promise.all([
    import('../../pages/Login'),
    import('../../pages/Register'),
  ]);
};

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t, isLocked: isLanguageLocked } = useLanguage();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [adminBadgeCount, setAdminBadgeCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDrawerLoaded, setIsDrawerLoaded] = useState(false);
  const hasPrefetchedCoreRoutes = useRef(false);
  const hasPrefetchedAuthRoutes = useRef(false);
  const hasBoundMobileGesturePrefetch = useRef(false);

  // Helper to determine current page from path
  const getCurrentPage = () => {
    const normalizedPath = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    if (normalizedPath === '/') return 'landing';

    const [, firstSegment] = normalizedPath.split('/');
    return firstSegment || 'landing';
  };

  const currentPage = getCurrentPage();

  const handleLogout = () => {
    logout();
    navigate('/');
    setSheetOpen(false);
  };

  // Handle navigation
  const handleNavClick = (page: string) => {
    if (page === 'landing') navigate('/');
    else if (page === 'register') navigate('/register');
    else navigate(`/${page}`);
    setSheetOpen(false);
  };

  const preloadMobileDrawer = () => {
    if (!isDrawerLoaded) {
      setIsDrawerLoaded(true);
    }
    void import('../ui/Drawer');
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

  const isRTL = language === 'ar';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1280 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isReady, setIsReady] = useState(() => {
    return Boolean((window as unknown as { __unifyLoadingComplete?: boolean }).__unifyLoadingComplete);
  });
  const isAuthLikePage =
    currentPage === 'login' ||
    currentPage === 'signup' ||
    currentPage === 'register' ||
    currentPage === 'forgot-password' ||
    currentPage === 'reset-password';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ((window as unknown as { __unifyLoadingComplete?: boolean }).__unifyLoadingComplete) {
      return;
    }

    const handleReady = () => setIsReady(true);
    window.addEventListener('loadingComplete', handleReady);
    
    // Fallback if loading screen was bypassed or already removed
    const timer = setTimeout(() => setIsReady(true), 1200); 
    
    return () => {
      window.removeEventListener('loadingComplete', handleReady);
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (hasBoundMobileGesturePrefetch.current) {
      return;
    }

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarsePointer) {
      return;
    }

    hasBoundMobileGesturePrefetch.current = true;

    const handleFirstMobileGesture = () => {
      preloadMobileDrawer();
      preloadCoreRoutes();
      window.removeEventListener('touchstart', handleFirstMobileGesture);
      window.removeEventListener('scroll', handleFirstMobileGesture);
      window.removeEventListener('pointerdown', handleFirstMobileGesture);
    };

    window.addEventListener('touchstart', handleFirstMobileGesture, { passive: true, once: true });
    window.addEventListener('scroll', handleFirstMobileGesture, { passive: true, once: true });
    window.addEventListener('pointerdown', handleFirstMobileGesture, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstMobileGesture);
      window.removeEventListener('scroll', handleFirstMobileGesture);
      window.removeEventListener('pointerdown', handleFirstMobileGesture);
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
    const fetchNotificationsData = async () => {
      try {
        const res = await notificationApi.getMyNotifications(token, 1, 10);
        if (!cancelled) {
          setNotificationCount(res.unreadCount);
          setNotifications(res.notifications);
        }
      } catch (e) {
        console.error('Failed to fetch notifications data', e);
      }

      if (user?.role === 'admin') {
        try {
          const statsRes = await adminApi.getDashboardStats(token);
          if (!cancelled && statsRes.stats) {
            const s = statsRes.stats;
            const storedSightingsCount = parseInt(localStorage.getItem('adminSightingReportsCount') || '0', 10);
            const unreadSightings = Math.max(0, (s.sightingReports || 0) - storedSightingsCount);
            const totalActionable = 
              (s.pendingClaims || 0) + 
              unreadSightings + 
              (s.pendingVerifications || 0) + 
              (s.pendingContactMessages || 0) + 
              (s.pendingUserReports || 0);
            setAdminBadgeCount(totalActionable);
          }
        } catch (e) {
          console.error('Failed to fetch admin stats', e);
        }
      }
    };

    void fetchNotificationsData();

    // Subscribe to realtime updates so the badge reflects new notifications
    // and read events immediately. Polling stays as a safety net in case the
    // socket is briefly disconnected.
    const socket = getSocket();
    const handleUnreadCount = ({ unreadCount }: { unreadCount: number }) => {
      setNotificationCount(unreadCount);
    };
    const handleNew = (n: BackendNotification) => {
      setNotificationCount((c) => c + 1);
      setNotifications((prev) => {
        if (prev.find((x) => x._id === n._id)) return prev;
        return [n, ...prev].slice(0, 10); // Keep only the latest 10
      });
    };
    const handleChatMessage = () => {
      if (currentPage !== 'chat') {
        setUnreadMessageCount(c => c + 1);
      }
    };
    if (socket) {
      socket.on('notification:unread-count', handleUnreadCount);
      socket.on('notification:new', handleNew);
      socket.on('chat:message', handleChatMessage);
    }

    const handleAdminSightingsViewed = () => {
      void fetchNotificationsData();
    };
    window.addEventListener('adminSightingsViewed', handleAdminSightingsViewed);

    const interval = setInterval(fetchNotificationsData, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('adminSightingsViewed', handleAdminSightingsViewed);
      if (socket) {
        socket.off('notification:unread-count', handleUnreadCount);
        socket.off('notification:new', handleNew);
        socket.off('chat:message', handleChatMessage);
      }
    };
  }, [isAuthenticated, token, currentPage, user?.role]);

  const isScrolledActive =
    isScrolled &&
    !isAuthLikePage &&
    currentPage !== 'map';
  const dropdownAlign = 'end';
  const dropdownDir = isRTL ? 'rtl' : 'ltr';
  const userAvatarSrc = user?.profilePicture || '';

  const handleMarkOneRead = async (id: string) => {
    if (!token) return;
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setNotificationCount((c) => Math.max(0, c - 1));

    try {
      await notificationApi.markOneRead(id, token);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // rollback
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setNotificationCount((c) => c + 1);
    }
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_sighting':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'new_claim':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'claim_approved_owner':
        return <FileText className="h-5 w-5 text-secondary" />;
      case 'claim_approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'claim_rejected':
        return <EyeOff className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: BackendNotification) => {
    let postName = '';
    if (notification.postId && typeof notification.postId !== 'string') {
      postName = (notification.postId as BackendNotificationPost).name || '';
    }

    switch (notification.type) {
      case 'new_sighting':
        return `${t('notifications.new_sighting')}${postName}`;
      case 'new_claim':
        return `${t('notifications.new_claim')}${postName}`;
      case 'claim_approved_owner':
        return `${t('notifications.claim_approved_owner')}${postName}${t('notifications.claim_approved_owner_suffix')}`;
      case 'claim_approved':
        return `${t('notifications.claim_approved')}${postName}`;
      case 'claim_rejected':
        return `${t('notifications.claim_rejected')}${postName}`;
      default:
        return postName;
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={isReady ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => {
        preloadCoreRoutes();
        preloadAuthRoutes();
      }}
      className={`${isAuthLikePage || currentPage === 'map' ? 'relative' : 'sticky'} top-0 z-50 w-full transition-all duration-300 
        ${isScrolledActive 
          ? 'bg-white/95 border-b shadow-md backdrop-blur-md border-gray-200/50 xl:bg-transparent xl:backdrop-blur-none xl:border-transparent xl:shadow-none xl:pointer-events-none' 
          : 'bg-white/95 border-b shadow-sm backdrop-blur-md border-gray-200/50 pointer-events-auto'
        }`
      }
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 pointer-events-auto relative">
        <div className={`w-full flex h-20 items-center justify-between transition-all duration-300
          ${isScrolledActive 
            ? 'xl:bg-white/95 xl:backdrop-blur-md xl:border-x xl:border-b xl:border-gray-200/50 xl:shadow-md xl:rounded-b-4xl xl:px-6' 
            : 'xl:bg-transparent xl:border-transparent xl:shadow-none'
          }`}>
          
          {/* Left Mobile Action Icons */}
          <div className="flex xl:hidden items-center gap-4 shrink-0">
            <button onClick={() => handleNavClick('search')} className="cursor-pointer border-none bg-transparent p-0 text-gray-700 flex items-center justify-center">
              <Search className="h-6 w-6" strokeWidth={2} />
            </button>
            <button onClick={() => handleNavClick('create-post')} className="cursor-pointer border-none bg-transparent p-0 text-gray-700 flex items-center justify-center">
              <PlusCircle className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>

          {/* Logo (Desktop Left, Mobile Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0 flex items-center shrink-0">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2 hover:opacity-80 hover:cursor-pointer transition-opacity bg-transparent border-none p-0"
            >
              <img src={unifyLogo} alt="Unify" className="h-18 w-auto xl:h-14" />
              <span className="text-lg font-extrabold tracking-normal text-tertiary hidden xl:block">
                {isRTL ? 'يونيفاي' : 'Unify'}
              </span>
            </button>
          </div>

        {/* Center: Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full border border-gray-200/50 bg-slate-50 hidden xl:flex">
          <nav className="hidden xl:flex items-center gap-2  px-3 py-2  ">
            <button
              onClick={() => handleNavClick('search')}
              className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                currentPage === 'search'
                  ? 'bg-primary text-secondary shadow-lg shadow-primary/30'
                  : 'bg-transparent hover:bg-white text-gray-700 hover:shadow-sm'
              }`}
            >
              <Search className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                currentPage === 'search' ? '' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium">{t('nav.search')}</span>
            </button>
            <button
              onClick={() => handleNavClick('create-post')}
              className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                currentPage === 'create-post'
                  ? 'bg-primary text-secondary shadow-lg shadow-primary/30'
                  : 'bg-transparent hover:bg-white text-gray-700 hover:shadow-sm'
              }`}
            >
              <PlusCircle className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                currentPage === 'create-post' ? '' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium">{t('nav.createPost')}</span>
            </button>
            <button
              onClick={() => handleNavClick('poster-builder')}
              className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                currentPage === 'poster-builder'
                  ? 'bg-primary text-secondary shadow-lg shadow-primary/30'
                  : 'bg-transparent hover:bg-white text-gray-700 hover:shadow-sm'
              }`}
            >
              <FileImage className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                currentPage === 'poster-builder' ? '' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium">{t('nav.posterBuilder')}</span>
            </button>
            <button
              onClick={() => handleNavClick('map')}
              className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                currentPage === 'map'
                  ? 'bg-primary text-secondary shadow-lg shadow-primary/30'
                  : 'bg-transparent hover:bg-white text-gray-700 hover:shadow-sm'
              }`}
            >
              <MapPin className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                currentPage === 'map' ? '' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium">{t('nav.map')}</span>
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
                className={`hidden xl:flex relative w-10 h-10 rounded-full items-center justify-center transition-all duration-200 border-none ${
                  isLanguageLocked
                    ? 'bg-slate-50 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 hover:bg-slate-200 cursor-pointer'
                }`}
                aria-label="Change Language"
                title={
                  isLanguageLocked
                    ? (language === 'ar'
                      ? 'تم تعطيل تغيير اللغة أثناء إنشاء منشور'
                      : 'Language switching is disabled while creating a post')
                    : (language === 'en' ? 'العربية' : 'الانجليزية')
                }
              >
                <Globe className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </button>

              {/* Messages */}
              <button
                onClick={() => {
                  setUnreadMessageCount(0);
                  handleNavClick('chat');
                }}
                className="hidden xl:flex relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                aria-label="Messages"
              >
                <Mail className="h-5 w-5 text-gray-700" strokeWidth={2} />
                {unreadMessageCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 xl:-right-0.5 xl:-top-0.5 min-w-4.5 h-4.5 px-1.5 xl:px-1 rounded-full bg-primary text-secondary text-[10px] xl:text-xs flex items-center justify-center font-semibold">
                    {unreadMessageCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <DropdownMenu dir={dropdownDir} modal={false} open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex items-center justify-center transition-all duration-200 cursor-pointer border-none bg-slate-50 w-auto h-auto mx-1 xl:mx-0 xl:bg-slate-50 xl:hover:bg-slate-200 xl:w-10 xl:h-10 xl:rounded-full"
                    aria-label="Notifications"
                  >
                    <Bell className="h-6 w-6 xl:h-5 xl:w-5 text-gray-700" strokeWidth={2} />
                    {notificationCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 xl:-right-0.5 xl:-top-0.5 min-w-4.5 h-4.5 px-1.5 xl:px-1 rounded-full bg-primary text-secondary text-[10px] xl:text-xs flex items-center justify-center font-semibold">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align={isMobile ? "center" : "end"} 
                  sideOffset={isMobile ? 24 : 8}
                  className="w-screen xl:w-90 p-0 overflow-hidden rounded-none xl:rounded-xl shadow-lg border-x-0 xl:border border-gray-100 mt-0 xl:mt-2 z-60"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                    <h3 className="font-bold text-lg text-tertiary">{t('notifications.title')}</h3>
                  </div>
                  <div className="max-h-100 overflow-y-auto bg-white">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center justify-center">
                        <Bell className="h-8 w-8 mb-2 text-gray-300" />
                        <p>{t('notifications.empty')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={async () => {
                              await handleMarkOneRead(notification._id);

                              if (notification.type === 'new_sighting' && notification.postId) {
                                const postId = typeof notification.postId === 'string'
                                  ? notification.postId
                                  : notification.postId._id;
                                const postName = typeof notification.postId === 'object' && notification.postId.name
                                  ? notification.postId.name
                                  : 'Unknown';
                                const sightingId = notification.referenceId ? `&sightingId=${encodeURIComponent(notification.referenceId)}` : '';
                                setIsNotificationsOpen(false);
                                navigate(`/profile?sightingPostId=${encodeURIComponent(postId as string)}&postName=${encodeURIComponent(postName)}${sightingId}`);
                                return;
                              }

                              const postOwnerId =
                                notification.postId && typeof notification.postId !== 'string'
                                  ? typeof notification.postId.userId === 'string'
                                    ? notification.postId.userId
                                    : notification.postId.userId?._id
                                  : undefined;

                              if (notification.type === 'claim_approved') {
                                const targetUserId = notification.referenceId || postOwnerId;
                                if (targetUserId) {
                                  setIsNotificationsOpen(false);
                                  navigate(`/chat?chatWith=${encodeURIComponent(targetUserId)}`);
                                  return;
                                }
                              }

                              if (notification.type === 'claim_approved_owner' && notification.referenceId) {
                                setIsNotificationsOpen(false);
                                navigate(`/chat?chatWith=${encodeURIComponent(notification.referenceId)}`);
                                return;
                              }

                              if (notification.type === 'claim_rejected' && notification.referenceId) {
                                setIsNotificationsOpen(false);
                                navigate(`/profile?rejectedClaimId=${encodeURIComponent(notification.referenceId)}`);
                                return;
                              }

                              if (notification.postId && typeof notification.postId !== 'string') {
                                const postId = notification.postId._id;
                                setIsNotificationsOpen(false);
                                navigate(`/profile?sightingPostId=${encodeURIComponent(postId)}`);
                              }
                            }}
                            className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50/80 ${
                              !notification.isRead ? 'bg-blue-50' : 'bg-white'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0 bg-gray-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 ps-2">
                              <p className="text-sm text-gray-900 font-medium leading-tight mb-1">
                                {getNotificationText(notification)}
                              </p>
                              <p className="text-xs text-blue-500 font-medium">
                                {new Date(notification.createdAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="shrink-0 flex items-center justify-center self-center h-2 w-2">
                                <span className="h-full w-full rounded-full bg-primary block"></span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop: Admin Icon */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="hidden xl:flex relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                  aria-label={t('nav.admin')}
                >
                  <ShieldCheck className="h-5 w-5 text-gray-700" strokeWidth={2} />
                  {adminBadgeCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 xl:-right-0.5 xl:-top-0.5 min-w-4.5 h-4.5 px-1.5 xl:px-1 rounded-full bg-primary text-secondary text-[10px] xl:text-xs flex items-center justify-center font-semibold">
                      {adminBadgeCount > 99 ? '99+' : adminBadgeCount}
                    </span>
                  )}
                </button>
              )}

              {/* Desktop: User dropdown */}
              <DropdownMenu dir={dropdownDir} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hidden xl:flex w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-200 items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer border-none"
                    aria-label="User menu"
                  >
                    {userAvatarSrc ? (
                      <img
                        src={userAvatarSrc}
                        alt={user?.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-700" strokeWidth={2} />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dropdownAlign} className="w-56 mt-2">
                  <div className="px-3 py-2 bg-linear-to-br from-primary-50 to-primary-100/50">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavClick('profile')} onSelect={() => handleNavClick('profile')} className="cursor-pointer">
                    <User className="me-2 h-4 w-4 text-primary-600" />
                    <span className="font-medium">{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => handleNavClick('admin')} onSelect={() => handleNavClick('admin')} className="cursor-pointer">
                      <ShieldCheck className="me-2 h-4 w-4 text-primary-600" />
                      <span className="font-medium">{t('nav.admin')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} onSelect={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700">
                    <LogOut className="me-2 h-4 w-4" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
            <div className="hidden xl:flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                disabled={isLanguageLocked}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-none ${
                  isLanguageLocked
                    ? 'bg-slate-50 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 hover:bg-slate-200 cursor-pointer'
                }`}
                aria-label="Change Language"
                title={
                  isLanguageLocked
                    ? (language === 'ar'
                      ? 'تم تعطيل تغيير اللغة أثناء إنشاء منشور'
                      : 'Language switching is disabled while creating a post')
                    : (language === 'en' ? 'العربية' : 'English')
                }
              >
                <Globe className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </button>
              <Button
                variant="ghost"
                onClick={() => handleNavClick('login')}
                className="rounded-full px-6 font-medium hover:bg-gray-100 cursor-pointer"
              >
                {t('nav.login')}
              </Button>
              <Button
                onClick={() => handleNavClick('register')}
                className="rounded-full px-6 font-medium bg-primary hover:bg-[#e6dcaf] shadow-lg shadow-primary/30 hover:shadow-xl transition-colors duration-300 cursor-pointer text-primary-foreground"
              >
                {t('nav.register')}
              </Button>
            </div>
            
            <button
              onClick={() => handleNavClick('map')}
              className="xl:hidden cursor-pointer border-none bg-transparent p-0 text-gray-700 flex items-center justify-center mx-1"
            >
              <MapPin className="h-6 w-6" strokeWidth={2} />
            </button>
            </>
          )}

          <button
            aria-label="Open menu"
            className="xl:hidden cursor-pointer border-none bg-transparent p-0 text-gray-700 flex items-center justify-center mx-1"
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
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>

          {isDrawerLoaded ? (
            <Suspense fallback={null}>
              <LazyDrawer 
                isOpen={sheetOpen} 
                setIsOpen={setSheetOpen} 
                currentPage={currentPage}
                handleNavClick={handleNavClick}
                handleLogout={handleLogout}
              />
            </Suspense>
          ) : null}
        </div>
      </div>
      </div>
    </motion.header>
  );
}
