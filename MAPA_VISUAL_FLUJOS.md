# 🗺️ Mapa Visual del Sistema - Flujos y Arquitectura

## 📊 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP.JSX                                 │
│                   (AuthProvider wrapper)                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼─────┐      ┌────▼──────┐
   │ ClientAuth│      │AdminLayout │
   │(Login)    │      │(Workspace) │
   └───────────┘      └────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼──────┐     ┌────▼────┐
   │Sidebar  │      │Content Area │     │Contexto│
   │(Menú)   │      │(Sections)   │     │ Auth   │
   └─────────┘      └─────────────┘     └────────┘
        │                  │
        │     ┌────────────┼────────────┐
        │     │            │            │
    ┌───▼──┐┌─▼────┐ ┌─────▼───┐ ┌────▼──────┐
    │Admin ││Mesero││Personal   │ │ Otros     │
    │Items ││Items ││Management │ │Components │
    └──────┘└──────┘ └───────────┘ └───────────┘
```

---

## 🔐 Flujo de Autenticación

```
┌─────────────────┐
│  Cliente Abre   │
│   la App        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Splash Screen  │ (2 segundos)
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│  ClientAuth Page │
│  (Formulario)    │
└────────┬─────────┘
         │
    Usuario ingresa:
    ├── Nombre
    ├── Email (opcional)
    └── Role (admin/mesero)
         │
         ▼
┌──────────────────┐
│ useAuth().login()│
│                  │
│ Guarda en:       │
│ ├─ localStorage  │
│ └─ Contexto      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AdminLayout     │
│  (Premium View)  │
└──────────────────┘
         │
    Se muestra Sidebar
    con opciones según  
    el rol del usuario
```

---

## 👥 Flujo de Gestión de Personal (Admin Only)

```
┌─────────────────────────────┐
│  Sidebar > Personal (👥)    │
└────────────┬────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ PersonnelManagement          │
│                              │
│  [+ Nuevo Empleado]         │
│                              │
│  Stats:                      │
│  ├─ Total: 5                │
│  ├─ Meseros: 3              │
│  └─ Chefs: 1                │
│                              │
│  Tabla de Empleados:         │
│  ├─ Nombre                   │
│  ├─ Cargo                    │
│  ├─ Contacto                 │
│  └─ [Acciones]              │
└────────┬───────┬────────┬────┘
         │       │        │
    ┌────▼┐ ┌───▼──┐ ┌───▼───┐
    │ + │ │ Edit  │ │Delete │
    │New│ │ (✏️)  │ │ (🗑️) │
    └────┘ └──────┘ └───────┘
     │                    │
     │                    │
┌────▼──────────┐    ┌───▼──────────┐
│  Modal Form   │    │ Confirm Box  │
│               │    │              │
│ 📋 General   │    │ ¿Eliminar     │
│ ├─ Nombre    │    │ empleado?     │
│ ├─ Teléfono  │    │              │
│ ├─ Correo    │    │ [Sí] [No]    │
│ ├─ Dirección │    └──────────────┘
│               │
│ 💼 Laboral   │
│ ├─ Cargo     │
│ ├─ Salario   │
│ └─ Fecha     │
│               │
│ [Cancelar]   │
│ [Registrar]  │
│              │
│ updateEmployee() ──→ localStorage
│              │
└──────────────┘
```

---

## 🎯 Control de Acceso - Sidebar Dinámico

```
┌─────────────────────────────────────────┐
│          SIDEBAR NAVIGATION             │
├─────────────────────────────────────────┤
│                                         │
│  👑 / 👤 + Rol Badge                   │
│                                         │
├─────────────────────────────────────────┤
│  Siempre Visible:                      │
│  📋 Mesas                              │
│  🛒 Pedidos                            │
│                                         │
├─────────────────────────────────────────┤
│  Solo si role === 'admin':             │
│  📖 Menú                               │
│  👥 Personal ◄─── NUEVO!             │
│  💵 Caja                               │
│  📊 Reportes                           │
│                                         │
├─────────────────────────────────────────┤
│  Footer:                                │
│  👤 Perfil                             │
│  🚪 Cerrar Sesión                      │
└─────────────────────────────────────────┘

                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼──────────┐          ┌─────▼──────────┐
