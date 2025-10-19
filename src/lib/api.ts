import axios from "axios";
import { useAuth0 } from '@auth0/auth0-react'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";

export function createAuthorizedClient(getToken: () => Promise<string>) {
  const client = axios.create({ 
    baseURL: API_BASE,
    timeout: 30000 // 30 second timeout
  });
  
  client.interceptors.request.use(async (config) => {
    console.log('🔍 API DEBUG: Making request to:', config.url);
    console.log('🔍 API DEBUG: Request method:', config.method);
    
    try {
      const token = await getToken();
      console.log('🔍 API DEBUG: Token retrieved:', token ? 'Present' : 'Missing');
      console.log('🔍 API DEBUG: Token length:', token ? token.length : 0);
      console.log('🔍 API DEBUG: Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ API DEBUG: Authorization header set');
      } else {
        console.log('❌ API DEBUG: No token available');
      }
    } catch (error) {
      console.error('❌ API DEBUG: Error getting token:', error);
      // Don't throw here, let the request proceed and handle auth errors in response interceptor
    }
    
    console.log('🔍 API DEBUG: Final headers:', config.headers);
    return config;
  });
  
  client.interceptors.response.use(
    (response) => {
      console.log('✅ API DEBUG: Response received:', response.status, response.config.url);
      return response;
    },
    async (error) => {
      console.error('❌ API DEBUG: Response error:', error.response?.status, error.config?.url);
      console.error('❌ API DEBUG: Error details:', error.response?.data);
      
      // Handle 401 errors specifically
      if (error.response?.status === 401) {
        console.log('🔄 API DEBUG: 401 error detected, attempting token refresh...');
        
        try {
          // Try to get a fresh token
          const newToken = await getToken();
          if (newToken) {
            console.log('✅ API DEBUG: Token refreshed successfully');
            // Retry the original request with the new token
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          console.error('❌ API DEBUG: Token refresh failed:', refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
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

