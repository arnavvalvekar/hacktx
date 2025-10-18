import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const useApiClient = () => {
  const { getAccessTokenSilently } = useAuth0()

  const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
  })

  // Add auth token to requests
  apiClient.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently()
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.warn('Could not get access token:', error)
    }
    return config
  })

  return apiClient
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

