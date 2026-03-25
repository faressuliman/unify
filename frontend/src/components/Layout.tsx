import { ReactNode, useEffect } from 'react'
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

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <LoadingScreen />
      <Navbar />
      <ScrollToTopButton />
      {children}
      <Footer />
    </div>
  )
}