│ Admin View   │          │ Mesero View    │
│              │          │                │
│ 6 opciones   │          │ 2 opciones     │
│              │          │                │
│ Completo     │          │ Limitado       │
│ acceso       │          │ acceso         │
└──────────────┘          └────────────────┘
```

---

## 📱 Flujo de Usuario: Admin

```
┌────────────────────────────────────────┐
│  LOGIN como "Sebastian" (admin)        │
└─────┬──────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│  AdminLayout carga con FULL ACCESS      │
│                                          │
│  [👑 Sebastian]              [Sidebar]   │
│                                          │
│  ├─ 📋 Mesas              ◄─ Admin View │
│  ├─ 🛒 Pedidos                         │
│  ├─ 📖 Menú               ◄─ Only Admin │
│  ├─ 👥 Personal           ◄─ NEW!      │
│  ├─ 💵 Caja                            │
│  └─ 📊 Reportes                        │
│                                          │
│  [Content-Area]  [Central Space]        │
│  Muestra el      con componentes        │
│  contenido de la basados en             │
│  sección activa  currentSection         │
└──────────────────────────────────────────┘
      │ Click en "👥 Personal"
      ▼
┌──────────────────────────────────────────┐
│         PERSONAL MANAGEMENT              │
│                                          │
│  [+ Nuevo Empleado]                     │
│                                          │
│  Total: 24 │ Meseros: 15 │ Chefs: 3   │
│                                          │
│  Tabla:                                 │
│  ┌──────────────────────────────────┐  │
│  │ Nombre │ Cargo │ Contacto│Acciones │ │
│  ├──────────────────────────────────┤  │
│  │ Juan   │Mesero│ 310... │ ✏️ 🗑️   │ │
│  │ María  │Chef  │ 312... │ ✏️ 🗑️   │ │
│  │ Pedro  │Mesero│ 314... │ ✏️ 🗑️   │ │
│  └──────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
      │ Click en "+ Nuevo Empleado"
      ▼
┌──────────────────────────────────────────┐
│    MODAL: AGREGAR NUEVO EMPLEADO         │
│                                          │
│  📋 INFORMACIÓN GENERAL                 │
│  ├─ Nombre: [_________________] ✓      │
│  ├─ Teléfono: [______] [_____] ✓      │
│  ├─ Correo: [__________________] ✓     │
│  └─ Dirección: [_____________]         │
│                                          │
│  💼 INFORMACIÓN LABORAL                 │
│  ├─ Cargo: [Mesero ▼]                  │
│  ├─ Salario: [0______]                 │
│  └─ Fecha Inicio: [2024-03-02]         │
│                                          │
│              [Cancelar] [Registrar]     │
└──────────────────────────────────────────┘
      │ Completa formulario y click "Registrar"
      ▼
┌──────────────────────────────────────────┐
│         EMPLEADO CREADO                   │
│                                          │
│  ✓ Nuevo empleado registrado            │
│                                          │
│  id: 1705000000                         │
│  name: "Juan García"                    │
│  position: "Mesero"                     │
│                                          │
│  → Guardado en localStorage             │
│  → Aparece en tabla automáticamente     │
│  → Modal se cierra                      │
└──────────────────────────────────────────┘
```

---

## 📱 Flujo de Usuario: Mesero

```
┌────────────────────────────────────────┐
│  LOGIN como "María" (mesero)           │
└─────┬──────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│  AdminLayout carga con LIMITED ACCESS   │
│                                          │
│  [👤 María]                 [Sidebar]    │
│                                          │
│  ├─ 📋 Mesas              ◄─ Allowed    │
│  └─ 🛒 Pedidos            ◄─ Allowed    │
│                                          │
│  ❌ NO VISIBLE:                         │
│  ├─ 📖 Menú                            │
│  ├─ 👥 Personal                        │
│  ├─ 💵 Caja                            │
│  └─ 📊 Reportes                        │
│                                          │
│  [Content-Area]  [Central Space]        │
│  Solo muestra    Mesas o Pedidos        │
│  Mesas y Pedidos                        │
└──────────────────────────────────────────┘
      │ Click en "📋 Mesas"
      ▼
