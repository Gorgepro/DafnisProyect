import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const result = await login(correo, contrasena);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="auth">
      <div className="auth__bg">
        <div className="auth__bg-orb auth__bg-orb--1"></div>
        <div className="auth__bg-orb auth__bg-orb--2"></div>
      </div>

      <div className="auth__card">
        <Link to="/" className="auth__logo">
          <span className="auth__logo-icon">✦</span>
          <span className="auth__logo-text">DafniStudy</span>
        </Link>

        <h1 className="auth__title">Iniciar Sesión</h1>
        <p className="auth__subtitle">Accede a tu plan de estudio personalizado</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          {error && <div className="auth__error">{error}</div>}

          <div className="auth__input-group">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              className="auth__input"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="auth__input-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="auth__input"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth__submit">
            Entrar
          </button>
        </form>

        <div className="auth__footer">
          <p>
            ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
