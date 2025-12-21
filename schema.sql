-- =====================================================
-- SCHEMA DE BASE DE DATOS - GASTROFLOW MANAGER
-- Sistema de Gestión de Inventario para Restaurantes
-- Todos los campos están en español para mejor comprensión
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: usuarios
-- Descripción: Almacena información de usuarios del sistema
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'gerente', 'empleado')),
    telefono VARCHAR(20),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =====================================================
-- TABLA: negocios
-- Descripción: Almacena las diferentes ubicaciones/negocios
-- =====================================================
CREATE TABLE negocios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: inventario_general
-- Descripción: Inventario centralizado de productos
-- =====================================================
CREATE TABLE inventario_general (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad VARCHAR(50) NOT NULL DEFAULT 'Unidades',
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    precio DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'bajo', 'medio', 'agotado')),
    imagen_url TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inventario_general
CREATE INDEX idx_inventario_general_categoria ON inventario_general(categoria);
CREATE INDEX idx_inventario_general_estado ON inventario_general(estado);
CREATE INDEX idx_inventario_general_nombre ON inventario_general(nombre);

-- =====================================================
-- TABLA: inventario_detallado
-- Descripción: Inventario específico por negocio/ubicación
-- =====================================================
CREATE TABLE inventario_detallado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    producto_general_id UUID REFERENCES inventario_general(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad VARCHAR(50) NOT NULL DEFAULT 'Unidades',
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    precio DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'bajo', 'medio', 'agotado')),
    imagen_url TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inventario_detallado
CREATE INDEX idx_inventario_detallado_negocio ON inventario_detallado(negocio_id);
CREATE INDEX idx_inventario_detallado_producto_general ON inventario_detallado(producto_general_id);
CREATE INDEX idx_inventario_detallado_categoria ON inventario_detallado(categoria);
CREATE INDEX idx_inventario_detallado_estado ON inventario_detallado(estado);

-- =====================================================
-- TABLA: movimientos
-- Descripción: Registro de entradas y salidas de inventario
-- =====================================================
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'transferencia')),
    producto_id UUID NOT NULL,
    tipo_inventario VARCHAR(50) NOT NULL CHECK (tipo_inventario IN ('general', 'detallado')),
    negocio_id UUID REFERENCES negocios(id) ON DELETE SET NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    precio_unitario DECIMAL(10, 2),
    total DECIMAL(10, 2),
    motivo TEXT,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    referencia VARCHAR(100),
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Índices para movimientos
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_producto ON movimientos(producto_id);
CREATE INDEX idx_movimientos_negocio ON movimientos(negocio_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha_movimiento DESC);
CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);

-- =====================================================
-- TABLA: categorias
-- Descripción: Catálogo de categorías de productos
-- =====================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(7), -- Código hexadecimal de color
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: proveedores
-- Descripción: Información de proveedores
-- =====================================================
CREATE TABLE proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    rif VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    contacto_principal VARCHAR(255),
    telefono_contacto VARCHAR(20),
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: compras
-- Descripción: Registro de compras a proveedores
-- =====================================================
CREATE TABLE compras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_compra VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    negocio_id UUID REFERENCES negocios(id) ON DELETE SET NULL,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    moneda VARCHAR(10) DEFAULT 'USD',
    tasa_cambio DECIMAL(10, 4),
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'parcial', 'cancelada')),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para compras
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_negocio ON compras(negocio_id);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra DESC);
CREATE INDEX idx_compras_estado ON compras(estado);

-- =====================================================
-- TABLA: detalle_compras
-- Descripción: Detalle de productos en cada compra
-- =====================================================
CREATE TABLE detalle_compras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES inventario_general(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL
);

-- Índices para detalle_compras
CREATE INDEX idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(producto_id);

-- =====================================================
-- TABLA: configuracion
-- Descripción: Configuración general del sistema
-- =====================================================
CREATE TABLE configuracion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'texto' CHECK (tipo IN ('texto', 'numero', 'booleano', 'json')),
    descripcion TEXT,
    categoria VARCHAR(100),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones iniciales
INSERT INTO configuracion (clave, valor, tipo, descripcion, categoria) VALUES
('moneda_principal', 'USD', 'texto', 'Moneda principal del sistema', 'general'),
('moneda_secundaria', 'VES', 'texto', 'Moneda secundaria del sistema', 'general'),
('tasa_cambio_bcv', '50.00', 'numero', 'Tasa de cambio BCV actual', 'general'),
('iva_porcentaje', '16', 'numero', 'Porcentaje de IVA', 'impuestos'),
('zona_horaria', 'America/Caracas', 'texto', 'Zona horaria del sistema', 'general'),
('idioma', 'es', 'texto', 'Idioma del sistema', 'general');

-- =====================================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- =====================================================
-- Este usuario se crea automáticamente para facilitar el acceso inicial
-- Email: admin@gastroflow.com
-- En modo desarrollo (DEV_MODE = true), la contraseña no se verifica
-- IMPORTANTE: Cambiar email y datos en producción

INSERT INTO usuarios (
    nombre_completo,
    email,
    contraseña_hash,
    rol,
    telefono,
    activo
) VALUES (
    'Administrador del Sistema',
    'admin@gastroflow.com',
    'dev_mode_no_password',
    'administrador',
    '+58 424-0000000',
    true
);

