import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Search, PlusCircle, FileImage, MapPin, Globe, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Drawer } from './ui/Drawer';
import { useState, useEffect } from 'react';
import unifyLogo from '../assets/unify.png';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [notificationCount] = useState(2);
  const [hasActiveChats] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleNotificationClick = () => {
    if (currentPage === 'notifications') {
      navigate('/search');
    } else {
      navigate('/notifications');
    }
  };

  // Handle navigation
  const handleNavClick = (page: string) => {
    if (page === 'landing') navigate('/');
    else if (page === 'register') navigate('/register');
    else navigate(`/${page}`);
    setSheetOpen(false);
  };

  const isRTL = language === 'ar';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReady, setIsReady] = useState(() => {
    return Boolean((window as any).__unifyLoadingComplete);
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ((window as any).__unifyLoadingComplete) {
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

  const isScrolledActive =
    isScrolled &&
    currentPage !== 'login' &&
    currentPage !== 'signup' &&
    currentPage !== 'register' &&
    currentPage !== 'map';
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={isReady ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${currentPage === 'login' || currentPage === 'signup' || currentPage === 'register' || currentPage === 'map' ? 'relative' : 'sticky'} top-0 z-50 w-full transition-all duration-300 
        ${isScrolledActive 
          ? 'bg-white/95 border-b shadow-md backdrop-blur-md border-gray-200/50 2xl:bg-transparent 2xl:backdrop-blur-none 2xl:border-transparent 2xl:shadow-none 2xl:pointer-events-none' 
          : 'bg-white/95 border-b shadow-sm backdrop-blur-md border-gray-200/50 pointer-events-auto'
        }`
      }
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 pointer-events-auto">
        <div className={`w-full flex h-20 items-center justify-between transition-all duration-300
          ${isScrolledActive 
            ? '2xl:bg-white/95 2xl:backdrop-blur-md 2xl:border-x 2xl:border-b 2xl:border-gray-200/50 2xl:shadow-md 2xl:rounded-b-4xl 2xl:px-6' 
            : '2xl:bg-transparent 2xl:border-transparent 2xl:shadow-none'
          }`}>
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2 hover:opacity-80 hover:cursor-pointer transition-opacity bg-transparent border-none p-0"
          >
            <img src={unifyLogo} alt="Unify" className="h-14 w-auto" />
            <span className="text-lg font-extrabold tracking-normal text-tertiary">
              {isRTL ? 'يونيفاي' : 'Unify'}
            </span>
          </button>
        </div>

        {/* Center: Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full border border-gray-200/50 bg-white hidden 2xl:flex">
          <nav className="hidden 2xl:flex items-center gap-2  px-3 py-2  ">
            <button
              onClick={() => handleNavClick('search')}
              className={`group relative px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none ${
                currentPage === 'search'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                className="hidden 2xl:flex relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center transition-all duration-200 cursor-pointer border-none"
                aria-label="Change Language"
                title={language === 'en' ? 'العربية' : 'الانجليزية'}
              >
                <Globe className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </button>

              {/* Messages */}
              <button
                onClick={() => handleNavClick('chat')}
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
                  <DropdownMenuItem onClick={() => handleNavClick('profile')} onSelect={() => handleNavClick('profile')} className="cursor-pointer">
                    <User className="me-2 h-4 w-4 text-primary-600" />
                    <span className="font-medium">{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} onSelect={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700">
                    <LogOut className="me-2 h-4 w-4" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden 2xl:flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer border-none"
                aria-label="Change Language"
                title={language === 'en' ? 'العربية' : 'English'}
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
          )}

          <Drawer 
            isOpen={sheetOpen} 
            setIsOpen={setSheetOpen} 
            currentPage={currentPage}
            handleNavClick={handleNavClick}
            handleLogout={handleLogout}
          />
        </div>
      </div>
      </div>
    </motion.header>
  );
}
