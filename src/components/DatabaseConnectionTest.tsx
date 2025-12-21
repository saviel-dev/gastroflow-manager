import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';

export default function DatabaseConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('Probando conexión...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const testResults: string[] = [];
    
    try {
      // Test 1: Conexión básica
      testResults.push('✓ Cliente Supabase inicializado');

      // Test 2: Verificar tabla configuracion
      const { data: configData, error: configError } = await supabase
        .from('configuracion')
        .select('*')
        .limit(1);

      if (configError) {
        throw new Error(`Error en tabla configuracion: ${configError.message}`);
      }
      testResults.push('✓ Tabla configuracion accesible');

      // Test 3: Verificar tabla inventario_general
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventario_general')
        .select('count')
        .limit(1);

      if (inventoryError) {
        throw new Error(`Error en tabla inventario_general: ${inventoryError.message}`);
      }
      testResults.push('✓ Tabla inventario_general accesible');

      // Test 4: Verificar tabla movimientos
      const { data: movementsData, error: movementsError } = await supabase
        .from('movimientos')
        .select('count')
        .limit(1);

      if (movementsError) {
        throw new Error(`Error en tabla movimientos: ${movementsError.message}`);
      }
      testResults.push('✓ Tabla movimientos accesible');

      // Test 5: Verificar tabla negocios
      const { data: businessData, error: businessError } = await supabase
        .from('negocios')
        .select('count')
        .limit(1);

      if (businessError) {
        throw new Error(`Error en tabla negocios: ${businessError.message}`);
      }
      testResults.push('✓ Tabla negocios accesible');

      setDetails(testResults);
      setStatus('success');
      setMessage('¡Conexión exitosa con Supabase!');
    } catch (error) {
      console.error('Error en test de conexión:', error);
      testResults.push(`✗ ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setDetails(testResults);
      setStatus('error');
      setMessage('Error al conectar con la base de datos');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          status === 'testing' ? 'bg-blue-500/10' :
          status === 'success' ? 'bg-success/10' :
          'bg-destructive/10'
        }`}>
          {status === 'testing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
          {status === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
        </div>
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4" />
            Test de Conexión a Base de Datos
          </h3>
          <p className={`text-sm ${
            status === 'testing' ? 'text-blue-500' :
            status === 'success' ? 'text-success' :
            'text-destructive'
          }`}>
            {message}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <div className="mt-4 space-y-2">
          {details.map((detail, index) => (
            <div
              key={index}
              className={`text-xs font-mono p-2 rounded ${
                detail.startsWith('✓') 
                  ? 'bg-success/5 text-success' 
                  : 'bg-destructive/5 text-destructive'
              }`}
            >
              {detail}
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-xs text-warning font-medium">
            ⚠️ Asegúrate de haber ejecutado el schema.sql en tu proyecto de Supabase
          </p>
        </div>
      )}

      <button
        onClick={testConnection}
        disabled={status === 'testing'}
        className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'testing' ? 'Probando...' : 'Probar de nuevo'}
      </button>
    </div>
  );
}
