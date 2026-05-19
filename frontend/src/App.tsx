import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AnimatePresence, motion } from 'framer-motion'

function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-grow flex flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App