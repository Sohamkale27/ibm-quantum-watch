import { QuantumJob, QuantumBackend, DashboardStats } from '@/types/quantum';

// Simulated IBM Quantum backends
const QUANTUM_BACKENDS: QuantumBackend[] = [
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

// Generate simulated quantum jobs
const generateQuantumJobs = (): QuantumJob[] => {
  const jobs: QuantumJob[] = [];
  const statuses: QuantumJob['status'][] = ['queued', 'running', 'completed', 'error'];
  const users = ['alice.quantum', 'bob.researcher', 'carol.phd', 'david.lab', 'eve.student'];
  
  for (let i = 0; i < 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const backend = QUANTUM_BACKENDS[Math.floor(Math.random() * QUANTUM_BACKENDS.length)];
    const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    
    const job: QuantumJob = {
      id: `job_${Date.now()}_${i}`,
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

let quantumJobs = generateQuantumJobs();

export const getQuantumJobs = (): QuantumJob[] => {
  return [...quantumJobs];
};

export const getQuantumBackends = (): QuantumBackend[] => {
  return [...QUANTUM_BACKENDS];
};

export const getDashboardStats = (): DashboardStats => {
  const jobs = getQuantumJobs();
  const backends = getQuantumBackends();
  
  return {
    totalJobs: jobs.length,
    runningJobs: jobs.filter(j => j.status === 'running').length,
    queuedJobs: jobs.filter(j => j.status === 'queued').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    activeBackends: backends.filter(b => b.status === 'online').length,
    totalQubits: backends.filter(b => b.status === 'online').reduce((sum, b) => sum + b.qubits, 0)
  };
};

// Simulate real-time updates
export const simulateRealtimeUpdates = (callback: () => void) => {
  const updateInterval = setInterval(() => {
    // Randomly update job statuses
    quantumJobs = quantumJobs.map(job => {
      if (Math.random() < 0.05) { // 5% chance of status change
        if (job.status === 'queued' && Math.random() < 0.3) {
          return { ...job, status: 'running' as const, startedAt: new Date() };
        }
        if (job.status === 'running' && Math.random() < 0.4) {
          return { 
            ...job, 
            status: 'completed' as const, 
            completedAt: new Date(),
            executionTime: Math.floor(Math.random() * 300) + 30,
            errorRate: Math.random() * 0.1
          };
        }
      }
      return job;
    });

    // Occasionally add new jobs
    if (Math.random() < 0.1) {
      const newJob = generateQuantumJobs()[0];
      quantumJobs.unshift({ ...newJob, id: `job_${Date.now()}_new` });
      quantumJobs = quantumJobs.slice(0, 50); // Keep only latest 50
    }

    callback();
  }, 3000);

  return () => clearInterval(updateInterval);
};