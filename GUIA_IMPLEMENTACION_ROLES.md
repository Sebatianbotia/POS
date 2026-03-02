# 💻 Guía de Implementación - Sistema de Roles y Personal

## 🎯 Objetivo
Este documento proporciona ejemplos de código y patrones de implementación para usar el nuevo sistema de roles y personal.

---

## 🚀 Inicio Rápido

### 1. Uso del Hook `useAuth()`

```javascript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { user, personal, login, logout } = useAuth();

  // Verificar si es admin
  if (user?.role === 'admin') {
    // Mostrar controles admin
  }

  return (
    <div>
      <p>Usuario: {user?.name}</p>
      <p>Rol: {user?.role}</p>
    </div>
  );
}
```

---

## 👤 Ejemplos: Gestión del Usuario

### Iniciar Sesión
```javascript
const { login } = useAuth();

const handleLogin = (formData) => {
  login({
    name: formData.name,
    email: formData.email,
    role: formData.role || 'mesero'  // Admin o Mesero
  });
};
```

### Cerrar Sesión
```javascript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate('/auth');
};
```

### Obtener Datos del Usuario
```javascript
const { user } = useAuth();

console.log(user);
// {
//   id: 123456789,
//   name: "Sebastian",
//   email: "sebastian@email.com",
//   role: "admin"
// }
```

---

## 👥 Ejemplos: Gestión de Personal

### Agregar un Nuevo Empleado
```javascript
import { useAuth } from '../contexts/AuthContext';

function AgregarEmpleado() {
  const { addEmployee } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Mesero'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newEmployee = addEmployee({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position
    });

    console.log('Empleado creado:', newEmployee);
    // {
    //   id: 1705000000,
    //   name: "Juan García",
    //   email: "juan@email.com",
    //   phone: "3101234567",
    //   position: "Mesero",
    //   role: "mesero",
    //   createdAt: "2024-03-02T10:00:00.000Z"
    // }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  );
}
```

### Listar Todos los Empleados
```javascript
import { useAuth } from '../contexts/AuthContext';

function ListaEmpleados() {
  const { personal } = useAuth();

  return (
    <table>
      <tbody>
        {personal.map(employee => (
          <tr key={employee.id}>
            <td>{employee.name}</td>
            <td>{employee.position}</td>
            <td>{employee.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Actualizar un Empleado
```javascript
const { updateEmployee } = useAuth();

const handleEdit = (employeeId, newData) => {
  updateEmployee(employeeId, {
    name: 'Juan García Actualizado',
    position: 'Chef',
    baseSalary: '2000000'
  });

  console.log('Empleado actualizado');
};
```

### Eliminar un Empleado
```javascript
const { deleteEmployee } = useAuth();

const handleDelete = (employeeId) => {
  if (window.confirm('¿Estás seguro?')) {
    deleteEmployee(employeeId);
    console.log('Empleado eliminado');
  }
};
```

### Buscar un Empleado por ID
```javascript
const { getEmployeeById } = useAuth();

const empleado = getEmployeeById(1705000000);
console.log(empleado);
// { id: 1705000000, name: "Juan García", ... }
```

---

## 🔐 Control de Acceso por Rol

### Patrón 1: Renderizado Condicional
```javascript
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  return (
    <nav>
      <button>📋 Mesas</button>
      <button>🛒 Pedidos</button>

      {user?.role === 'admin' && (
        <>
          <button>📖 Menú</button>
          <button>👥 Personal</button>
          <button>💵 Caja</button>
        </>
      )}
    </nav>
  );
}
```

### Patrón 2: Componente Protegido por Rol
```javascript
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminOnlyComponent({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Uso:
<AdminOnlyComponent>
  <PersonnelManagement />
</AdminOnlyComponent>
```

### Patrón 3: Verificar Permiso antes de Acción
```javascript
import { useAuth } from '../contexts/AuthContext';

function ComponenteConPermisos() {
  const { user } = useAuth();

  const handleDeleteProduct = () => {
    if (user?.role !== 'admin') {
      alert('Solo los admins pueden eliminar productos');
      return;
    }

    // Continuar con eliminación
  };

  return <button onClick={handleDeleteProduct}>Eliminar</button>;
}
```

---

## 🏗️ Patrones de Desarrollo

### Patrón 1: Hook Personalizado para Verificar Rol
```javascript
// hooks/useCheckRole.js
import { useAuth } from '../contexts/AuthContext';

export function useCheckRole() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === 'admin',
    isMesero: user?.role === 'mesero',
    role: user?.role,
    canPerformAction: (requiredRole) => user?.role === requiredRole
  };
}

// Uso:
import { useCheckRole } from '../hooks/useCheckRole';

function MiComponente() {
  const { isAdmin } = useCheckRole();

  if (isAdmin) {
    // Mostrar controles de admin
  }
}
```

### Patrón 2: Proveer Datos de Usuario a Componentes Hijos
```javascript
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { user, personal } = useAuth();

  return (
    <div>
      <Header userName={user?.name} role={user?.role} />
      <EmployeeList employees={personal} />
    </div>
  );
}
```

### Patrón 3: Sincronizar Estado Local con Contexto
```javascript
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

function PersonalDashboard() {
  const { personal, addEmployee } = useAuth();
  const [localEmployees, setLocalEmployees] = useState([]);

  useEffect(() => {
    // Sincronizar cuando personal cambia en el contexto
    setLocalEmployees(personal);
  }, [personal]);

  return (
    <div>
      Total: {localEmployees.length}
    </div>
  );
}
```

---

## 📊 Casos de Uso Avanzados

### 1. Filtrar Empleados por Posición
```javascript
const { personal } = useAuth();

