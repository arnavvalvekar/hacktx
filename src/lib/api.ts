import axios from "axios";
import { useAuth0 } from '@auth0/auth0-react'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";

export function createAuthorizedClient(getToken: () => Promise<string>) {
  const client = axios.create({ baseURL: API_BASE });
  client.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });
  return client;
}

// Legacy hook for backward compatibility
export const useApiClient = () => {
  const { getAccessTokenSilently } = useAuth0()
  return createAuthorizedClient(() => getAccessTokenSilently())
}

// API endpoints
export const api = {
  // Transactions
  syncTransactions: (customerId: string, accountId: string) => 
    axios.get(`${API_BASE}/transactions/sync`, {
      params: { customerId, accountId }
    }),

  getTransactions: (params?: { startDate?: string; endDate?: string; category?: string }) =>
    axios.get(`${API_BASE}/transactions`, { params }),

  // Emissions
  calculateEmissions: (data: { txIds?: string[]; timeRange?: { start: string; end: string }; country?: string }) =>
    axios.post(`${API_BASE}/emissions/calc`, data),

  getEmissionsSummary: (window: 'week' | 'month' | 'quarter') =>
    axios.get(`${API_BASE}/emissions/summary`, {
      params: { window }
    }),

  // AI Coach
  askCoach: (data: { question: string; context?: { txId?: string; category?: string; period?: string } }) =>
    axios.post(`${API_BASE}/coach`, data),

  // Users
  getUserProfile: () =>
    axios.get(`${API_BASE}/users/profile`),

  updateUserProfile: (data: any) =>
    axios.put(`${API_BASE}/users/profile`, data),
}

