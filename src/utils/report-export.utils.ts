import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ReportData, ReportPeriod } from '@/contexts/ReportsContext';
import type { Product } from '@/contexts/ProductContext';
import type { Movement } from '@/contexts/MovementsContext';

// Función helper para obtener nombre del período en español
const getPeriodName = (period: ReportPeriod): string => {
  const names: Record<ReportPeriod, string> = {
    daily: 'Diario (24 horas)',
    weekly: 'Semanal (7 días)',
    biweekly: 'Quincenal (15 días)',
    monthly: 'Mensual (30 días)',
    quarterly: 'Trimestral (90 días)',
    annual: 'Anual (365 días)',
  };
  return names[period];
};

// Función helper para formatear moneda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
  }).format(value);
};

// Función helper para formatear fecha y hora
const formatDateTime = (): string => {
  return new Date().toLocaleString('es-VE', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

/**
 * Genera un reporte en formato PDF profesional
 */
export const generatePDFReport = async (
  reportData: ReportData,
  period: ReportPeriod
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado del documento
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Inventario', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${getPeriodName(period)}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${formatDateTime()}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(0);

  // Sección de KPIs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicadores Clave (KPIs)', 14, yPosition);
  yPosition += 8;

  const kpiData = [
    ['Métrica', 'Valor'],
    ['Valor Total del Inventario', formatCurrency(reportData.kpis.inventoryValue)],
    ['Pérdidas del Período', formatCurrency(reportData.kpis.periodLosses)],
    ['Productos Activos', reportData.kpis.activeProducts.toString()],
    ['Alertas de Stock', reportData.kpis.stockAlerts.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [34, 34, 34], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Sección de Distribución de Movimientos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribución de Movimientos', 14, yPosition);
  yPosition += 8;

  const distributionData = reportData.movementDistribution.map(item => [
    item.name,
    `${item.value}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Tipo de Movimiento', 'Porcentaje']],
    body: distributionData,
    theme: 'striped',
    headStyles: { fillColor: [34, 34, 34], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Sección de Top Productos
  if (reportData.topProducts.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Productos del Período', 14, yPosition);
    yPosition += 8;

    const topProductsData = reportData.topProducts.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.ventas.toString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Producto', 'Unidades Movidas']],
      body: topProductsData,
      theme: 'striped',
      headStyles: { fillColor: [34, 34, 34], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Sección de Stock Crítico
  if (reportData.criticalStock.length > 0) {
    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Alertas de Stock Crítico', 14, yPosition);
    yPosition += 8;

    const criticalStockData = reportData.criticalStock.map(item => [
      item.name,
      `${item.stock} ${item.unit}`,
      item.status === 'out' ? 'Agotado' : 'Bajo',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Producto', 'Stock Actual', 'Estado']],
      body: criticalStockData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        2: { 
          halign: 'center',
          fontStyle: 'bold',
          textColor: [239, 68, 68],
        },
      },
    });
  }

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar el PDF
  const fileName = `Reporte_${period}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Genera un reporte en formato Excel (.xlsx)
 */
export const generateExcelReport = async (
  reportData: ReportData,
  period: ReportPeriod,
  products: Product[],
  movements: Movement[]
): Promise<void> => {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: KPIs
  const kpisData = [
    ['REPORTE DE INVENTARIO'],
    [`Período: ${getPeriodName(period)}`],
    [`Generado: ${formatDateTime()}`],
    [],
    ['INDICADORES CLAVE'],
    ['Métrica', 'Valor'],
    ['Valor Total del Inventario', reportData.kpis.inventoryValue],
    ['Pérdidas del Período', reportData.kpis.periodLosses],
    ['Productos Activos', reportData.kpis.activeProducts],
    ['Alertas de Stock', reportData.kpis.stockAlerts],
    [],
    ['DISTRIBUCIÓN DE MOVIMIENTOS'],
    ['Tipo', 'Porcentaje'],
    ...reportData.movementDistribution.map(item => [item.name, `${item.value}%`]),
  ];

  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
  
  // Aplicar estilos (anchos de columna)
  kpisSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');

  // Hoja 2: Top Productos
  if (reportData.topProducts.length > 0) {
    const topProductsData = [
      ['TOP PRODUCTOS DEL PERÍODO'],
      [],
      ['#', 'Producto', 'Unidades Movidas'],
      ...reportData.topProducts.map((item, index) => [
        index + 1,
        item.name,
        item.ventas,
      ]),
    ];

    const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
    topProductsSheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Productos');
  }

  // Hoja 3: Stock Crítico
  if (reportData.criticalStock.length > 0) {
    const criticalStockData = [
      ['ALERTAS DE STOCK CRÍTICO'],
      [],
      ['Producto', 'Stock Actual', 'Unidad', 'Estado'],
      ...reportData.criticalStock.map(item => [
        item.name,
        item.stock,
        item.unit,
        item.status === 'out' ? 'Agotado' : 'Bajo',
      ]),
    ];

    const criticalStockSheet = XLSX.utils.aoa_to_sheet(criticalStockData);
    criticalStockSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, criticalStockSheet, 'Stock Crítico');
  }

  // Hoja 4: Todos los Productos
  const allProductsData = [
    ['INVENTARIO COMPLETO'],
    [],
    ['ID', 'Nombre', 'Categoría', 'Stock', 'Unidad', 'Precio', 'Stock Mínimo', 'Estado'],
    ...products.map(p => [
      p.id,
      p.name,
      p.category,
      p.stock,
      p.unit,
      p.price,
      p.minStock,
      p.status,
    ]),
  ];

  const allProductsSheet = XLSX.utils.aoa_to_sheet(allProductsData);
  allProductsSheet['!cols'] = [
    { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 10 }, 
    { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, allProductsSheet, 'Inventario Completo');

  // Guardar el archivo
  const fileName = `Reporte_${period}_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Genera un reporte en formato CSV
 */
export const generateCSVReport = async (
  reportData: ReportData,
  period: ReportPeriod,
  movements: Movement[]
): Promise<void> => {
  // Crear CSV con KPIs, distribución y movimientos
  let csvContent = 'REPORTE DE INVENTARIO\n';
  csvContent += `Período,${getPeriodName(period)}\n`;
  csvContent += `Generado,${formatDateTime()}\n`;
  csvContent += '\n';

  // KPIs
  csvContent += 'INDICADORES CLAVE\n';
  csvContent += 'Métrica,Valor\n';
  csvContent += `Valor Total del Inventario,${reportData.kpis.inventoryValue}\n`;
  csvContent += `Pérdidas del Período,${reportData.kpis.periodLosses}\n`;
  csvContent += `Productos Activos,${reportData.kpis.activeProducts}\n`;
  csvContent += `Alertas de Stock,${reportData.kpis.stockAlerts}\n`;
  csvContent += '\n';

  // Distribución
  csvContent += 'DISTRIBUCIÓN DE MOVIMIENTOS\n';
  csvContent += 'Tipo,Porcentaje\n';
  reportData.movementDistribution.forEach(item => {
    csvContent += `${item.name},${item.value}%\n`;
  });
  csvContent += '\n';

  // Top Productos
  if (reportData.topProducts.length > 0) {
    csvContent += 'TOP PRODUCTOS\n';
    csvContent += '#,Producto,Unidades Movidas\n';
    reportData.topProducts.forEach((item, index) => {
      csvContent += `${index + 1},${item.name},${item.ventas}\n`;
    });
    csvContent += '\n';
  }

  // Stock Crítico
  if (reportData.criticalStock.length > 0) {
    csvContent += 'STOCK CRÍTICO\n';
    csvContent += 'Producto,Stock,Unidad,Estado\n';
    reportData.criticalStock.forEach(item => {
      csvContent += `${item.name},${item.stock},${item.unit},${item.status === 'out' ? 'Agotado' : 'Bajo'}\n`;
    });
    csvContent += '\n';
  }

  // Movimientos recientes
  csvContent += 'MOVIMIENTOS RECIENTES\n';
  csvContent += 'Fecha,Hora,Producto,Tipo,Cantidad,Unidad,Razón,Usuario\n';
  movements.slice(0, 50).forEach(m => {
    csvContent += `${m.date},${m.time},${m.product},${m.type},${m.quantity},${m.unit},"${m.reason}",${m.user}\n`;
  });

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Reporte_${period}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Genera un reporte de lista de productos en PDF
 */
export const generateProductListPDF = async (products: Product[]): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventario General', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${formatDateTime()}`, pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`Total Productos: ${products.length}`, pageWidth / 2, yPosition + 5, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(0);

  const tableData = products.map((p, index) => [
    (index + 1).toString(),
    p.name,
    p.category,
    `${p.stock} ${p.unit}`,
    formatCurrency(p.price),
    p.status === 'out' ? 'Agotado' : p.status === 'low' ? 'Bajo' : 'Disponible'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Producto', 'Categoría', 'Stock', 'Precio', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 34, 34], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' }
    },
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `Inventario_General_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Genera un reporte de lista de productos en Excel
 */
export const generateProductListExcel = async (products: Product[]): Promise<void> => {
  const workbook = XLSX.utils.book_new();

  const data = [
    ['INVENTARIO GENERAL'],
    [`Generado: ${formatDateTime()}`],
    [],
    ['#', 'Producto', 'Categoría', 'Stock', 'Unidad', 'Precio Unitario', 'Valor Total', 'Stock Mínimo', 'Estado'],
    ...products.map((p, index) => [
      index + 1,
      p.name,
      p.category,
      p.stock,
      p.unit,
      p.price,
      p.stock * p.price,
      p.minStock,
      p.status === 'out' ? 'Agotado' : p.status === 'low' ? 'Bajo' : 'Disponible'
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  
  // Estilos de columnas
  sheet['!cols'] = [
    { wch: 5 },  // Index #
    { wch: 30 }, // Producto
    { wch: 15 }, // Categoría
    { wch: 10 }, // Stock
    { wch: 10 }, // Unidad
    { wch: 15 }, // Precio
    { wch: 15 }, // Valor Total
    { wch: 12 }, // Min Stock
    { wch: 12 }  // Estado
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, 'Inventario');

  const fileName = `Inventario_General_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Genera un reporte de lista de productos DETALLADO (por ubicación) en PDF
 */
export const generateDetailedProductListPDF = async (products: Product[], locationName: string): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Inventario: ${locationName}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${formatDateTime()}`, pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`Total Productos: ${products.length}`, pageWidth / 2, yPosition + 5, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(0);

  const tableData = products.map((p, index) => [
    (index + 1).toString(),
    p.name,
    p.category,
    `${p.stock} ${p.unit}`,
    formatCurrency(p.price),
    p.status === 'out' ? 'Agotado' : p.status === 'low' ? 'Bajo' : 'Disponible'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Producto', 'Categoría', 'Stock', 'Precio', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 34, 34], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' }
    },
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const safeLocationName = locationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `Inventario_${safeLocationName}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Genera un reporte de lista de productos DETALLADO (por ubicación) en Excel
 */
export const generateDetailedProductListExcel = async (products: Product[], locationName: string): Promise<void> => {
  const workbook = XLSX.utils.book_new();

  const data = [
    [`INVENTARIO: ${locationName.toUpperCase()}`],
    [`Generado: ${formatDateTime()}`],
    [],
    ['#', 'Producto', 'Categoría', 'Stock', 'Unidad', 'Precio Unitario', 'Valor Total', 'Stock Mínimo', 'Estado'],
    ...products.map((p, index) => [
      index + 1,
      p.name,
      p.category,
      p.stock,
      p.unit,
      p.price,
      p.stock * p.price,
      p.minStock,
      p.status === 'out' ? 'Agotado' : p.status === 'low' ? 'Bajo' : 'Disponible'
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  
  // Estilos de columnas
  sheet['!cols'] = [
    { wch: 5 },  // Index #
    { wch: 30 }, // Producto
    { wch: 15 }, // Categoría
    { wch: 10 }, // Stock
    { wch: 10 }, // Unidad
    { wch: 15 }, // Precio
    { wch: 15 }, // Valor Total
    { wch: 12 }, // Min Stock
    { wch: 12 }  // Estado
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, locationName.substring(0, 30)); // Excel sheet names max 31 chars

  const safeLocationName = locationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `Inventario_${safeLocationName}_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
