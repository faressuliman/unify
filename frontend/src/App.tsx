import './App.css'
import { Navbar } from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import ScrollToTopButton from './components/ScrollToTopButton'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function App() {
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
      <Outlet />
    </div>
  )
}

export default App
