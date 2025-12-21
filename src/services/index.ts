// Exportar todos los servicios desde un solo lugar
export * from './configuracion.service';
export * from './inventario-general.service';
export * from './inventario-detallado.service';
export * from './movimientos.service';
export * from './negocios.service';
export * from './auth.service';
export { movimientosService } from './movimientos.service';
export { negociosService } from './negocios.service';

// Re-exportar tipos
export type * from '@/types/database.types';
