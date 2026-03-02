# 🎯 Sistema de Roles y Gestión de Personal - README

## 📚 Documentación Disponible

Este proyecto ahora cuenta con un **sistema completo de roles** con dos niveles de acceso:

### 📖 Documentos Incluidos

1. **[SISTEMA_ROLES_PERSONAL.md](./SISTEMA_ROLES_PERSONAL.md)** ⭐ *Empieza aquí*
   - Descripción general del sistema
   - Estructura de roles (Admin vs Mesero)
   - Arquitectura técnica
   - Consideraciones de seguridad
   - **Mejor para:** Entender el qué y el porqué

2. **[GUIA_IMPLEMENTACION_ROLES.md](./GUIA_IMPLEMENTACION_ROLES.md)** 💻 *Ejemplos de código*
   - Ejemplos prácticos de uso
   - Patrones de desarrollo
   - Casos de uso avanzados
   - Integración con APIs
   - **Mejor para:** Aprender cómo implementar

3. **[MAPA_VISUAL_FLUJOS.md](./MAPA_VISUAL_FLUJOS.md)** 🗺️ *Diagramas visuales*
   - Diagrama de arquitectura
   - Flujos de autenticación
   - Flujos de gestión
   - Matrices de permisos
   - **Mejor para:** Visualizar el funcionamiento

---



## 👥 Roles Disponibles

### 👑 Admin
**Acceso Completo**
- 📋 Mesas
- 🛒 Pedidos
- 📖 Menú
- 👥 **Personal** (NUEVO)
- 💵 Caja
- 📊 Reportes

### 👤 Mesero
**Acceso Limitado**
- 📋 Mesas
- 🛒 Pedidos

---

## 🏗️ Estructura del Proyecto

```
src/
├── contexts/
│   ├── ProductContext.jsx
│   └── AuthContext.jsx              ⭐ NUEVO
├── features/
│   ├── cashier/
│   ├── dashboard/
│   ├── menu/
│   ├── order/
│   ├── orders/
│   ├── personnel/                   ⭐ NUEVO
│   │   ├── components/
│   │   │   └── PersonnelManagement.jsx
│   │   └── styles/
│   │       └── PersonnelManagement.css
│   ├── sidebar/
│   │   ├── components/
│   │   │   └── Sidebar.jsx          ✏️ MODIFICADO
│   │   └── styles/
│   │       └── Sidebar.css          ✏️ MODIFICADO
│   └── table-management/
├── hooks/
├── layouts/
│   └── AdminLayout.jsx              ✏️ MODIFICADO
├── pages/
├── services/
└── App.jsx                          ✏️ MODIFICADO
```

---

## 🔑 Conceptos Clave

### AuthContext
Contenedor global que maneja:
- Estado del usuario autenticado
- Lista de empleados
- Métodos CRUD para personal
- Persistencia en localStorage

```javascript
// Usar en cualquier componente:
import { useAuth } from '../contexts/AuthContext';

const { user, personal, addEmployee } = useAuth();
```

### Sidebar Dinámico
Muestra diferentes opciones según rol:
```javascript
{user?.role === 'admin' && (
  <button>👥 Personal</button>
)}
```

### PersonnelManagement
Componente completo para:
- Crear nuevo empleado
- Editar información
- Eliminar empleado
- Ver tabla de personal

---

## 📱 Tabla Comparativa: Admin vs Mesero

| Característica | Admin | Mesero |
|---|:---:|:---:|
| Ver Mesas | ✅ | ✅ |
| Crear Órdenes | ✅ | ✅ |
| Procesar Pagos | ✅ | ✅ |
| Editar Menú | ✅ | ❌ |
| Gestionar Personal | ✅ | ❌ |
| Ver Reportes | ✅ | ❌ |
| Acceso Caja | ✅ | ❌ |
| Sidebar Items | 7 | 2 |

---

## 🔬 Flujo de Desarrollo

### Agregar Empleado (Paso a Paso)

```
1. Admin → Click "👥 Personal"
          ↓
2.        → Click "+ Nuevo Empleado"
          ↓
3.        → Se abre Modal de formulario
          ↓
4.        → Admin complea datos:
           • Nombre: "Juan García"
           • Teléfono: "3101234567"
           • Email: "juan@email.com"
           • Cargo: "Mesero"
          ↓
5.        → Click "Registrar"
          ↓
6.        → addEmployee() en contexto
          ↓
7.        → Guarda en localStorage
          ↓
8.        → Tabla se actualiza
          ↓
9.        → Modal se cierra
          ↓
10.       → ✓ Empleado creado
```

---

## 💾 Datos en localStorage

### Estructura de Usuario
```javascript
{
  "id": 1234567890,
  "name": "Sebastian Botia",
  "email": "sebastian@restaurante.com",
  "role": "admin",
  "phone": "3123456789",
  "createdAt": "2024-03-02T10:00:00.000Z"
}
```

### Estructura de Empleado
```javascript
{
  "id": 1705000000,
  "name": "Juan García",
  "email": "juan@restaurant.com",
  "phone": "3101234567",
  "address": "Calle 10 #25-50",
  "position": "Mesero",
  "baseSalary": "1000000",
  "startDate": "2024-01-15",
  "role": "mesero",
  "createdAt": "2024-03-02T10:30:00.000Z"
}
```

---

## 🎮 Cómo Probar el Sistema

### Desde el Navegador (Console)