┌──────────────────────────────────────────┐
│          PANEL DE MESAS                  │
│          (Mesero view)                   │
│                                          │
│  Mesas asignadas:                       │
│  ├─ Mesa 1: Disponible                  │
│  ├─ Mesa 3: Ocupada                     │
│  ├─ Mesa 5: Requiere limpieza           │
│  └─ Mesa 7: Con orden pendiente         │
│                                          │
│  Solo puede:                            │
│  ✓ Ver estado de mesas                  │
│  ✓ Crear ordenes                        │
│  ✓ Procesar pagos                       │
│  ✗ Editar menú                          │
│  ✗ Gestionar empleados                  │
│  ✗ Ver reportes                         │
└──────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos: AuthContext

```
┌───────────────────────────────────────────┐
│          AuthContext.jsx                  │
│        (Estado Global)                    │
└────────────┬────────────────────────────┬─┘
             │                            │
      State: user                 State: personal
      ┌──────────▼────────┐      ┌───────▼──────────┐
      │ {                 │      │ [               │
      │   id: 123456789   │      │   {             │
      │   name: "Juan"    │      │     id: 1....   │
      │   email: "j@.."   │      │     name: "M.." │
      │   role: "admin"   │      │   },            │
      │   ...             │      │   {             │
      │ }                 │      │     id: 2....   │
      │                   │      │     ...         │
      └───────┬───────────┘      │   }             │
              │                  │ ]               │
              │                  └─────────────────┘
              │
         ┌────┴─────┬───────────┬──────────┐
         │           │           │          │
      Métodos:    login()   logout()  addEmployee()
      - login
      - logout         delete      update     get
      - addEmployee    Employee    Employee   Employee
      - updateEmployee    ByID
      - deleteEmployee
      - getEmployeeById
              │
              ▼
        ┌────────────────┐
        │ localStorage   │
        │                │
        │ axon_user      │
        │ axon_personal  │
        └────────────────┘
```

---

## 🔀 Flujo de Renderizado Condicional

```
                    ┌─────────────────┐
                    │ useAuth() hook  │
                    │                 │
                    │ { user, ... }   │
                    └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │ user?.role === ' │
                    │        admin'?    │
                    └────┬──────┬───────┘
                         ▼      ▼
                       YES      NO
                         │      │
        ┌────────────────▼┐    └────────────────┐
        │                │                      │
        ▼                ▼                      ▼
    ┌─────────┐    ┌─────────┐           ┌─────────────┐
    │ Render  │    │ Render  │           │ Hide/Disable │
    │ Admin   │    │ Mesero  │           │ Components   │
    │Options  │    │ Options │           │             │
    └─────────┘    └─────────┘           └─────────────┘
        │               │
        │     ┌─────────┴────────┐
        │     │                  │
    📖 Menú   👥 Personal        💵 Caja
    📊 Reportes


    ┌────────────────────────────────────────────┐
    │ Patrón en código:                          │
    │                                            │
    │ {user?.role === 'admin' && (               │
    │   <>                                       │
    │     <MenuSection />                        │
    │     <PersonnelSection />                   │
    │     <CashSection />                        │
    │   </>                                      │
    │ )}                                         │
    │                                            │
    └────────────────────────────────────────────┘
```

---

## 💾 Flujo de Persistencia: localStorage

```
┌──────────────────────────────────────┐
│  Usuario realiza acción              │
│  (ej: Agregar empleado)              │
└────────────┬───────────────────────┬─┘
             │                       │
      ┌──────▼──────┐          ┌─────▼───────┐
      │ State Update│          │ useEffect   │
      │ en Contexto │          │ Dispara     │
      └──────┬──────┘          └─────┬───────┘
             │                       │
      setPersonal()            localStorage
             │                 .setItem()
             │                       │
             ▼                       ▼
      ┌─────────────────────────────────────┐
      │ Datos guardados en localStorage:     │
      │                                     │
      │ axon_personal: JSON.stringify('')   │
      │ [                                   │
      │   { id: ..., name: ..., ... },    │
      │   { id: ..., name: ..., ... }     │
      │ ]                                   │
      └─────────────────────────────────────┘
             │
      ┌──────┴────────────┐
      │ Al recargar:      │
      │ 1. Lee localStorage
      │ 2. Carga en state
      │ 3. Continúa como si nada
      │                  
      └───────────────────┘
```

