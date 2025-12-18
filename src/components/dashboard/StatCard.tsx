import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  status?: string;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  status,
  borderColor,
  iconBgColor,
  iconColor,
}: StatCardProps) => {
  return (
    <div className={`bg-card p-6 rounded-xl shadow-sm border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        </div>
        <div className={`p-2 ${iconBgColor} ${iconColor} rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <p className={`text-xs mt-4 flex items-center gap-1 ${trend.positive ? 'text-success' : 'text-destructive'}`}>
          {trend.value}
        </p>
      )}
      {status && (
        <p className={`text-xs mt-4 font-medium ${iconColor}`}>{status}</p>
      )}
    </div>
  );
};

export default StatCard;
