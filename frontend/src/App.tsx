import { useEffect } from 'react'
import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

function App() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Unify';

    if (path === '/') title = 'Unify | Home';
    else if (path.startsWith('/search')) title = 'Unify | Search';
    else if (path.startsWith('/poster-builder')) title = 'Unify | Poster Builder';
    else if (path.startsWith('/map')) title = 'Unify | Map';
    else if (path.startsWith('/create-post')) title = 'Unify | Create Post';
    else if (path.startsWith('/chat')) title = 'Unify | Chat';
    else if (path.startsWith('/login')) title = 'Unify | Login';
    else if (path.startsWith('/register')) title = 'Unify | Register';
    else if (path.startsWith('/profile')) title = 'Unify | Profile';
    else if (path.startsWith('/contact')) title = 'Unify | Contact';
    else if (path.startsWith('/about-us')) title = 'Unify | About Us';
    else if (path.startsWith('/admin')) title = 'Unify | Platform Management';
    else if (path.startsWith('/reset-password')) title = 'Unify | Reset Password';
    else if (path.startsWith('/forgot-password')) title = 'Unify | Forgot Password';

    document.title = title;
  }, [location]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App