---

## 🎓 Flujo de Ejemplo: Agregar un Mesero

```
1. INICIO
   └─→ Admin en sección Personal
       
2. CLICK: "+ Nuevo Empleado"
   └─→ setIsFormOpen(true)
       Modal aparece

3. LLENAR FORMULARIO
   ├─→ Nombre: "Juan García"
   ├─→ Teléfono: "3101234567"
   ├─→ Email: "juan@email.com"
   ├─→ Cargo: "Mesero"
   └─→ Salario: "1000000"

4. CLICK: "Registrar"
   └─→ handleSubmit() dispara
       ├─→ Validación OK ✓
       └─→ addEmployee() del contexto

5. CONTEXTO PROCESA
   ├─→ Crea objeto con ID único
   └─→ Agrega role: "mesero"

6. GUARDAR EN STORAGE
   └─→ localStorage.setItem('axon_personal', JSON.stringify())
       Datos ahora persisten

7. UI ACTUALIZA
   ├─→ State actualizado
   ├─→ Componente re-renderiza
   ├─→ Modal se cierra
   └─→ Nueva fila en tabla

8. VERIFICACIÓN
   └─→ localStorage contiene nuevo empleado
       {
         "id": 1705000000,
         "name": "Juan García",
         "email": "juan@email.com",
         "phone": "3101234567",
         "position": "Mesero",
         "baseSalary": "1000000",
         "role": "mesero",
         "createdAt": "2024-03-02T..."
       }

9. FIN
   └─→ Empleado disponible para:
       ├─→ Ver en tabla
       ├─→ Editar
       ├─→ Eliminar
       └─→ Usar en asignaciones futuras
```

---

## 📊 Estados y Transiciones

```
┌─────────────────────────────────────┐
│    ESTADO GLOBAL DEL USUARIO        │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌────────────────┐
    │ NO AUTENTICADO │
    └────────┬───────┘
             │ Ingresa email. Usuario
             │
             ▼
    ┌────────────────────┐
    │ RELLENANDO FORMULARIO
    └────────┬───────────┘
             │ Click "Iniciar Sesión"
             │
             ▼
    ┌────────────────────┐
    │ VALIDANDO DATOS    │
    └────────┬───────────┘
             │ ✓ Válido
             │
             ▼
    ┌─────────────────────────────┐
    │ AUTENTICADO - role: admin   │
    │ O                           │
    │ AUTENTICADO - role: mesero  │
    └─────────────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
    ┌────────┐ ┌────────┐
    │Access  │ │Limited│
    │FULL    │ │Access │
    │Admin   │ │Mesero │
    │View    │ │View   │
    └────┬───┘ └───┬────┘
         │         │
         │ onClick: "Cerrar Sesión"
         │         │
         └─────┬───┘
              │
              ▼
        ┌────────────────┐
        │ NO AUTENTICADO │
        └────────────────┘
```

---

## 🔍 Matriz de Permisos

```
┌──────────────────┬───────────┬────────┐
│  FUNCIONALIDAD   │   ADMIN   │ MESERO │
├──────────────────┼───────────┼────────┤
│ Ver Mesas        │     ✅    │   ✅   │
│ Crear Orden      │     ✅    │   ✅   │
│ Procesar Pago    │     ✅    │   ✅   │
├──────────────────┼───────────┼────────┤
│ Editar Menú      │     ✅    │   ❌   │
│ Agregar Producto │     ✅    │   ❌   │
│ Eliminar Producto│     ✅    │   ❌   │
├──────────────────┼───────────┼────────┤
│ Ver Personal     │     ✅    │   ❌   │
│ Agregar Empleado │     ✅    │   ❌   │
│ Editar Empleado  │     ✅    │   ❌   │
│ Eliminar Empleado│     ✅    │   ❌   │
├──────────────────┼───────────┼────────┤
│ Ver Caja         │     ✅    │   ❌   │
│ Reportes         │     ✅    │   ❌   │
│ Cerrar Caja      │     ✅    │   ❌   │
└──────────────────┴───────────┴────────┘
```

---

**Versión:** 3.0  
**Tipo:** Mapa Visual  
**Última actualización:** Marzo 2, 2024
