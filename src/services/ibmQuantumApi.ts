import { QuantumJob, QuantumBackend, DashboardStats } from '@/types/quantum';

interface IBMTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

interface IBMBackendResponse {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  num_qubits: number;
  pending_jobs: number;
  queue_time: number;
  error_rate: number;
  temperature: number;
  location: string;
  backend_type: 'hardware' | 'simulator';
}

interface IBMJobResponse {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'error';
  backend: string;
  qubits: number;
  shots: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  execution_time?: number;
  position?: number;
  user_id: string;
  circuit_depth: number;
  error_rate?: number;
}

class IBMQuantumAPI {
  private baseUrl = 'https://quantum.cloud.ibm.com/api/v1';
  private tokenCache: { token: string; expires: number } | null = null;

  setCredentials(apiKey: string, serviceCrn: string) {
    localStorage.setItem('ibm_quantum_api_key', apiKey);
    localStorage.setItem('ibm_quantum_service_crn', serviceCrn);
    // Clear token cache when credentials change
    this.tokenCache = null;
  }

  hasCredentials(): boolean {
    return !!(localStorage.getItem('ibm_quantum_api_key') && localStorage.getItem('ibm_quantum_service_crn'));
  }

  private async getBearerToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && Date.now() < this.tokenCache.expires) {
      return this.tokenCache.token;
    }

    const apiKey = localStorage.getItem('ibm_quantum_api_key');
    if (!apiKey) {
      throw new Error('IBM Quantum API key not configured');
    }

    try {
      const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
      });

      if (!response.ok) {
        throw new Error(`Failed to get bearer token: ${response.statusText}`);
      }

      const data: IBMTokenResponse = await response.json();
      
      // Cache the token (expires in 1 hour, cache for 50 minutes to be safe)
      this.tokenCache = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 600) * 1000,
      };

      return data.access_token;
    } catch (error) {
      console.error('Failed to authenticate with IBM Quantum:', error);
      throw new Error('Authentication failed');
    }
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const bearerToken = await this.getBearerToken();
    const serviceCrn = localStorage.getItem('ibm_quantum_service_crn');

    if (!serviceCrn) {
      throw new Error('IBM Quantum Service CRN not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'Service-CRN': serviceCrn,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBackends(): Promise<QuantumBackend[]> {
    try {
      const backends = await this.makeRequest<IBMBackendResponse[]>('/backends');
      
      return backends.map(backend => ({
        id: backend.id,
        name: backend.name,
        status: backend.status,
        qubits: backend.num_qubits,
        pendingJobs: backend.pending_jobs || 0,
        averageQueueTime: backend.queue_time || 0,
        errorRate: backend.error_rate || 0,
        temperature: backend.temperature || 0,
        location: backend.location || 'Unknown',
        type: backend.backend_type,
      }));
    } catch (error) {
      console.error('Failed to fetch backends:', error);
      // Return empty array or throw based on your preference
      return [];
    }
  }

  async getJobs(): Promise<QuantumJob[]> {
    try {
      const jobs = await this.makeRequest<IBMJobResponse[]>('/jobs');
      
      return jobs.map(job => ({
        id: job.id,
        name: job.name || `Job ${job.id}`,
        status: job.status,
        backend: job.backend,
        qubits: job.qubits || 1,
        shots: job.shots || 1024,
        createdAt: new Date(job.created_at),
        startedAt: job.started_at ? new Date(job.started_at) : undefined,
        completedAt: job.completed_at ? new Date(job.completed_at) : undefined,
        executionTime: job.execution_time,
        position: job.position,
        userId: job.user_id || 'unknown',
        circuitDepth: job.circuit_depth || 0,
        errorRate: job.error_rate,
      }));
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      // Return empty array or throw based on your preference
      return [];
    }
  }

  async getDashboardStats(jobs: QuantumJob[], backends: QuantumBackend[]): Promise<DashboardStats> {
    return {
      totalJobs: jobs.length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      queuedJobs: jobs.filter(j => j.status === 'queued').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      activeBackends: backends.filter(b => b.status === 'online').length,
      totalQubits: backends.filter(b => b.status === 'online').reduce((sum, b) => sum + b.qubits, 0),
    };
  }
}

export const ibmQuantumAPI = new IBMQuantumAPI();