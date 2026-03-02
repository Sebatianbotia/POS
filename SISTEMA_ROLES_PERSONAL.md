# 📊 Sistema de Gestión de Roles y Personal - Documentación

## 🎯 Descripción General

El sistema ha sido actualizado para soportar **dos roles principales** con permisos diferenciados:
- **Admin**: Acceso completo a todas las funcionalidades
- **Mesero**: Acceso limitado a funcionalidades básicas de servicio

---

## 👥 Estructura del Sistema de Roles

### 1. **Admin** 👑
El administrador del restaurante tiene acceso completo a:

| Sección | Descripción | Permite |
|---------|-------------|---------|
| 📋 **Mesas** | Gestión de mesas | Ver estado, asignar meseros, ocupar/liberar mesas |
| 🛒 **Pedidos** | Gestión de órdenes | Ver todas las órdenes, marcar como completadas |
| 📖 **Menú** | Gestión de productos | Crear, editar, eliminar productos y categorías |
| 👥 **Personal** | Gestión de empleados | Registrar, editar, eliminar meseros y personal |
| 💵 **Caja** | Control de pagos | Ver transacciones, reportes de ingresos |
| 📊 **Reportes** | Análisis de datos | Reportes de ventas, asistencia, performance |

### 2. **Mesero** 👤
El mesero tiene acceso limitado a:

| Sección | Descripción | Permite |
|---------|-------------|---------|
| 📋 **Mesas** | Gestión de mesas | Ver estado de mesas asignadas, ocupar/liberar |
| 🛒 **Pedidos** | Gestión de órdenes | Ver sus pedidos, procesar cobros |

---

## 🏗️ Arquitectura Técnica

### Contexto de Autenticación: `AuthContext.jsx`

```jsx
// Ubicación: src/contexts/AuthContext.jsx
```

**Responsabilidades:**
- Mantener el estado del usuario autenticado
- Gestionar datos de personal (empleados)
- Proporcionar métodos para agregar, editar y eliminar empleados
- Persistir datos en `localStorage`

**Funciones principales:**
```javascript
// Autenticación
login(userData)           // Inicia sesión del usuario
logout()                  // Cierra la sesión actual

// Gestión de Personal
addEmployee(employeeData)    // Agrega un nuevo empleado
updateEmployee(id, data)     // Actualiza datos del empleado
deleteEmployee(id)           // Elimina un empleado
getEmployeeById(id)          // Obtiene datos de un empleado
```

**Estructura de datos del usuario:**
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string,
  role: 'admin' | 'mesero',
  baseSalary: string,
  startDate: string,
  createdAt: string  // ISO timestamp
}
```

---

## 👥 Gestión de Personal

### Componente: `PersonnelManagement.jsx`

**Ubicación:** `src/features/personnel/components/PersonnelManagement.jsx`

**Características:**
- ✅ Formulario completo para registrar empleados
- ✅ Edición de datos de empleados existentes
- ✅ Eliminación de empleados con confirmación
- ✅ Búsqueda y filtrado de empleados
- ✅ Estadísticas de personal (total, por cargo)
- ✅ Tabla responsiva de empleados

**Campos del formulario:**
```
📋 INFORMACIÓN GENERAL
├── Nombre (requerido)
├── Teléfono (requerido)
├── Correo Electrónico (requerido)
└── Dirección

💼 INFORMACIÓN LABORAL
├── Cargo (Mesero, Chef, Gerente, Caja)
├── Salario Base
└── Fecha de Inicio
```

**Acciones disponibles:**
- Crear nuevo empleado
- Editar información del empleado
- Eliminar empleado
- Ver tabla de todos los empleados

---

## 🔐 Control de Acceso: Sidebar

### Componente Actualizado: `Sidebar.jsx`

**Ubicación:** `src/features/sidebar/components/Sidebar.jsx`

**Cambios implementados:**
- Muestra un badge de rol (Admin/Mesero) junto al nombre
- Ajusta dinámicamente qué opciones de menú se muestran
- Oculta funcionalidades según el rol del usuario

**Menú dinámico:**
```
Todos los usuarios:
  📋 Mesas
  🛒 Pedidos

Solo Admin:
  📖 Menú
  👥 Personal ← NUEVO
  💵 Caja
  📊 Reportes ← NUEVO (en desarrollo)
```

**Estilos de rol:**
- Admin: Badge naranja con ícono 👑
- Mesero: Badge azul con ícono 👤

---

## 📱 Flujo de Autenticación

### 1. **Página de Login** (`ClientAuth.jsx`)
```
Usuario ingresa credenciales
       ↓
Sistema valida credenciales
       ↓
