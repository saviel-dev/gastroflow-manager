import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-110 flex items-center justify-center z-40 group"
    >
      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
};

export default FloatingActionButton;
