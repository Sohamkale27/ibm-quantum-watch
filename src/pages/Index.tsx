import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JobCard } from '@/components/quantum/JobCard';
import { BackendCard } from '@/components/quantum/BackendCard';
import { StatsCard } from '@/components/quantum/StatsCard';
import { 
  getQuantumJobs, 
  getQuantumBackends, 
  getDashboardStats,
  simulateRealtimeUpdates 
} from '@/services/quantumData';
import { QuantumJob, QuantumBackend, DashboardStats } from '@/types/quantum';
import { 
  Search, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Server,
  Zap,
  RefreshCw
} from 'lucide-react';

const Index = () => {
  const [jobs, setJobs] = useState<QuantumJob[]>([]);
  const [backends, setBackends] = useState<QuantumBackend[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuantumJob['status'] | 'all'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshData = () => {
    setJobs(getQuantumJobs());
    setBackends(getQuantumBackends());
    setStats(getDashboardStats());
    setLastUpdated(new Date());
  };

  useEffect(() => {
    refreshData();
    
    const cleanup = simulateRealtimeUpdates(() => {
      refreshData();
    });

    return cleanup;
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.backend.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-mono font-bold bg-gradient-quantum bg-clip-text text-transparent">
            IBM Quantum Dashboard
          </h1>
          <p className="text-muted-foreground font-mono">
            Live quantum computing jobs and system status
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 quantum-spin" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Running Jobs"
            value={stats.runningJobs}
            icon={Activity}
            variant="primary"
          />
          <StatsCard
            title="Queued Jobs"
            value={stats.queuedJobs}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Completed"
            value={stats.completedJobs}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={AlertCircle}
          />
          <StatsCard
            title="Active Backends"
            value={stats.activeBackends}
            icon={Server}
          />
          <StatsCard
            title="Total Qubits"
            value={stats.totalQubits}
            icon={Zap}
            variant="primary"
          />
        </div>

        {/* Quantum Backends */}
        <div className="space-y-4">
          <h2 className="text-xl font-mono font-semibold text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Quantum Backends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {backends.map(backend => (
              <BackendCard key={backend.id} backend={backend} />
            ))}
          </div>
        </div>

        {/* Job Queue Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Job Queue ({filteredJobs.length})
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, backends, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-mono bg-muted border-border"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'running', 'queued', 'completed', 'error'] as const).map(status => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className={`cursor-pointer font-mono transition-all ${
                    statusFilter === status ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <Card className="col-span-full p-8 text-center bg-gradient-subtle">
              <p className="text-muted-foreground font-mono">
                No jobs found matching your criteria
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;