const getMeseros = () => personal.filter(emp => emp.position === 'Mesero');
const getChefs = () => personal.filter(emp => emp.position === 'Chef');
const getGerentes = () => personal.filter(emp => emp.position === 'Gerente');

console.log('Meseros:', getMeseros());
```

### 2. Contar Empleados por Cargo
```javascript
const { personal } = useAuth();

const stats = {
  total: personal.length,
  meseros: personal.filter(e => e.position === 'Mesero').length,
  chefs: personal.filter(e => e.position === 'Chef').length,
  gerentes: personal.filter(e => e.position === 'Gerente').length
};

console.log(stats);
// { total: 5, meseros: 3, chefs: 1, gerentes: 1 }
```

### 3. Buscar Empleado por Nombre
```javascript
const { personal } = useAuth();

function searchEmployee(nombre) {
  return personal.filter(emp =>
    emp.name.toLowerCase().includes(nombre.toLowerCase())
  );
}

console.log(searchEmployee('juan'));
```

### 4. Obtener Contacto de Empleado
```javascript
const { getEmployeeById } = useAuth();

function getEmployeeContact(employeeId) {
  const emp = getEmployeeById(employeeId);
  return {
    phone: emp?.phone,
    email: emp?.email,
    address: emp?.address
  };
}
```

### 5. Listar Empleados Recientemente Agregados
```javascript
const { personal } = useAuth();

function getRecentlyAdded(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return personal.filter(emp => 
    new Date(emp.createdAt) > cutoffDate
  );
}
```

---

## 🔄 Ciclo de Vida de una Transacción

### Agregar Empleado - Flujo Completo
```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function FormularioEmpleado() {
  const { addEmployee } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Validar datos
      if (!formData.name || !formData.email) {
        throw new Error('Campos requeridos faltantes');
      }

      // 2. Agregar empleado
      const newEmployee = addEmployee(formData);

      // 3. Mostrar éxito
      setSuccess(true);
      setLoading(false);

      // 4. Limpiar después de 2 segundos
      setTimeout(() => setSuccess(false), 2000);

      return newEmployee;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        name: 'Juan',
        email: 'juan@email.com',
        phone: '3101234567'
      });
    }}>
      {loading && <p>Guardando...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>¡Empleado guardado!</p>}
      <button type="submit">Guardar</button>
    </form>
  );
}
```

---

## 🧪 Pruebas en Consola del Navegador

### Verificar Datos en LocalStorage
```javascript
// Ver todos los datos
console.log('Usuario:', JSON.parse(localStorage.getItem('axon_user')));
console.log('Personal:', JSON.parse(localStorage.getItem('axon_personal')));

// Limpiar datos
localStorage.removeItem('axon_user');
localStorage.removeItem('axon_personal');

// Recargar página
location.reload();
```

### Crear Usuario de Prueba
```javascript
// En consola:
localStorage.setItem('axon_user', JSON.stringify({
  id: Date.now(),
  name: 'Juan García',
  email: 'juan@email.com',
  role: 'admin',
  phone: '3101234567',
  createdAt: new Date().toISOString()
}));

localStorage.setItem('axon_personal', JSON.stringify([
  {
    id: Date.now() + 1,
    name: 'María López',
    email: 'maria@email.com',
    phone: '3102345678',
    position: 'Mesero',
    role: 'mesero',
    createdAt: new Date().toISOString()
  }
]));

location.reload();
```

---

## 📈 Migración a Backend (Próxima Fase)

### Cambios Necesarios para Usar API

```javascript
// Antes (localStorage)
const { personal } = useAuth();

// Después (API Backend)
const [personal, setPersonal] = useState([]);

useEffect(() => {
  fetch('/api/personal', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(res => res.json())
  .then(data => setPersonal(data))
  .catch(err => console.error(err));
}, []);
```

### Estructura de API Recomendada
```
GET    /api/personal              → Listar todos
POST   /api/personal              → Crear nuevo
GET    /api/personal/:id          → Obtener uno
PUT    /api/personal/:id          → Actualizar
DELETE /api/personal/:id          → Eliminar

GET    /api/auth/me               → Obtener usuario actual
POST   /api/auth/login            → Iniciar sesión
POST   /api/auth/logout           → Cerrar sesión
```

---

## 🎓 Resumen de Conceptos

### Contexto (AuthContext)
```
Proporciona:
├── Estado global del usuario
├── Lista de empleados
└── Métodos para manipular datos

Usado por:
└── Cualquier componente que importe useAuth()
```

### Hook (useAuth)
```
Devuelve:
├── user: Datos del usuario actual
├── personal: Array de empleados
├── login(): Inicia sesión
├── logout(): Cierra sesión
├── addEmployee(): Agrega empleado
├── updateEmployee(): Actualiza empleado
├── deleteEmployee(): Elimina empleado
└── getEmployeeById(): Obtiene empleado
```

### Protección de Rutas
```
Verificar antes de renderizar:
└── if (user?.role === 'admin') { ... }
```

---

## ✅ Checklist de Implementación

- [x] AuthContext creado
- [x] PersonnelManagement creado
- [x] Sidebar modificado con control de acceso
- [x] AdminLayout integrado
- [x] localStorage configurado
- [x] Documentación completa
- [ ] Backend implementado
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Seguridad en producción

---

**Versión:** 2.0  
**Tipo:** Guía de Implementación  
**Última actualización:** Marzo 2, 2024
