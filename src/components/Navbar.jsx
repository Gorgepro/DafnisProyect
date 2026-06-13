import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">✦</span>
          <span className="navbar__logo-text">DafniStudy</span>
        </Link>

        <button
          className={`navbar__hamburger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`navbar__nav ${mobileOpen ? 'navbar__nav--open' : ''}`}>
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>
            Inicio
          </Link>
          <a href="/#materias" className="navbar__link">Materias</a>
          <a href="/#funciona" className="navbar__link">Cómo funciona</a>
          <a href="/#beneficios" className="navbar__link">Beneficios</a>

          <div className="navbar__actions">
            {user ? (
              <>
                <Link to="/estudiar" className="navbar__link navbar__link--study">
                  📚 Estudiar
                </Link>
                <span className="navbar__user">Hola, {user.nombre.split(' ')[0]}</span>
                <button onClick={logout} className="navbar__btn navbar__btn--outline">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__btn navbar__btn--outline">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="navbar__btn navbar__btn--primary">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
