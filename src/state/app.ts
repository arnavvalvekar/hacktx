import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  auth0Id: string
  nessieCustomerId?: string
  nessieAccountId?: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  nessieId: string
  amount: number
  currency: string
  merchant: string
  mcc?: string
  date: string
  meta?: {
    units?: number
    unitType?: string
    distanceKm?: number
  }
  normalizedMerchant: string
  country: string
}

export interface Emission {
  id: string
  userId: string
  txId: string
  kg: number
  method: 'unit' | 'specialized' | 'spend'
  confidence: 'high' | 'medium' | 'low'
  category: string
  notes: string[]
  createdAt: string
}

export interface EmissionsSummary {
  totalKg: number
  period: 'week' | 'month' | 'quarter'
  categoryBreakdown: Record<string, number>
  topMerchants: Array<{ merchant: string; kg: number }>
  trend: number[]
  confidenceDistribution: {
    high: number
    medium: number
    low: number
  }
}

export interface ChatMessage {
  id: string
  question: string
  answer: string
  context?: any
  createdAt: string
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Transactions state
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  isLoadingTransactions: boolean
  setLoadingTransactions: (loading: boolean) => void

  // Emissions state
  emissions: Emission[]
  setEmissions: (emissions: Emission[]) => void
  emissionsSummary: EmissionsSummary | null
  setEmissionsSummary: (summary: EmissionsSummary | null) => void
  isLoadingEmissions: boolean
  setLoadingEmissions: (loading: boolean) => void

  // Chat state
  chatHistory: ChatMessage[]
  setChatHistory: (history: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  isCoachLoading: boolean
  setCoachLoading: (loading: boolean) => void

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Transactions state
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      isLoadingTransactions: false,
      setLoadingTransactions: (loading) => set({ isLoadingTransactions: loading }),

      // Emissions state
      emissions: [],
      setEmissions: (emissions) => set({ emissions }),
      emissionsSummary: null,
      setEmissionsSummary: (summary) => set({ emissionsSummary: summary }),
      isLoadingEmissions: false,
      setLoadingEmissions: (loading) => set({ isLoadingEmissions: loading }),

      // Chat state
      chatHistory: [],
      setChatHistory: (history) => set({ chatHistory: history }),
      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),
      isCoachLoading: false,
      setCoachLoading: (loading) => set({ isCoachLoading: loading }),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ecofin-carbon-storage',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        chatHistory: state.chatHistory,
      }),
    }
  )
)

