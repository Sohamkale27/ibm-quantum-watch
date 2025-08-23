import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuantumJob } from '@/types/quantum';
import { Clock, Zap, Target, User, CircuitBoard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: QuantumJob;
}

export const JobCard = ({ job }: JobCardProps) => {
  const getStatusBadge = (status: QuantumJob['status']) => {
    const statusConfig = {
      running: { className: 'status-running quantum-pulse', label: 'Running' },
      queued: { className: 'status-queued', label: 'Queued' },
      completed: { className: 'status-completed', label: 'Completed' },
      error: { className: 'status-error', label: 'Error' }
    };
    
    const config = statusConfig[status];
    return <Badge className={cn('font-mono text-xs', config.className)}>{config.label}</Badge>;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="p-4 bg-gradient-subtle border-border/50 hover:shadow-card transition-all duration-300 hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-mono font-semibold text-sm text-foreground">{job.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">ID: {job.id}</p>
        </div>
        {getStatusBadge(job.status)}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CircuitBoard className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">Backend:</span>
          <span className="font-mono text-foreground">{job.backend}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-muted-foreground">Qubits:</span>
          <span className="font-mono text-foreground">{job.qubits}</span>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-secondary" />
          <span className="text-muted-foreground">Shots:</span>
          <span className="font-mono text-foreground">{job.shots.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-primary-glow" />
          <span className="text-muted-foreground">User:</span>
          <span className="font-mono text-foreground">{job.userId}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-mono text-foreground">{formatTime(job.createdAt)}</span>
          </div>
          
          {job.status === 'queued' && job.position && (
            <div className="text-warning">
              Position: #{job.position}
            </div>
          )}
          
          {job.status === 'completed' && job.executionTime && (
            <div className="text-success">
              Runtime: {formatDuration(job.executionTime)}
            </div>
          )}
          
          {job.status === 'running' && (
            <div className="text-primary quantum-pulse">
              Processing...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};