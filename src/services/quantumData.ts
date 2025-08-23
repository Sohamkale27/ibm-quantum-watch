import { QuantumJob, QuantumBackend, DashboardStats } from '@/types/quantum';
import { ibmQuantumAPI } from './ibmQuantumApi';

// Cache for API data to avoid excessive requests
let dataCache: {
  jobs: QuantumJob[];
  backends: QuantumBackend[];
  stats: DashboardStats | null;
  lastFetch: number;
} = {
  jobs: [],
  backends: [],
  stats: null,
  lastFetch: 0,
};

const CACHE_DURATION = 30000; // 30 seconds

// Fallback simulated data (used when API is unavailable)
const FALLBACK_BACKENDS: QuantumBackend[] = [
  {
    id: 'ibm_kyoto',
    name: 'IBM Kyoto',
    status: 'online',
    qubits: 127,
    pendingJobs: 42,
    averageQueueTime: 180,
    errorRate: 0.02,
    temperature: 0.015,
    location: 'Kyoto, Japan',
    type: 'hardware'
  },
  {
    id: 'ibm_osaka',
    name: 'IBM Osaka',
    status: 'online',
    qubits: 127,
    pendingJobs: 28,
    averageQueueTime: 95,
    errorRate: 0.018,
    temperature: 0.013,
    location: 'Osaka, Japan',
    type: 'hardware'
  },
  {
    id: 'ibm_cleveland',
    name: 'IBM Cleveland',
    status: 'maintenance',
    qubits: 433,
    pendingJobs: 0,
    averageQueueTime: 0,
    errorRate: 0.015,
    temperature: 0.012,
    location: 'Cleveland, USA',
    type: 'hardware'
  },
  {
    id: 'ibm_simulator',
    name: 'QASM Simulator',
    status: 'online',
    qubits: 1000,
    pendingJobs: 156,
    averageQueueTime: 15,
    errorRate: 0.0,
    temperature: 298,
    location: 'Cloud',
    type: 'simulator'
  }
];

const generateFallbackJobs = (): QuantumJob[] => {
  const jobs: QuantumJob[] = [];
  const statuses: QuantumJob['status'][] = ['queued', 'running', 'completed', 'error'];
  const users = ['alice.quantum', 'bob.researcher', 'carol.phd', 'david.lab', 'eve.student'];
  
  for (let i = 0; i < 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const backend = FALLBACK_BACKENDS[Math.floor(Math.random() * FALLBACK_BACKENDS.length)];
    const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    
    const job: QuantumJob = {
      id: `fallback_job_${i}`,
      name: `Quantum Algorithm ${i + 1}`,
      status,
      backend: backend.name,
      qubits: Math.floor(Math.random() * Math.min(backend.qubits, 20)) + 1,
      shots: [1024, 2048, 4096, 8192][Math.floor(Math.random() * 4)],
      createdAt,
      userId: users[Math.floor(Math.random() * users.length)],
      circuitDepth: Math.floor(Math.random() * 50) + 5,
      position: status === 'queued' ? Math.floor(Math.random() * 100) + 1 : undefined,
      errorRate: status === 'completed' ? Math.random() * 0.1 : undefined
    };

    if (status === 'running' || status === 'completed') {
      job.startedAt = new Date(createdAt.getTime() + Math.random() * 3600000);
    }

    if (status === 'completed') {
      job.completedAt = new Date(job.startedAt!.getTime() + Math.random() * 1800000);
      job.executionTime = Math.floor((job.completedAt.getTime() - job.startedAt!.getTime()) / 1000);
    }

    jobs.push(job);
  }

  return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const shouldRefreshCache = (): boolean => {
  return Date.now() - dataCache.lastFetch > CACHE_DURATION;
};

const refreshDataFromAPI = async (): Promise<void> => {
  try {
    console.log('Fetching data from IBM Quantum API...');
    
    // Fetch data from IBM Quantum API
    const [backends, jobs] = await Promise.all([
      ibmQuantumAPI.getBackends(),
      ibmQuantumAPI.getJobs(),
    ]);

    const stats = await ibmQuantumAPI.getDashboardStats(jobs, backends);

    // Update cache
    dataCache = {
      jobs,
      backends,
      stats,
      lastFetch: Date.now(),
    };

    console.log(`Fetched ${jobs.length} jobs and ${backends.length} backends from IBM Quantum API`);
  } catch (error) {
    console.warn('Failed to fetch from IBM Quantum API, using fallback data:', error);
    
    // Use fallback data when API is unavailable
    const fallbackJobs = generateFallbackJobs();
    const fallbackStats = {
      totalJobs: fallbackJobs.length,
      runningJobs: fallbackJobs.filter(j => j.status === 'running').length,
      queuedJobs: fallbackJobs.filter(j => j.status === 'queued').length,
      completedJobs: fallbackJobs.filter(j => j.status === 'completed').length,
      activeBackends: FALLBACK_BACKENDS.filter(b => b.status === 'online').length,
      totalQubits: FALLBACK_BACKENDS.filter(b => b.status === 'online').reduce((sum, b) => sum + b.qubits, 0),
    };

    dataCache = {
      jobs: fallbackJobs,
      backends: FALLBACK_BACKENDS,
      stats: fallbackStats,
      lastFetch: Date.now(),
    };
  }
};

export const getQuantumJobs = async (): Promise<QuantumJob[]> => {
  if (shouldRefreshCache()) {
    await refreshDataFromAPI();
  }
  return [...dataCache.jobs];
};

export const getQuantumBackends = async (): Promise<QuantumBackend[]> => {
  if (shouldRefreshCache()) {
    await refreshDataFromAPI();
  }
  return [...dataCache.backends];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (shouldRefreshCache()) {
    await refreshDataFromAPI();
  }
  return dataCache.stats!;
};

// Real-time updates (triggers cache refresh)
export const simulateRealtimeUpdates = (callback: () => void) => {
  const updateInterval = setInterval(async () => {
    // Force cache refresh by calling the API functions
    await refreshDataFromAPI();
    callback();
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(updateInterval);
};