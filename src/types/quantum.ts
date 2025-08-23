export interface QuantumJob {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'error';
  backend: string;
  qubits: number;
  shots: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  executionTime?: number;
  position?: number;
  userId: string;
  circuitDepth: number;
  errorRate?: number;
}

export interface QuantumBackend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  qubits: number;
  pendingJobs: number;
  averageQueueTime: number;
  errorRate: number;
  temperature: number;
  location: string;
  type: 'simulator' | 'hardware';
}

export interface DashboardStats {
  totalJobs: number;
  runningJobs: number;
  queuedJobs: number;
  completedJobs: number;
  activeBackends: number;
  totalQubits: number;
}