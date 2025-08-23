import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuantumBackend } from '@/types/quantum';
import { Server, Thermometer, MapPin, Cpu, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackendCardProps {
  backend: QuantumBackend;
}

export const BackendCard = ({ backend }: BackendCardProps) => {
  const getStatusBadge = (status: QuantumBackend['status']) => {
    const statusConfig = {
      online: { className: 'status-completed quantum-glow', label: 'Online' },
      offline: { className: 'status-error', label: 'Offline' },
      maintenance: { className: 'status-queued', label: 'Maintenance' }
    };
    
    const config = statusConfig[status];
    return <Badge className={cn('font-mono text-xs', config.className)}>{config.label}</Badge>;
  };

  const formatQueueTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTypeIcon = () => {
    return backend.type === 'hardware' ? 
      <Cpu className="w-4 h-4 text-primary" /> : 
      <Server className="w-4 h-4 text-accent" />;
  };

  return (
    <Card className={cn(
      "p-4 bg-gradient-subtle border-border/50 transition-all duration-300",
      backend.status === 'online' && "hover:shadow-glow hover:border-primary/40",
      backend.status === 'offline' && "opacity-75",
      backend.status === 'maintenance' && "border-warning/30"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <div>
            <h3 className="font-mono font-semibold text-sm text-foreground">{backend.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {backend.location}
            </div>
          </div>
        </div>
        {getStatusBadge(backend.status)}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Qubits:</span>
            <span className="font-mono text-foreground font-semibold">{backend.qubits}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Queue:</span>
            <span className="font-mono text-warning">{backend.pendingJobs}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avg Wait:</span>
            <span className="font-mono text-foreground">{formatQueueTime(backend.averageQueueTime)}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Error Rate:</span>
            <span className="font-mono text-destructive">{(backend.errorRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-accent" />
            <span className="text-muted-foreground">Temp:</span>
            <span className="font-mono text-foreground">
              {backend.temperature < 1 ? `${(backend.temperature * 1000).toFixed(0)}mK` : `${backend.temperature.toFixed(0)}K`}
            </span>
          </div>
          
          {backend.status === 'online' && backend.pendingJobs > 50 && (
            <div className="flex items-center gap-1 text-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>High Load</span>
            </div>
          )}
          
          {backend.status === 'maintenance' && (
            <div className="flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3" />
              <span>Scheduled Maintenance</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};