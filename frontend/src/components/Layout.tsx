import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import LoadingScreen from './LoadingScreen'
import ScrollToTopButton from './ScrollToTopButton'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const normalizedPathname = pathname.toLowerCase()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  const authPages = ['/login', '/signup', '/register'];
  const isAuthPage = authPages.includes(normalizedPathname);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <LoadingScreen />
      <Navbar />
      <ScrollToTopButton />
      {children}
      {!isAuthPage && <Footer />}
    </div>
  )
}
