import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Study from './pages/Study'
import CreatePlan from './pages/CreatePlan'

function App() {
  const location = useLocation()
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light')

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'theme-dark' : ''
    localStorage.setItem('app_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const hideThemeToggle = location.pathname === '/login' || location.pathname === '/registro'

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/estudiar" element={<Study />} />
        <Route path="/crear-plan" element={<CreatePlan />} />
      </Routes>
      {!hideThemeToggle && (
        <button
          type="button"
          className="study__btn-theme-floating"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
        </button>
      )}
    </>
  )
}

export default App
