# Estructura del Proyecto Admin Panel

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     AdminPanel.jsx                       │
│  (Componente Principal - Orquestador)                   │
│                                                          │
│  • Gestiona estado de tabs                              │
│  • Controla navegación                                  │
│  • Distribuye datos a tabs                              │
└───────────────┬───────────────┬────────────────────────┘
                │               │
    ┌───────────┴───────┐       └──────────────┐
    │                   │                       │
┌───▼────┐      ┌──────▼──────┐       ┌───────▼────────┐
│ Header │      │  TabButtons │       │   Tab Content  │
│        │      │             │       │                │
│ Admin  │      │ • Dashboard │       │ • DashboardTab │
│ Header │      │ • Empresas  │       │ • EmpresasTab  │
│        │      │ • Reservas  │       │ • ReservasTab  │
│ • Home │      │ • Usuarios  │       │ • UsuariosTab  │
│ • Logout      │ • Config    │       │ • ConfigTab    │
└────────┘      └─────────────┘       └────────────────┘
```

## 🔄 Flujo de Datos

```
                    ┌──────────────┐
                    │   Supabase   │
                    │   Database   │
                    └───────┬──────┘
                            │
                    ┌───────▼────────┐
                    │ useAdminStats  │
                    │     Hook       │
                    │                │
                    │ • loadData()   │
                    │ • stats        │
                    │ • empresas     │
                    │ • reservas     │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  AdminPanel    │
                    └───────┬────────┘
                            │
        ┌──────────┬────────┼────────┬──────────┐
        │          │        │        │          │
    ┌───▼───┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌────▼────┐
    │Dashboard│ │Empresas│ │Reservas│ │Usuarios│ │Config│
    └─────────┘ └───────┘ └───────┘ └───────┘ └────────┘
```

## 📦 Importaciones y Exports

### components/index.js
```javascript
export { AdminHeader }
export { TabButton }
export { StatCard }
export { LoadingScreen }
```

### tabs/index.js
```javascript
export { DashboardTab }
export { EmpresasTab }
export { ReservasTab }
export { UsuariosTab }
export { ConfiguracionTab }
```

### hooks/index.js
```javascript
export { useAdminAccess }
export { useAdminStats }
```

## 🎨 Componentes Visuales

### StatCard (8 variantes de color)
```
┌─────────────────────┐
│ 📊 Total Empresas   │
│                     │
│      150           🏢│
│                     │
└─────────────────────┘
```

### TabButton (activo/inactivo)
```
Activo:   [🎯 Dashboard]  ← bg-[#2C3A61] text-white
Inactivo: [ Empresas  ]   ← bg-white text-gray-700
```

## 📋 Props de Componentes

### AdminHeader
```typescript
interface AdminHeaderProps {
  onNavigateHome: () => void;
  onLogout: () => void;
}
```

### TabButton
```typescript
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}
```

### StatCard
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'indigo' | 'emerald';
}
```

### DashboardTab
```typescript
interface DashboardTabProps {
  stats: {
    totalEmpresas: number;
    totalSedes: number;
    totalMiniBodegas: number;
    totalReservas: number;
    reservasPendientes: number;
    reservasAceptadas: number;
    totalUsuarios: number;
    ingresosMensuales: number;
  };
  empresas: Empresa[];
  reservas: Reserva[];
}
```

## 🛠️ Funciones Principales

### useAdminStats Hook
```javascript
// Carga inicial de datos
useEffect(() => {
  loadData();
}, []);

// Función de refresh manual
const handleRefresh = () => {
  loadData();
};
```

### AdminPanel Navigation
```javascript
const [activeTab, setActiveTab] = useState('dashboard');

// Cambio de tab
setActiveTab('empresas');
```

## 🎯 Casos de Uso

1. **Ver estadísticas**: Usuario accede → Dashboard muestra stats
2. **Gestionar empresas**: Usuario → Tab Empresas → Ver/Editar
3. **Revisar reservas**: Usuario → Tab Reservas → Ver estados
4. **Actualizar datos**: Usuario → Botón Actualizar → loadData()
5. **Cerrar sesión**: Usuario → Logout → signOut() → navigate('/')
