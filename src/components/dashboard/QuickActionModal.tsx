import { X, Receipt, PackagePlus } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickActionModal = ({ isOpen, onClose }: QuickActionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Content */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-brand-dark p-4 flex justify-between items-center text-sidebar-foreground">
          <h3 className="font-bold flex items-center gap-2">
            ⚡ Acción Rápida
          </h3>
          <button onClick={onClose} className="hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">¿Qué deseas registrar?</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 group transition-all text-center">
              <Receipt className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 mx-auto" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary">Nueva Venta</span>
            </button>
            <button className="p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 group transition-all text-center">
              <PackagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 mx-auto" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary">Entrada Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionModal;
