import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/api/authService.js';
import usersService from '../services/api/usersService.js';
import sedesService from '../services/api/sedesService.js';
import propietarioService from '../services/api/propietarioService.js';
import { terminalesService } from '../services/api/index.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('axon_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [personal, setPersonal] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [currentSede, setCurrentSede] = useState(() => {
    const savedSede = localStorage.getItem('axon_sede');
    return savedSede ? JSON.parse(savedSede) : null;
  });
  const [terminals, setTerminals] = useState([]);
  const [currentTerminal, setCurrentTerminal] = useState(() => {
    const savedTerminal = localStorage.getItem('axon_terminal');
    return savedTerminal ? JSON.parse(savedTerminal) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const loadPersonal = useCallback(async () => {
    try {
      const employees = await usersService.getAllUsers();
      setPersonal(employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError(err.message);
    }
  }, []);

  const loadTerminals = useCallback(async () => {
    try {
      const terminalsData = await terminalesService.getAllTerminals();
      setTerminals(terminalsData || []);

      if (terminalsData?.length > 0) {
        const activeTerminal = terminalsData.find(t => t.activo) || terminalsData[0];
        if (activeTerminal) {
          setCurrentTerminal(activeTerminal);
          localStorage.setItem('axon_terminal', JSON.stringify(activeTerminal));
        }
      }
    } catch (err) {
      console.error('Failed to load terminals:', err);
      setError(err.message);
    }
  }, []);

  const loadSedes = useCallback(async () => {
    try {
      const sedesData = await sedesService.getAllSedes();
      setSedes(sedesData);

      if (sedesData.length > 0) {
        const savedSede = localStorage.getItem('axon_sede');
        let sedeToSelect;

        if (savedSede) {
          const parsedSede = JSON.parse(savedSede);
          sedeToSelect = sedesData.find(s => s.id === parsedSede.id) || sedesData[0];
        } else {
          // If no saved sede, check what the user's bound venue_id is!
          const currentUser = JSON.parse(localStorage.getItem('axon_user') || '{}');
          console.log("[AuthContext] loadSedes - Buscando sede por defecto. Usuario logueado:", currentUser);
          
          if (currentUser && currentUser.venue_id) {
             sedeToSelect = sedesData.find(s => s.id === currentUser.venue_id) || sedesData[0];
             console.log("[AuthContext] loadSedes - Asignando Sede coincidente con venue_id del token:", sedeToSelect);
          } else {
             sedeToSelect = sedesData[0];
             console.log("[AuthContext] loadSedes - Sin venue_id en usuario, forzando sedesData[0]:", sedeToSelect);
          }
        }

        console.log("[AuthContext] Sede Finalmente Establecida Visualmente y en Memoria:", sedeToSelect);

        setCurrentSede(sedeToSelect);
        localStorage.setItem('axon_sede', JSON.stringify(sedeToSelect));
        localStorage.setItem('axon_sede_id', sedeToSelect.id);
      }
    } catch (err) {
      console.error('Failed to load sedes:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('axon_token');
    const savedUser = localStorage.getItem('axon_user');

    if (token && !user) {
      authService.getMe()
        .then(userData => {

          setUser(userData);
        })
        .catch(err => {
          console.error('Failed to restore user session:', err);
          if (err.status === 401 || err.message.includes('401')) {

            localStorage.removeItem('axon_token');
            localStorage.removeItem('axon_user');
            localStorage.removeItem('axon_expires_in');
            localStorage.removeItem('axon_sede');
            localStorage.removeItem('axon_sede_id');
          }
        });
    } else if (savedUser && !user) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);

      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('axon_user');
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && user.rol === 'PROPIETARIO') {
      loadPersonal();
      loadSedes();
      loadTerminals();
    }
  }, [user, loadPersonal, loadSedes, loadTerminals]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const usuario = response.usuario || response;
      const userWithRole = {
        ...usuario,
        rol: usuario.rol || 'MESERO'
      };

      const token = response.token || localStorage.getItem('axon_token');
      
      // DECODE JWT TOKEN TO EXTRACT TRUE VENUE ID
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const tokenData = JSON.parse(jsonPayload);
          
          if (tokenData.venue_id) {
            userWithRole.venue_id = parseInt(tokenData.venue_id, 10);
            console.log("[AuthContext] Login - Extraído venue_id del token:", userWithRole.venue_id);
          }
        } catch (e) {
          console.error("[AuthContext] Error decoding token to extract venue_id", e);
        }
      }

      // Always purge legacy Sede cache on a completely fresh login
      // so `loadSedes` picks the safe default.
      localStorage.removeItem('axon_sede');
      localStorage.removeItem('axon_sede_id');

      if (token) {
        localStorage.setItem('axon_token', token);
      }
      localStorage.setItem('axon_user', JSON.stringify(userWithRole));
      if (response.expires_in) {
        localStorage.setItem('axon_expires_in', response.expires_in);
      }

      setUser(userWithRole);
      return userWithRole;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();

      localStorage.clear();
      setUser(null);
      setPersonal([]);
      setSedes([]);
      setCurrentSede(null);
      setTerminals([]);
      setCurrentTerminal(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.clear();
      setUser(null);
      setPersonal([]);
      setSedes([]);
      setCurrentSede(null);
      setTerminals([]);
      setCurrentTerminal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeSede = useCallback(async (sede) => {
    try {
      setLoading(true);
      
      const result = await authService.switchSede(sede.id);
      if (result && result.user) {
         setUser(result.user);
         localStorage.setItem('axon_user', JSON.stringify(result.user));
      }
      
      // Update local storage strictly, DO NOT update React State! 
      // Mutating React state triggers child re-renders (like AdminLayout's loadMesas) 
      // racing against the reload with an old token cache mapping.
      localStorage.setItem('axon_sede', JSON.stringify(sede));
      localStorage.setItem('axon_sede_id', sede.id);

      // Force instant clean wipe of React memory lifecycle.
      window.location.reload();
      
    } catch (err) {
      console.error('Error changing sede:', err);
      alert(`No se pudo cambiar de sede: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeTerminal = useCallback((terminal) => {
    if (!terminal || !terminal.id) {
      console.warn('Invalid terminal');
      return;
    }
    setCurrentTerminal(terminal);
    localStorage.setItem('axon_terminal', JSON.stringify(terminal));

  }, []);

  const createSede = useCallback(async (sedeData) => {
    setLoading(true);
    setError(null);
    try {
      const newSede = await sedesService.createSede(sedeData);
      setSedes(prev => [...prev, newSede]);
      return newSede;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(
        employeeData.nombre,
        employeeData.email,
        employeeData.password,
        employeeData.rol,
        employeeData.telefono
      );
      await loadPersonal();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPersonal]);

  const updateEmployee = useCallback(async (id, employeeData) => {
    setLoading(true);
    setError(null);
    try {
      await usersService.updateUser(id, employeeData);
      await loadPersonal();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPersonal]);

  const deleteEmployee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await usersService.deleteUser(id);
      await loadPersonal();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPersonal]);

  const getEmployeeById = useCallback((id) => {
    return personal.find(emp => emp.id === id);
  }, [personal]);

  const value = {
    user,
    personal,
    sedes,
    currentSede,
    terminals,
    currentTerminal,
    loading,
    error,
    login,
    logout,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    loadPersonal,
    changeSede,
    createSede,
    loadSedes,
    loadTerminals,
    changeTerminal
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