Determina el rol (Admin/Mesero)
       ↓
useAuth().login() guarda datos
       ↓
Redirige a /admin
```

### 2. **Verificación de Sesión**
```javascript
// En cualquier componente que necesite verificar roles:
const { user } = useAuth();
const isAdmin = user?.role === 'admin';

if (isAdmin) {
  // Mostrar opciones de admin
} else {
  // Mostrar opciones de mesero
}
```

---

## 💾 Persistencia de Datos

### LocalStorage Keys

| Key | Contenido | Tipo |
|-----|-----------|------|
| `axon_user` | Datos del usuario actual | JSON Object |
| `axon_personal` | Lista de empleados | JSON Array |
| `axon_client_name` | Nombre del usuario | String |
| `restaurante` | Nombre del restaurante | String |

**Ejemplo de datos en localStorage:**
```javascript
// axon_user
{
  "id": 1234567890,
  "name": "Sebastian Botia",
  "email": "sebastian@email.com",
  "role": "admin",
  "phone": "3123456789",
  "createdAt": "2024-03-01T10:00:00.000Z"
}

// axon_personal
[
  {
    "id": 1705000000,
    "name": "Juan García",
    "email": "juan@email.com",
    "phone": "3101234567",
    "address": "Calle 10 #25-50",
    "position": "Mesero",
    "baseSalary": "1000000",
    "startDate": "2024-01-15",
    "role": "mesero",
    "createdAt": "2024-03-01T10:30:00.000Z"
  }
]
```

---

## 🎨 Diseño de Componentes

### PersonnelManagement
```
┌─────────────────────────────────────┐
│  Gestión de Personal                │
│  Control de empleados               │ [+ Nuevo Empleado]
├─────────────────────────────────────┤
│ [24 Total] [12 Meseros] [2 Chefs]   │
├─────────────────────────────────────┤
│ Nombre | Cargo | Contacto | Acciones│
├─────────────────────────────────────┤
│ Juan   │Mesero│ 310... │ [✏️] [🗑️]   │
│ María  │Chef  │ 312... │ [✏️] [🗑️]   │
└─────────────────────────────────────┘
```

### Modal de Nuevo Empleado
```
┌────────────────────────────────────────┐
│ Agregar Nuevo Empleado             [×] │
├────────────────────────────────────────┤
│ 📋 INFORMACIÓN GENERAL                 │
│                                        │
│ Nombre: [_____________________]       │
│                                        │
│ Teléfono: [______] Correo: [_____] │
│                                        │
│ Dirección: [____________________]     │
│                                        │
│ 💼 INFORMACIÓN LABORAL                 │
│                                        │
│ Cargo: [Mesero ▼]  Salario: [0] │
│                                        │
│ Fecha Inicio: [2024-03-01]            │
├────────────────────────────────────────┤
│                        [Cancelar] [✓] │
└────────────────────────────────────────┘
```

---

## 🔄 Flujos de Uso

### Caso 1: Admin registra un nuevo mesero

```
1. Login como Admin
2. Sidebar muestra "👥 Personal"
3. Click en "👥 Personal"
4. Click en "+ Nuevo Empleado"
5. Completa el formulario:
   - Nombre: Juan García
   - Teléfono: 3101234567
   - Correo: juan@email.com
   - Cargo: Mesero
6. Click "Registrar"
7. Empleado aparece en la tabla
8. Datos guardados en localStorage
```

### Caso 2: Mesero trabaja durante su turno

```
1. Login como Mesero
2. Solo ve: 📋 Mesas y 🛒 Pedidos
3. Nota: No puede acceder a:
   - Menú
   - Personal
   - Caja
   - Reportes
4. Puede:
   - Ver mesas asignadas
   - Crear órdenes
   - Procesar pagos
```

### Caso 3: Admin edita datos de un empleado

```
1. En sección Personal
2. Busca o localiza al empleado
3. Click en ✏️ (editar)
4. Actualiza datos necesarios
5. Click "Actualizar"
6. Cambios se reflejan inmediatamente
7. Cambios guardados en localStorage
```

---

## 🛠️ Integración en AdminLayout

**Archivo:** `src/layouts/AdminLayout.jsx`

El layout ahora:
- Usa `useAuth()` para obtener datos del usuario
- Renderiza componentes según `currentSection`
- Maneja logout correctamente con `logout()`
- Pasa el nombre del usuario desde el contexto

```javascript
const { user, logout } = useAuth();
const nombre = user?.name || localStorage.getItem('axon_client_name');

