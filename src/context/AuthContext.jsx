import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const session = sessionStorage.getItem('estudia_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch {
        sessionStorage.removeItem('estudia_session');
      }
    }
  }, []);

  async function register(nombre, correo, contrasena) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, correo, contrasena }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error al crear la cuenta.' };
      }
    } catch (error) {
      console.error('Error de red al registrar:', error);
      return { success: false, message: 'No se pudo conectar con el servidor.' };
    }
  }

  async function login(correo, contrasena) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const sessionData = {
          id: data.user.id,
          nombre: data.user.nombre,
          correo: data.user.correo,
        };
        setUser(sessionData);
        sessionStorage.setItem('estudia_session', JSON.stringify(sessionData));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error al iniciar sesión.' };
      }
    } catch (error) {
      console.error('Error de red al iniciar sesión:', error);
      return { success: false, message: 'No se pudo conectar con el servidor.' };
    }
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('estudia_session');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
