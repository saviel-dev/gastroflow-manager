import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

/**
 * Export service for generating CSV and Excel files with system data
 */
class ExportService {
  /**
   * Fetch all data from the database
   */
  private async fetchAllData() {
    try {
      // Fetch General Inventory
      const { data: generalInventory, error: generalError } = await supabase
        .from('inventario_general')
        .select('*')
        .eq('activo', true)
        .order('fecha_creacion', { ascending: true });

      if (generalError) throw generalError;

      // Fetch Detailed Inventory
      const { data: detailedInventory, error: detailedError } = await supabase
        .from('inventario_detallado')
        .select('*')
        .eq('activo', true)
        .order('fecha_creacion', { ascending: true });

      if (detailedError) throw detailedError;

      // Fetch Movements
      const { data: movements, error: movementsError } = await supabase
        .from('movimientos')
        .select('*')
        .order('fecha_movimiento', { ascending: false });

      if (movementsError) throw movementsError;

      // Fetch Locations
      const { data: locations, error: locationsError } = await supabase
        .from('negocios')
        .select('*')
        .eq('activo', true)
        .order('fecha_creacion', { ascending: true });

      if (locationsError) throw locationsError;

      return {
        generalInventory: generalInventory || [],
        detailedInventory: detailedInventory || [],
        movements: movements || [],
        locations: locations || [],
      };
    } catch (error) {
      console.error('Error fetching data for export:', error);
      throw new Error('Error al obtener los datos para exportar');
    }
  }

  /**
   * Export all data to CSV format (creates a ZIP with multiple CSV files)
   */
  async exportToCSV() {
    try {
      const data = await this.fetchAllData();
      
      // For simplicity, we'll create a single CSV with all general inventory
      // In a real implementation, you might want to create multiple CSVs and zip them
      
      // Convert general inventory to CSV
      const generalCSV = Papa.unparse(data.generalInventory);
      
      // Create and download the file
      const blob = new Blob([generalCSV], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `inventario_general_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Sanitize data for Excel export (truncate long text fields)
   */
  private sanitizeDataForExcel(data: any[]): any[] {
    const MAX_CELL_LENGTH = 32767;
    
    return data.map(row => {
      const sanitizedRow: any = {};
      
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string' && value.length > MAX_CELL_LENGTH) {
          // Truncate long strings and add indicator
          sanitizedRow[key] = value.substring(0, MAX_CELL_LENGTH - 20) + '... [TRUNCATED]';
        } else {
          sanitizedRow[key] = value;
        }
      }
      
      return sanitizedRow;
    });
  }

  /**
   * Export all data to Excel format (creates a workbook with multiple sheets)
   */
  async exportToExcel() {
    try {
      const data = await this.fetchAllData();
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Add General Inventory sheet
      if (data.generalInventory.length > 0) {
        const sanitizedData = this.sanitizeDataForExcel(data.generalInventory);
        const generalSheet = XLSX.utils.json_to_sheet(sanitizedData);
        XLSX.utils.book_append_sheet(workbook, generalSheet, 'Inventario General');
      }
      
      // Add Detailed Inventory sheet
      if (data.detailedInventory.length > 0) {
        const sanitizedData = this.sanitizeDataForExcel(data.detailedInventory);
        const detailedSheet = XLSX.utils.json_to_sheet(sanitizedData);
        XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Inventario Detallado');
      }
      
      // Add Movements sheet
      if (data.movements.length > 0) {
        const sanitizedData = this.sanitizeDataForExcel(data.movements);
        const movementsSheet = XLSX.utils.json_to_sheet(sanitizedData);
        XLSX.utils.book_append_sheet(workbook, movementsSheet, 'Movimientos');
      }
      
      // Add Locations sheet
      if (data.locations.length > 0) {
        const sanitizedData = this.sanitizeDataForExcel(data.locations);
        const locationsSheet = XLSX.utils.json_to_sheet(sanitizedData);
        XLSX.utils.book_append_sheet(workbook, locationsSheet, 'Negocios');
      }
      
      // Generate Excel file and trigger download
      const fileName = `datos_sistema_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default exportService;
