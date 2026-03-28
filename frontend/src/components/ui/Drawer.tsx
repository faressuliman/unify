import { Sheet, SheetContent, SheetTrigger, SheetClose } from './sheet';
import { Button } from './button';
import { Search, PlusCircle, FileImage, MapPin, Globe, X, LogIn, UserPlus, User, Bell, Mail, LogOut, Menu } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentPage: string;
  handleNavClick: (page: string) => void;
  handleLogout: () => void;
}

export function Drawer({ isOpen, setIsOpen, currentPage, handleNavClick, handleLogout }: DrawerProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="2xl:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu" className="cursor-pointer">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-75 sm:w-87.5 flex flex-col p-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header row: title + close button on same line */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-gray-900">{t('nav.navigationMenu')}</span>
            <span className="text-sm text-gray-500">{t('nav.browseFeatures')}</span>
          </div>
          <SheetClose className="rounded-sm p-1 opacity-70 hover:opacity-100 hover:bg-gray-100 transition-opacity cursor-pointer border-none bg-transparent flex items-center justify-center mt-0.5">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
        <nav className="flex flex-col flex-1 overflow-y-auto">
          {/* Quick Actions Section */}
          <div className="px-6 py-2 text-xs uppercase tracking-wider text-gray-500 text-start mt-2">
            {t('nav.quickActions')}
          </div>
          <div className="space-y-0">
            <button
              onClick={() => handleNavClick('search')}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full cursor-pointer border-none hover:ps-8 ${
                currentPage === 'search'
                  ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                  : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
              }`}
            >
              <Search className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('nav.search')}</span>
            </button>
            <button
              onClick={() => handleNavClick('create-post')}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full cursor-pointer border-none hover:ps-8 ${
                currentPage === 'create-post'
                  ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                  : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
              }`}
            >
              <PlusCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('nav.createPost')}</span>
            </button>
            <button
              onClick={() => handleNavClick('poster-builder')}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full cursor-pointer border-none hover:ps-8 ${
                currentPage === 'poster-builder'
                  ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                  : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
              }`}
            >
              <FileImage className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('nav.posterBuilder')}</span>
            </button>
            <button
              onClick={() => handleNavClick('map')}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full cursor-pointer border-none hover:ps-8 ${
                currentPage === 'map'
                  ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                  : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
              }`}
            >
              <MapPin className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('nav.map')}</span>
            </button>
          </div>

          <div className="h-px bg-gray-200 my-2 mx-6" />

          {/* Change Language Section */}
          <div className="px-6 py-2 text-xs uppercase tracking-wider text-gray-500 text-start">
            {t('nav.changeLanguage')}
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-6 py-4 bg-transparent hover:bg-gray-50 transition-all duration-300 text-gray-700 w-full border-none border-s-4 border-transparent hover:ps-8"
          >
            <Globe className="h-5 w-5 shrink-0" />
            <span className="font-medium">{language === 'en' ? 'العربية' : 'الانجليزية'}</span>
          </button>

          {/* Login/Register Buttons for Non-Authenticated Users */}
          {!isAuthenticated && (
            <>
              <div className="h-px bg-gray-200 my-2 mx-6" />
              <div className="px-6 py-2 text-xs uppercase tracking-wider text-gray-500 text-start">
                {t('nav.getStarted')}
              </div>
              <div className="space-y-0">
                <button
                  onClick={() => handleNavClick('login')}
                  className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full border-none hover:ps-8 ${
                    currentPage === 'login'
                      ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                      : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
                  }`}
                >
                  <LogIn className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.login')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 w-full border-none hover:ps-8 ${
                    currentPage === 'register'
                      ? 'bg-primary/20 text-black font-semibold border-s-4 border-primary'
                      : 'bg-transparent hover:bg-gray-50 text-gray-700 border-s-4 border-transparent'
                  }`}
                >
                  <UserPlus className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.register')}</span>
                </button>
              </div>
            </>
          )}

          {/* Account Section - Only for authenticated users */}
          {isAuthenticated && (
            <>
              <div className="h-px bg-primary my-2 mx-6" />
              <div className="px-6 py-2 text-xs uppercase tracking-wider text-gray-500 text-start">
                {t('nav.account')}
              </div>
              <div className="space-y-0 pb-6">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-3 px-6 py-4 bg-transparent hover:bg-gray-50 transition-all duration-300 text-gray-700 w-full border-none border-s-4 border-transparent hover:ps-8"
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.profile')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('notifications')}
                  className="flex items-center gap-3 px-6 py-4 bg-transparent hover:bg-gray-50 transition-all duration-300 text-gray-700 w-full border-none border-s-4 border-transparent hover:ps-8"
                >
                  <Bell className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.notifications')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('chat')}
                  className="flex items-center gap-3 px-6 py-4 bg-transparent hover:bg-gray-50 transition-all duration-300 text-gray-700 w-full border-none border-s-4 border-transparent hover:ps-8"
                >
                  <Mail className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.messages')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-6 py-4 bg-transparent hover:bg-red-50 transition-all duration-300 text-red-600 w-full border-none border-s-4 border-transparent hover:ps-8"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
