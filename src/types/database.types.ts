// Tipos de base de datos generados desde el schema
// Todos los nombres están en español para coincidir con la base de datos

export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  contraseña_hash: string;
  rol: 'administrador' | 'gerente' | 'empleado';
  telefono?: string;
  avatar_url?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  ultimo_acceso?: string;
}

export interface Negocio {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface InventarioGeneral {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stock: number;
  stock_minimo: number;
  precio: number;
  estado: 'disponible' | 'bajo' | 'medio' | 'agotado';
  imagen_url?: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface InventarioDetallado {
  id: string;
  negocio_id: string;
  producto_general_id?: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stock: number;
  stock_minimo: number;
  precio: number;
  estado: 'disponible' | 'bajo' | 'medio' | 'agotado';
  imagen_url?: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Movimiento {
  id: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  producto_id: string;
  tipo_inventario: 'general' | 'detallado';
  negocio_id?: string;
  cantidad: number;
  unidad: string;
  precio_unitario?: number;
  total?: number;
  motivo?: string;
  usuario_id?: string;
  referencia?: string;
  fecha_movimiento: string;
  notas?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  razon_social?: string;
  rif?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contacto_principal?: string;
  telefono_contacto?: string;
  notas?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Compra {
  id: string;
  numero_compra: string;
  proveedor_id?: string;
  negocio_id?: string;
  fecha_compra: string;
  subtotal: number;
  impuesto: number;
  total: number;
  moneda: string;
  tasa_cambio?: number;
  estado: 'pendiente' | 'recibida' | 'parcial' | 'cancelada';
  usuario_id?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DetalleCompra {
  id: string;
  compra_id: string;
  producto_id?: string;
  nombre_producto: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  impuesto: number;
  total: number;
}

export interface Configuracion {
  id: string;
  clave: string;
  valor?: string;
  tipo: 'texto' | 'numero' | 'booleano' | 'json';
  descripcion?: string;
  categoria?: string;
  fecha_actualizacion: string;
}

export interface Notificacion {
  id: string;
  usuario_id?: string;
  tipo: 'info' | 'advertencia' | 'error' | 'exito';
  titulo: string;
  mensaje: string;
  leida: boolean;
  url_accion?: string;
  fecha_creacion: string;
  fecha_lectura?: string;
}

export interface Auditoria {
  id: string;
  usuario_id?: string;
  accion: string;
  tabla: string;
  registro_id?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  ip_address?: string;
  user_agent?: string;
  fecha_accion: string;
}

// Tipos para inserciones (sin campos auto-generados)
export type InsertUsuario = Omit<Usuario, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertNegocio = Omit<Negocio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertInventarioGeneral = Omit<InventarioGeneral, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertInventarioDetallado = Omit<InventarioDetallado, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertMovimiento = Omit<Movimiento, 'id' | 'fecha_movimiento'>;
export type InsertCategoria = Omit<Categoria, 'id' | 'fecha_creacion'>;
export type InsertProveedor = Omit<Proveedor, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertCompra = Omit<Compra, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type InsertDetalleCompra = Omit<DetalleCompra, 'id'>;
export type InsertConfiguracion = Omit<Configuracion, 'id' | 'fecha_actualizacion'>;
export type InsertNotificacion = Omit<Notificacion, 'id' | 'fecha_creacion'>;
export type InsertAuditoria = Omit<Auditoria, 'id' | 'fecha_accion'>;

// Tipos para actualizaciones (todos los campos opcionales excepto id)
export type UpdateUsuario = Partial<Omit<Usuario, 'id' | 'fecha_creacion'>>;
export type UpdateNegocio = Partial<Omit<Negocio, 'id' | 'fecha_creacion'>>;
export type UpdateInventarioGeneral = Partial<Omit<InventarioGeneral, 'id' | 'fecha_creacion'>>;
export type UpdateInventarioDetallado = Partial<Omit<InventarioDetallado, 'id' | 'fecha_creacion'>>;
export type UpdateProveedor = Partial<Omit<Proveedor, 'id' | 'fecha_creacion'>>;
export type UpdateCompra = Partial<Omit<Compra, 'id' | 'fecha_creacion'>>;
export type UpdateConfiguracion = Partial<Omit<Configuracion, 'id'>>;

// Tipo para la base de datos completa
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: InsertUsuario;
        Update: UpdateUsuario;
      };
      negocios: {
        Row: Negocio;
        Insert: InsertNegocio;
        Update: UpdateNegocio;
      };
      inventario_general: {
        Row: InventarioGeneral;
        Insert: InsertInventarioGeneral;
        Update: UpdateInventarioGeneral;
      };
      inventario_detallado: {
        Row: InventarioDetallado;
        Insert: InsertInventarioDetallado;
        Update: UpdateInventarioDetallado;
      };
      movimientos: {
        Row: Movimiento;
        Insert: InsertMovimiento;
        Update: Partial<Movimiento>;
      };
      categorias: {
        Row: Categoria;
        Insert: InsertCategoria;
        Update: Partial<Categoria>;
      };
      proveedores: {
        Row: Proveedor;
        Insert: InsertProveedor;
        Update: UpdateProveedor;
      };
      compras: {
        Row: Compra;
        Insert: InsertCompra;
        Update: UpdateCompra;
      };
      detalle_compras: {
        Row: DetalleCompra;
        Insert: InsertDetalleCompra;
        Update: Partial<DetalleCompra>;
      };
      configuracion: {
        Row: Configuracion;
        Insert: InsertConfiguracion;
        Update: UpdateConfiguracion;
      };
      notificaciones: {
        Row: Notificacion;
        Insert: InsertNotificacion;
        Update: Partial<Notificacion>;
      };
      auditoria: {
        Row: Auditoria;
        Insert: InsertAuditoria;
        Update: never; // La auditoría no se actualiza
      };
    };
  };
}
