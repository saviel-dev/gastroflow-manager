import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadComplete?: (url: string) => void;
}

const AvatarUpload = ({ currentAvatar, onUploadComplete }: AvatarUploadProps) => {
  const { user, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo de imagen
  const validateFile = (file: File): string | null => {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Por favor selecciona una imagen válida (JPG, PNG o WebP)';
    }

    // Validar tamaño (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      return 'La imagen debe ser menor a 2MB';
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Subir imagen
  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);
      await updateAvatar(selectedFile);
      
      // Limpiar preview
      setPreview(null);
      setSelectedFile(null);
      
      // Callback si existe
      if (onUploadComplete && user.avatar_url) {
        onUploadComplete(user.avatar_url);
      }
      
      toast.success('Avatar actualizado exitosamente');
    } catch (error) {
      console.error('Error al subir avatar:', error);
      toast.error('Error al actualizar avatar');
    } finally {
      setUploading(false);
    }
  };

  // Cancelar selección
  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Abrir selector de archivos
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar actual o preview */}
      <div className="relative">
        <img
          src={preview || currentAvatar || user?.avatar_url || 'https://i.pravatar.cc/150?img=11'}
          alt="Avatar"
          className="w-20 h-20 rounded-full border-4 border-primary object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botones */}
      <div className="flex flex-col gap-2">
        {!preview ? (
          <button
            onClick={handleButtonClick}
            disabled={uploading}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            Cambiar foto
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Subiendo...
                </>
              ) : (
                'Subir'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG o WebP. Max 2MB
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
