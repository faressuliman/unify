import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AuthProvider } from './context/AuthContext.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'
import unifyLogo from './assets/unify.png'

const preloadLogo = () => {
  const existingPreload = document.querySelector(`link[rel="preload"][as="image"][href="${unifyLogo}"]`)
  if (existingPreload) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = unifyLogo
  document.head.appendChild(link)
}

preloadLogo()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
