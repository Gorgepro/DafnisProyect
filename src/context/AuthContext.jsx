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

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('estudia_users') || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('estudia_users', JSON.stringify(users));
  }

  function register(nombre, correo, contrasena) {
    const users = getUsers();

    // Check if email already exists
    if (users.find(u => u.correo === correo)) {
      return { success: false, message: 'Este correo ya está registrado.' };
    }

    const newUser = {
      id: Date.now(),
      nombre,
      correo,
      // Simple encoding for demo (NOT real security)
      contrasena: btoa(contrasena),
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'Cuenta creada correctamente.' };
  }

  function login(correo, contrasena) {
    const users = getUsers();
    const found = users.find(u => u.correo === correo);

    if (!found) {
      return { success: false, message: 'El usuario no existe.' };
    }

    if (found.contrasena !== btoa(contrasena)) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    const sessionData = { id: found.id, nombre: found.nombre, correo: found.correo };
    setUser(sessionData);
    sessionStorage.setItem('estudia_session', JSON.stringify(sessionData));

    return { success: true, message: 'Sesión iniciada.' };
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
