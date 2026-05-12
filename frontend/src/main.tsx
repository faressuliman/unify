import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import unifyLogo from "./assets/unify.png";
import { ThemeProvider } from "./context/ThemeContext";

const preloadLogo = () => {
  const existingPreload = document.querySelector(
    `link[rel="preload"][as="image"][href="${unifyLogo}"]`,
  );
  if (existingPreload) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = unifyLogo;
  document.head.appendChild(link);
};

preloadLogo();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <RouterProvider router={router} />
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "rounded-xl border border-slate-200/70 shadow-lg",
                title: "text-sm font-semibold",
                description: "text-xs text-slate-600",
              },
            }}
          />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
