import './App.css'
import { Navbar } from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import ScrollToTopButton from './components/ScrollToTopButton'
import { Outlet } from 'react-router-dom'

function App() {
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
