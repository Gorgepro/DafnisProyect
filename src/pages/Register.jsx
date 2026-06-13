import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (contrasena.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const result = register(nombre, correo, contrasena);
    if (result.success) {
      setSuccess('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1500);
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
          <span className="auth__logo-text">Estudia Hoy IA</span>
        </Link>

        <h1 className="auth__title">Crear Cuenta</h1>
        <p className="auth__subtitle">Empieza a estudiar con tu plan personalizado</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          {error && <div className="auth__error">{error}</div>}
          {success && <div className="auth__success">{success}</div>}

          <div className="auth__input-group">
            <label htmlFor="reg-name">Nombre completo</label>
            <input
              id="reg-name"
              type="text"
              className="auth__input"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="auth__input-group">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              className="auth__input"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="auth__input-group">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              className="auth__input"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <div className="auth__input-group">
            <label htmlFor="reg-confirm">Confirmar contraseña</label>
            <input
              id="reg-confirm"
              type="password"
              className="auth__input"
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth__submit">
            Registrarme
          </button>
        </form>

        <div className="auth__footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