**Crear usuario admin:**
```javascript
localStorage.setItem('axon_user', JSON.stringify({
  id: Date.now(),
  name: 'Admin Test',
  role: 'admin'
}));
location.reload();
```

**Crear usuarios en personal:**
```javascript
localStorage.setItem('axon_personal', JSON.stringify([
  {
    id: Date.now() + 1,
    name: 'María López',
    position: 'Mesero',
    email: 'maria@test.com',
    phone: '3102222222'
  }
]));
location.reload();
```

**Cambiar a mesero:**
```javascript
const user = JSON.parse(localStorage.getItem('axon_user'));
user.role = 'mesero';
localStorage.setItem('axon_user', JSON.stringify(user));
location.reload();
```

---

## ⚙️ Archivos Modificados

### `App.jsx`
```diff
+ import { AuthProvider } from './contexts/AuthContext';

  <ProductProvider>
+   <AuthProvider>
      <BrowserRouter>
        ...
      </BrowserRouter>
+   </AuthProvider>
  </ProductProvider>
```

### `AdminLayout.jsx`
```diff
+ import PersonnelManagement from '../features/personnel/components/PersonnelManagement';
+ import { useAuth } from '../contexts/AuthContext';

+ const { user, logout } = useAuth();

+ {currentSection === 'personal' && (
+   <PersonnelManagement />
+ )}
```

### `Sidebar.jsx`
```diff
+ import { useAuth } from '../../../contexts/AuthContext';
+ const { user } = useAuth();

+ {user?.role === 'admin' && (
+   <button onClick={() => onSectionChange('personal')}>
+     👥 Personal
+   </button>
+ )}
```

---

## 🔒 Seguridad

### Desarrollo (Actual)
⚠️ **Basado en localStorage** - Solo para desarrollo

```javascript
// NO SEGURO para producción:
localStorage.setItem('axon_user', JSON.stringify(user));
```

### Producción (Recomendado)
✅ Implementar:
- JWT (JSON Web Tokens)
- Backend seguro
- Base de datos
- Hash de contraseñas

---

## 🚀 Próximos Pasos

### Fase 2: Sistema de Reportes
- [ ] Reporte de ventas
- [ ] Asistencia de personal
- [ ] Performance metrics

### Fase 3: Seguridad en Producción
- [ ] Autenticación con backend
- [ ] JWT tokens
- [ ] Historial de auditoría

### Fase 4: Características Avanzadas
- [ ] Asignación de mesas a meseros
- [ ] Comisiones automáticas
- [ ] Notificaciones en tiempo real

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos Nuevos | 3 |
| Archivos Modificados | 5 |
| Líneas de Código Nuevas | 600+ |
| Componentes Nuevos | 1 |
| Contextos Nuevos | 1 |
| Documentación (Lines) | 2000+ |

---

## 🔗 Enlaces Rápidos

```
Documentación Principal
└── SISTEMA_ROLES_PERSONAL.md
    ├── Descripción General
    ├── Roles (Admin vs Mesero)
    ├── ArquitecturaTécnica
    └── FAQ

Guía de Código
└── GUIA_IMPLEMENTACION_ROLES.md
    ├── Inicio Rápido
    ├── Ejemplos Prácticos
    ├── Patrones de Desarrollo
    └── Casos Avanzados

Visualización
└── MAPA_VISUAL_FLUJOS.md
    ├── Arquitectura
    ├── Diagramas de Flujo
    ├── Máquina de Estados
    └── Matrices de Permisos
```

---

## ❓ Preguntas Frecuentes

**P: ¿Cómo cambio el rol de un usuario?**
A: Modifica `axon_user` en localStorage o crea nuevo usuario con rol diferente.

**P: ¿Dónde se guardan los datos de empleados?**
A: En `localStorage` bajo la clave `axon_personal` como array JSON.

**P: ¿Puedo tener múltiples admins?**
A: Actualmente solo soporta un usuario activo. Para múltiples, necesitas backend.

**P: ¿Qué pasa si borro localStorage?**
A: Se pierden todos los datos. Los usuarios deberán volver a iniciar sesión.

**P: ¿Es seguro para producción?**
A: No. Implementa JWT y un backend seguro antes de producción.

---

## 🐛 Troubleshooting

### PersonnelManagement no aparece
- Verifica que los archivos existen
- Revisa imports en AdminLayout.jsx
- Comprueba que AuthProvider está en App.jsx

### Rol no funciona
- Verifica localStorage en DevTools
- Clave debe ser exactamente: `axon_user`
- Dale reload a la página

### Datos no persisten
- Verifica localStorage no esté deshabilitado
- Revisa limite de almacenamiento (5MB típico)
- Intenta limpiar y volver a crear

---

## 📞 Soporte

Si necesitas más información:
1. Lee **SISTEMA_ROLES_PERSONAL.md**
2. Consulta **GUIA_IMPLEMENTACION_ROLES.md**
3. Revisa **MAPA_VISUAL_FLUJOS.md**

---

## ✅ Checklist de Implementación

- [x] AuthContext creado
- [x] PersonnelManagement creado
- [x] Sidebar modificado
- [x] AdminLayout integrado
- [x] Documentación completa
- [x] Ejemplos de código
- [x] Diagramas visuales
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Backend implementado

---

**Versión:** 1.0  
**Última actualización:** Marzo 2, 2024  
**Estado:** ✅ Completado

