import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'default',
  className 
}: StatsCardProps) => {
  const variants = {
    default: 'bg-gradient-subtle border-border/50',
    primary: 'bg-gradient-glow border-primary/30 shadow-quantum',
    success: 'bg-gradient-subtle border-success/30',
    warning: 'bg-gradient-subtle border-warning/30'
  };

  return (
    <Card className={cn(
      'p-4 transition-all duration-300 hover:shadow-card',
      variants[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground font-mono">
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          'p-2 rounded-lg',
          variant === 'primary' && 'bg-primary/20 text-primary quantum-pulse',
          variant === 'success' && 'bg-success/20 text-success',
          variant === 'warning' && 'bg-warning/20 text-warning',
          variant === 'default' && 'bg-muted/20 text-muted-foreground'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};