-- Usuario adicional de ejemplo (OPCIONAL - Eliminar en producción)
INSERT INTO usuarios (
    nombre_completo,
    email,
    contraseña_hash,
    rol,
    telefono,
    activo
) VALUES (
    'Saviel Julian Isculpi Herrera',
    'saviel.dev@gmail.com',
    'dev_mode_no_password',
    'administrador',
    '+58 424-1234567',
    true
);


-- =====================================================
-- TABLA: notificaciones
-- Descripción: Sistema de notificaciones para usuarios
-- =====================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('info', 'advertencia', 'error', 'exito')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    url_accion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP WITH TIME ZONE
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(fecha_creacion DESC);

-- =====================================================
-- TABLA: auditoria
-- Descripción: Registro de auditoría de acciones importantes
-- =====================================================
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla VARCHAR(100) NOT NULL,
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para auditoria
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_accion DESC);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_negocios_actualizacion
    BEFORE UPDATE ON negocios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_inventario_general_actualizacion
    BEFORE UPDATE ON inventario_general
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_inventario_detallado_actualizacion
    BEFORE UPDATE ON inventario_detallado
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_proveedores_actualizacion
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_compras_actualizacion
    BEFORE UPDATE ON compras
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función para actualizar el estado del inventario basado en stock
CREATE OR REPLACE FUNCTION actualizar_estado_inventario()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= 0 THEN
        NEW.estado = 'agotado';
    ELSIF NEW.stock <= NEW.stock_minimo THEN
        NEW.estado = 'bajo';
    ELSIF NEW.stock <= (NEW.stock_minimo * 2) THEN
        NEW.estado = 'medio';
    ELSE
        NEW.estado = 'disponible';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar estado automáticamente
CREATE TRIGGER trigger_estado_inventario_general
    BEFORE INSERT OR UPDATE OF stock, stock_minimo ON inventario_general
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_inventario();

CREATE TRIGGER trigger_estado_inventario_detallado
    BEFORE INSERT OR UPDATE OF stock, stock_minimo ON inventario_detallado
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_inventario();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Productos con bajo stock en inventario general
CREATE OR REPLACE VIEW vista_productos_bajo_stock AS
SELECT 
    id,
    nombre,
    categoria,
    stock,
    stock_minimo,
    unidad,
    estado,
    ROUND((stock / NULLIF(stock_minimo, 0)) * 100, 2) as porcentaje_stock
FROM inventario_general
WHERE estado IN ('bajo', 'agotado') AND activo = true
ORDER BY porcentaje_stock ASC;

-- Vista: Resumen de inventario por categoría
CREATE OR REPLACE VIEW vista_resumen_por_categoria AS
SELECT 
    categoria,
    COUNT(*) as total_productos,
    SUM(stock) as stock_total,
    SUM(stock * precio) as valor_total,
    COUNT(CASE WHEN estado = 'bajo' THEN 1 END) as productos_bajo_stock,
    COUNT(CASE WHEN estado = 'agotado' THEN 1 END) as productos_agotados
FROM inventario_general
WHERE activo = true
GROUP BY categoria
ORDER BY valor_total DESC;

-- Vista: Movimientos recientes (últimos 30 días)
CREATE OR REPLACE VIEW vista_movimientos_recientes AS
SELECT 
    m.id,
    m.tipo,
    m.tipo_inventario,
    m.cantidad,
    m.unidad,
    m.fecha_movimiento,
    m.motivo,
    u.nombre_completo as usuario,
    n.nombre as negocio,
    CASE 
        WHEN m.tipo_inventario = 'general' THEN ig.nombre
        WHEN m.tipo_inventario = 'detallado' THEN id_tabla.nombre
    END as producto_nombre
FROM movimientos m
LEFT JOIN usuarios u ON m.usuario_id = u.id
LEFT JOIN negocios n ON m.negocio_id = n.id
LEFT JOIN inventario_general ig ON m.producto_id = ig.id AND m.tipo_inventario = 'general'
LEFT JOIN inventario_detallado id_tabla ON m.producto_id = id_tabla.id AND m.tipo_inventario = 'detallado'
WHERE m.fecha_movimiento >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY m.fecha_movimiento DESC;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Almacena la información de los usuarios del sistema con sus roles y permisos';
COMMENT ON TABLE negocios IS 'Diferentes ubicaciones o sucursales del negocio';
COMMENT ON TABLE inventario_general IS 'Inventario centralizado de todos los productos disponibles';
COMMENT ON TABLE inventario_detallado IS 'Inventario específico por ubicación/negocio';
COMMENT ON TABLE movimientos IS 'Registro histórico de todas las entradas y salidas de inventario';
COMMENT ON TABLE categorias IS 'Catálogo de categorías para clasificar productos';
COMMENT ON TABLE proveedores IS 'Información de contacto y datos de proveedores';
COMMENT ON TABLE compras IS 'Registro de órdenes de compra a proveedores';
COMMENT ON TABLE detalle_compras IS 'Detalle de productos incluidos en cada compra';
COMMENT ON TABLE configuracion IS 'Configuraciones generales del sistema';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones para alertar a usuarios';
COMMENT ON TABLE auditoria IS 'Registro de auditoría para rastrear cambios importantes';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
