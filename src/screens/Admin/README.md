# Panel de Administración - Estructura Modular

## 📁 Estructura de Carpetas

```
Admin/
├── AdminPanel.jsx           # Componente principal
├── components/              # Componentes reutilizables
│   ├── AdminHeader.jsx     # Header con navegación y logout
│   ├── TabButton.jsx       # Botones de navegación entre tabs
│   ├── StatCard.jsx        # Tarjetas de estadísticas
│   ├── LoadingScreen.jsx   # Pantalla de carga
│   └── index.js            # Barrel exports
├── tabs/                   # Componentes de contenido por tab
│   ├── DashboardTab.jsx    # Vista principal con estadísticas
│   ├── EmpresasTab.jsx     # Gestión de empresas
│   ├── ReservasTab.jsx     # Gestión de reservas
│   ├── UsuariosTab.jsx     # Gestión de usuarios
│   ├── ConfiguracionTab.jsx # Configuración del sistema
│   └── index.js            # Barrel exports
└── hooks/                  # Custom hooks
    ├── useAdminAccess.js   # Verificación de permisos
    ├── useAdminStats.js    # Carga de estadísticas
    └── index.js            # Barrel exports
```

## 🎯 Componentes

### AdminHeader
Header sticky con navegación y acciones principales.
```jsx
<AdminHeader 
  onNavigateHome={() => {}} 
  onLogout={() => {}} 
/>
```

### TabButton
Botón reutilizable para navegación entre tabs.
```jsx
<TabButton
  active={true}
  onClick={() => {}}
  icon={<Icon />}
  label="Tab Name"
/>
```

### StatCard
Tarjeta de estadísticas con iconos y colores personalizables.
```jsx
<StatCard
  title="Total Empresas"
  value={100}
  icon={<Building2 />}
  color="blue" // blue, green, purple, orange, yellow, indigo, emerald
/>
```

### LoadingScreen
Pantalla de carga mientras se verifican permisos.
```jsx
<LoadingScreen />
```

## 📊 Tabs

### DashboardTab
Vista principal con estadísticas generales y datos recientes.
- Muestra 8 tarjetas de estadísticas
- Lista de empresas recientes
- Lista de reservas recientes

### EmpresasTab
Gestión de empresas con tabla de datos.
- Nombre, ciudad, sedes, bodegas
- Botón de actualizar
- Tabla responsive

### ReservasTab
Gestión de reservas con estados.
- ID, documento, estado, fecha
- Estados con colores (pendiente, aceptada, rechazada)
- Botón de actualizar

### UsuariosTab
Administración de usuarios y roles.
- Lista de usuarios con email y rol
- Placeholder para funcionalidad futura

### ConfiguracionTab
Configuración del sistema.
- Configuraciones generales
- Notificaciones
- Seguridad

## 🎣 Hooks

### useAdminStats
Hook personalizado para cargar y gestionar estadísticas.
```jsx
const { stats, empresas, reservasRecientes, loading, loadData } = useAdminStats();
```

**Retorna:**
- `stats`: Objeto con todas las estadísticas
- `empresas`: Array de empresas recientes
- `reservasRecientes`: Array de reservas recientes
- `loading`: Estado de carga
- `loadData`: Función para refrescar datos

### useAdminAccess
Hook para verificar permisos de administrador.
```jsx
useAdminAccess(user);
```

**Funcionalidad:**
- Verifica si el usuario tiene rol 'admin'
- Redirige a home si no tiene permisos
- Muestra alertas informativas

## 🔄 Flujo de Datos

1. **AdminPanel** monta y llama `useAdminStats()`
2. Hook verifica usuario y carga datos de Supabase
3. Datos se distribuyen a los tabs correspondientes
4. Tabs renderizan la información con componentes reutilizables

## 🎨 Mejores Prácticas Aplicadas

✅ **Separación de Responsabilidades**: Cada componente tiene un propósito único
✅ **Reutilización**: Componentes como StatCard y TabButton son reutilizables
✅ **Hooks Personalizados**: Lógica compleja extraída a hooks
✅ **Barrel Exports**: Importaciones limpias con index.js
✅ **Props Bien Definidas**: Cada componente recibe props específicas
✅ **Estilos Consistentes**: Uso de Tailwind con colores del tema

## 🚀 Uso

```jsx
import { AdminPanel } from './screens/Admin/AdminPanel';

function App() {
  return <AdminPanel />;
}
```

## 📝 Notas

- Todos los componentes usan Tailwind CSS
- Los iconos provienen de `lucide-react`
- La autenticación se maneja con el contexto `AuthContext`
- Los datos se cargan desde Supabase
- El tema principal usa el color `#2C3A61`
