import React, { createContext, useContext, useState, useEffect } from 'react';
import { negociosService } from '@/services/negocios.service';
import type { Negocio } from '@/types/database.types';
import { toast } from 'sonner';

// Interfaz Location para compatibilidad con componentes existentes
export interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface LocationContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Función helper para convertir de Negocio a Location
const mapToLocation = (negocio: Negocio): Location => ({
  id: negocio.id,
  name: negocio.nombre,
  address: negocio.direccion || undefined,
  phone: negocio.telefono || undefined,
  email: negocio.email || undefined,
});

// Función helper para convertir de Location a Negocio
const mapFromLocation = (location: Omit<Location, 'id'>): Omit<Negocio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> => ({
  nombre: location.name,
  direccion: location.address || null,
  telefono: location.phone || null,
  email: location.email || null,
  activo: true,
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar ubicaciones al montar el componente
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await negociosService.obtenerTodos(true);
      const mappedLocations = data.map(mapToLocation);
      setLocations(mappedLocations);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar ubicaciones';
      setError(errorMsg);
      console.error('Error al cargar ubicaciones:', err);
      // No mostrar toast en la carga inicial para no bloquear la UI
      setLocations([]); // Asegurar que locations sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (location: Omit<Location, 'id'>) => {
    try {
      setError(null);
      const newLocationData = mapFromLocation(location);
      const createdLocation = await negociosService.crear(newLocationData);
      const mappedLocation = mapToLocation(createdLocation);
      setLocations([...locations, mappedLocation]);
      toast.success(`Ubicación "${location.name}" agregada exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar ubicación';
      setError(errorMsg);
      console.error('Error al agregar ubicación:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const updateLocation = async (location: Location) => {
    try {
      setError(null);
      const updateData = {
        nombre: location.name,
        direccion: location.address || null,
        telefono: location.phone || null,
        email: location.email || null,
      };
      const updatedLocation = await negociosService.actualizar(location.id, updateData);
      const mappedLocation = mapToLocation(updatedLocation);
      setLocations(locations.map(l => l.id === location.id ? mappedLocation : l));
      toast.success(`Ubicación "${location.name}" actualizada exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar ubicación';
      setError(errorMsg);
      console.error('Error al actualizar ubicación:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      setError(null);
      const location = locations.find(l => l.id === id);
      await negociosService.eliminar(id);
      setLocations(locations.filter(l => l.id !== id));
      toast.success(`Ubicación "${location?.name || 'desconocida'}" eliminada exitosamente`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar ubicación';
      setError(errorMsg);
      console.error('Error al eliminar ubicación:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  const refreshLocations = async () => {
    await loadLocations();
  };

  return (
    <LocationContext.Provider value={{
      locations,
      loading,
      error,
      addLocation,
      updateLocation,
      deleteLocation,
      refreshLocations
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
