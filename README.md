# GastroFlow Manager

Sistema integral de gestión de inventario para restaurantes y negocios gastronómicos.

## 📋 Descripción

GastroFlow Manager es una aplicación web progresiva (PWA) diseñada para facilitar la gestión completa de inventario en restaurantes y negocios gastronómicos. Ofrece una interfaz moderna, intuitiva y funcional para controlar productos, ubicaciones, movimientos, reportes y configuraciones del sistema.

## ✨ Características Principales

### 📊 Dashboard Interactivo

- Visualización de métricas clave en tiempo real
- KPIs de inventario y movimientos
- Gráficos de tendencias y estadísticas
- Últimos movimientos de inventario
- Alertas de stock bajo

### 📦 Gestión de Inventario

- **Inventario General**: Catálogo maestro de productos
- **Inventario Detallado**: Control por ubicación/negocio
- Vista de tabla y tarjetas con imágenes
- Búsqueda y filtrado avanzado
- Categorización de productos
- Control de stock mínimo
- Estados de productos (Disponible, Stock Bajo, Agotado)
- Gestión de precios en múltiples monedas (USD/VES)

### 🔄 Control de Movimientos

- Registro de entradas y salidas
- Transferencias entre ubicaciones
- Ajustes de inventario
- Historial completo de movimientos
- Filtrado por tipo, fecha y ubicación

### 📍 Gestión de Ubicaciones

- Múltiples negocios/ubicaciones
- Inventario independiente por ubicación
- Transferencias entre ubicaciones

### 📈 Reportes y Análisis

- Estadísticas de inventario
- Análisis de movimientos
- Reportes personalizables
- Exportación de datos (CSV/Excel)

### 🔔 Sistema de Notificaciones

- Alertas en tiempo real
- Notificaciones de stock bajo
- Historial de notificaciones
- Panel de notificaciones interactivo

### ⚙️ Configuración

- Información del negocio
- Perfil de usuario con avatar
- Preferencias de notificaciones
- **Exportación de datos** (CSV y Excel)
- Temas claro/oscuro
- Configuración de moneda y zona horaria

### 💱 Gestión de Divisas

- Soporte para USD y VES (Bolívares)
- Tasas de cambio en tiempo real (BCV y Paralelo)
- Conversión automática de precios

## 🚀 Tecnologías

### Frontend

- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Notifications**: Sonner (Toast)

### Backend & Database

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (para imágenes)
- **Real-time**: Supabase Realtime

### Exportación de Datos

- **Excel**: xlsx
- **CSV**: papaparse

### PWA

- **Service Worker**: Vite PWA Plugin
- **Manifest**: Configuración PWA completa
- **Offline Support**: Cache de recursos

## 📦 Instalación

### Requisitos previos

- Node.js 18+ y npm instalados
- Git
- Cuenta de Supabase (para base de datos)

### Pasos de instalación

```sh
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Navegar al directorio del proyecto
cd gastroflow-manager

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con las credenciales de Supabase
# VITE_SUPABASE_URL=tu_url
# VITE_SUPABASE_ANON_KEY=tu_key

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 🏗️ Scripts Disponibles

```sh
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## 📱 Instalación como PWA

1. Abre la aplicación en tu navegador móvil (Chrome/Safari)
2. Busca la opción "Agregar a pantalla de inicio" o "Instalar app"
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio como aplicación nativa

## 🗄️ Estructura de Base de Datos

### Tablas Principales

- `inventario_general`: Catálogo maestro de productos
- `inventario_detallado`: Productos por ubicación
- `movimientos`: Historial de entradas/salidas
- `negocios`: Ubicaciones/sucursales
- `notificaciones`: Sistema de alertas
- `configuraciones`: Preferencias del sistema
- `usuarios`: Gestión de usuarios

## 🎨 Características de UI/UX

- Sidebar colapsable con iconos y tooltips
- Notificaciones con panel dropdown
- Cards de productos con imágenes
- Menús contextuales para acciones rápidas
- Animaciones suaves de transición de página
- Footer con información de copyright
- Diseño totalmente responsivo
- Modo oscuro/claro con transiciones suaves
- Formularios con validación en tiempo real
- Confirmaciones de acciones destructivas

## 📤 Exportación de Datos

La aplicación permite exportar todos los datos del sistema en dos formatos:

### CSV

- Exporta el inventario general
- Formato compatible con Excel y Google Sheets

### Excel (.xlsx)

- Archivo con múltiples hojas:
  - Inventario General
  - Inventario Detallado
  - Movimientos
  - Negocios
- Datos sanitizados automáticamente
- Compatible con Microsoft Excel y LibreOffice

## 👨‍💻 Autor

**Julian Herrera** - Todos los derechos reservados © 2025

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 🔧 Configuración del Sistema

### Tema

- Color principal: `#22c55e` (Verde)
- Tipografía: Inter (Google Fonts)
- Breakpoints responsivos de Tailwind CSS

### Moneda

- USD (Dólar estadounidense)
- VES (Bolívar venezolano)
- Actualización automática de tasas de cambio

### Notificaciones

- Alertas de stock bajo
- Resumen diario de ventas
- Movimientos de inventario
- Productos por vencer

## 🔐 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) en base de datos
- Validación de datos en cliente y servidor
- Sanitización de datos para exportación

## 📞 Soporte

Para soporte o consultas, contacta al desarrollador.

## 🚧 Roadmap

- [ ] Módulo de ventas
- [ ] Gestión de proveedores
- [ ] Órdenes de compra
- [ ] Códigos de barras/QR
- [ ] Reportes avanzados con gráficos
- [ ] Integración con sistemas de punto de venta
- [ ] API REST para integraciones
- [ ] Aplicación móvil nativa