function closeSesion() {
  logout();
  navigate('/auth');
}
```

---

## 🔒 Consideraciones de Seguridad

### Actual (Desarrollo)
⚠️ Sistema basado en localStorage - **NO SEGURO para producción**

```javascript
// Los datos se guardan en texto plano
localStorage.setItem('axon_user', JSON.stringify(user));
```

### Para Producción ⚡
Implementar:
- ✅ Autenticación con JWT (JSON Web Tokens)
- ✅ Backend con NodeJS/Express o similar
- ✅ Base de datos (MongoDB, PostgreSQL)
- ✅ Hashing de contraseñas
- ✅ Control de sesiones
- ✅ Validación en servidor

**Ejemplo backend recomendado:**
```javascript
// Pseudocódigo - Backend necesario
POST /api/auth/login
  ├── Validar credenciales
  ├── Generar JWT
  └── Retornar token

GET /api/personal
  ├── Validar JWT
  ├── Verificar permiso (admin)
  └── Retornar empleados
```

---

## 📋 Lista de Archivos Modificados/Creados

### ✨ Archivos Nuevos
```
src/contexts/AuthContext.jsx
src/features/personnel/components/PersonnelManagement.jsx
src/features/personnel/styles/PersonnelManagement.css
```

### 📝 Archivos Modificados
```
src/App.jsx                          (Agregó AuthProvider)
src/layouts/AdminLayout.jsx          (Integración de roles y PersonnelManagement)
src/features/sidebar/components/Sidebar.jsx  (Menú dinámico según rol)
src/features/sidebar/styles/Sidebar.css      (Estilos del badge de rol)
src/styles/layouts/AdminLayout.css   (Estilos de placeholder sections)
```

---

## 🚀 Próximas Implementaciones

### Fase 2: Sistema de Reportes
- [ ] Reporte de ventas por período
- [ ] Asistencia de personal
- [ ] Performance de meseros
- [ ] Productos más vendidos

### Fase 3: Mejoras de Seguridad
- [ ] Autenticación con contraseña
- [ ] Backend seguro
- [ ] Historial de cambios
- [ ] Auditoría de transacciones

### Fase 4: Características Avanzadas
- [ ] Asignación de mesas a meseros
- [ ] Comisiones por ventas
- [ ] Turnos automáticos
- [ ] Notificaciones en tiempo real

---

## 📞 Guía de Uso Rápido

### Para usar el sistema:

1. **Iniciar sesión como Admin:**
   - Nombre: cualquier nombre
   - Se guarda automáticamente con rol 'admin'

2. **Acceder a Personal:**
   - Click en "👥 Personal" en la barra lateral
   - Click en "+ Nuevo Empleado"
   - Completa el formulario
   - Datos se guardan automáticamente

3. **Ver empleados:**
   - Tabla muestra todos los registrados
   - Puedes editar o eliminar desde aquí

4. **Cambiar de rol:**
   - Modificar localStorage:
   ```javascript
   // En consola del navegador:
   localStorage.setItem('axon_user', JSON.stringify({
     name: 'Juan',
     role: 'mesero'
   }));
   // Recargar página
   ```

---

## 🐛 Solución de Problemas

### Problema: El componente PersonnelManagement no se muestra
**Solución:** Verifica que:
- [ ] El archivo existe en `src/features/personnel/components/PersonnelManagement.jsx`
- [ ] El CSS existe en `src/features/personnel/styles/PersonnelManagement.css`
- [ ] El import en AdminLayout.jsx es correcto
- [ ] AuthProvider está en App.jsx

### Problema: El rol no cambia al iniciar sesión
**Solución:**
- Verifica que useAuth() esté disponible
- Confirma que AuthProvider rodea el árbol de componentes
- Revisa localStorage en DevTools

### Problema: Los datos de personal no se persisten
**Solución:**
- Verifica que localStorage no esté deshabilitado
- Abre DevTools → Application → LocalStorage
- Busca clave `axon_personal`

---

## 📊 Estadísticas del Sistema

### Componentes Creados
- 1 Contexto (AuthContext)
- 1 Componente Principal (PersonnelManagement)
- Estilos CSS asociados

### Funcionalidades Nuevas
- ✅ Sistema de roles (Admin/Mesero)
- ✅ Gestión completa de personal
- ✅ Control de acceso por rol
- ✅ Persistencia de datos en localStorage

### Líneas de Código
- **AuthContext.jsx:** ~75 líneas
- **PersonnelManagement.jsx:** ~200+ líneas
- **PersonnelManagement.css:** ~350+ líneas
- **Total:** +600 líneas de código nuevo

---

**Versión:** 1.0  
**Última actualización:** Marzo 2, 2024  
**Estado:** ✅ Implementación Completa
