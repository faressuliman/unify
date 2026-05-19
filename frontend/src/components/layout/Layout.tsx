import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import LoadingScreen from "../ui/LoadingScreen";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import Footer from "./Footer";
import DonateFloatingButton from "../ui/DonateFloatingButton";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.toLowerCase();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const authPages = [
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPages.includes(normalizedPathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-clip transition-colors duration-200">
      <LoadingScreen />
      <Navbar />
      <ScrollToTopButton />
      <DonateFloatingButton />

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {!isAuthPage && <Footer />}
    </div>
  );
}
