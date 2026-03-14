import { useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import Index from './pages/Index'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'landing' ? (
        <Index />
      ) : (
        <main className="container max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-500 text-center mt-20">
            Current page: <span className="font-semibold text-gray-900">{currentPage}</span>
          </p>
        </main>
      )}
    </div>
  )
}

export default App
