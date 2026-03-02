import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Función para generar credenciales automáticas
function generarCredenciales(nombre) {
  // Usuario: basado en el nombre (primeros 3 caracteres + números)
  const userBase = nombre.toLowerCase().replace(/\s+/g, '.').substring(0, 8);
  const usuario = userBase + Math.floor(Math.random() * 100);
  
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return { usuario, password };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('axon_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [personal, setPersonal] = useState(() => {
    const savedPersonal = localStorage.getItem('axon_personal');
    return savedPersonal ? JSON.parse(savedPersonal) : [];
  });

  const login = (userData) => {
    const userWithRole = {
      ...userData,
      role: userData.role || 'mesero' 
    };
    setUser(userWithRole);
    localStorage.setItem('axon_user', JSON.stringify(userWithRole));
    localStorage.setItem('axon_client_name', userData.name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('axon_user');
    localStorage.removeItem('axon_client_name');
  };

  const addEmployee = (employeeData) => {
    // Generar credenciales automáticas
    const credentials = generarCredenciales(employeeData.name);
    
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      role: 'mesero',
      credentials: {
        usuario: credentials.usuario,
        password: credentials.password
      },
      createdAt: new Date().toISOString()
    };
    const updatedPersonal = [...personal, newEmployee];
    setPersonal(updatedPersonal);
    localStorage.setItem('axon_personal', JSON.stringify(updatedPersonal));
    return newEmployee;
  };

  const updateEmployee = (id, employeeData) => {
    const updatedPersonal = personal.map(emp =>
      emp.id === id ? { ...emp, ...employeeData } : emp
    );
    setPersonal(updatedPersonal);
    localStorage.setItem('axon_personal', JSON.stringify(updatedPersonal));
  };

  const deleteEmployee = (id) => {
    const updatedPersonal = personal.filter(emp => emp.id !== id);
    setPersonal(updatedPersonal);
    localStorage.setItem('axon_personal', JSON.stringify(updatedPersonal));
  };

  const getEmployeeById = (id) => {
    return personal.find(emp => emp.id === id);
  };

  const value = {
    user,
    personal,
    login,
    logout,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
