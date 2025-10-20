import axios from 'axios'
import { useApiClient } from './api'

const NESSIE_BASE = 'https://api.nessieisreal.com'

export interface NessieCustomer {
  _id: string
  first_name: string
  last_name: string
  address: {
    street_number: string
    street_name: string
    city: string
    state: string
    zip: string
  }
}

export interface NessieAccount {
  _id: string
  type: string
  nickname: string
  rewards: number
  balance: number
  account_number: string
  customer_id: string
}

export interface NessieTransaction {
  _id: string
  type: string
  transaction_date: string
  status: string
  payer_id: string
  payee_id: string
  description: string
  amount: number
  medium: string
  merchant_id?: string
  merchant_name?: string
  merchant_category?: string
}

export class NessieService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  // Get all customers
  async getCustomers(): Promise<NessieCustomer[]> {
    try {
      const response = await axios.get(`${NESSIE_BASE}/customers`, {
        headers: this.getHeaders()
      })
      return response.data
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  }

  // Get accounts for a customer
  async getCustomerAccounts(customerId: string): Promise<NessieAccount[]> {
    try {
      const response = await axios.get(`${NESSIE_BASE}/customers/${customerId}/accounts`, {
        headers: this.getHeaders()
      })
      return response.data
    } catch (error) {
      console.error('Error fetching customer accounts:', error)
      throw error
    }
  }

  // Get transactions for an account
  async getAccountTransactions(accountId: string): Promise<NessieTransaction[]> {
    try {
      const response = await axios.get(`${NESSIE_BASE}/accounts/${accountId}/purchases`, {
        headers: this.getHeaders()
      })
      return response.data
    } catch (error) {
      console.error('Error fetching account transactions:', error)
      throw error
    }
  }

  // Get transactions for a customer
  async getCustomerTransactions(customerId: string): Promise<NessieTransaction[]> {
    try {
      const response = await axios.get(`${NESSIE_BASE}/customers/${customerId}/purchases`, {
        headers: this.getHeaders()
      })
      return response.data
    } catch (error) {
      console.error('Error fetching customer transactions:', error)
      throw error
    }
  }

  // Get merchants
  async getMerchants(): Promise<any[]> {
    try {
      const response = await axios.get(`${NESSIE_BASE}/merchants`, {
        headers: this.getHeaders()
      })
      return response.data
    } catch (error) {
      console.error('Error fetching merchants:', error)
      throw error
    }
  }

  // Create a customer using POST /customers via backend proxy
  async createCustomer(customerData: {
    first_name: string
    last_name: string
    address: {
      street_number: string
      street_name: string
      city: string
      state: string
      zip: string
    }
  }): Promise<NessieCustomer> {
    try {
      // Use backend proxy instead of direct API call
      const response = await axios.post('/api/users/nessie/customers', customerData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Create a test customer (for demo purposes)
  async createTestCustomer(): Promise<NessieCustomer> {
    const customerData = {
      first_name: 'John',
      last_name: 'Doe',
      address: {
        street_number: '123',
        street_name: 'Main St',
        city: 'Anytown',
        state: 'NY',
        zip: '12345'
      }
    }
    return this.createCustomer(customerData)
  }

  // Create an account using POST /customers/{id}/accounts via backend proxy
  async createAccount(customerId: string, accountData: {
    type: string
    nickname: string
    rewards: number
    balance: number
    account_number: string
  }): Promise<NessieAccount> {
    try {
      // Use backend proxy instead of direct API call
      const response = await axios.post(`/api/users/nessie/customers/${customerId}/accounts`, accountData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  }

  // Create a test account
  async createTestAccount(customerId: string): Promise<NessieAccount> {
    const accountData = {
      type: 'Checking',
      nickname: 'My Checking Account',
      rewards: 0,
      balance: 1000,
      account_number: '1234567890'
    }
    return this.createAccount(customerId, accountData)
  }

  // Create a transaction using POST /accounts/{id}/purchases via backend proxy
  async createTransaction(accountId: string, transactionData: {
    type: string
    transaction_date: string
    status: string
    payer_id: string
    payee_id: string
    description: string
    amount: number
    medium: string
    merchant_id?: string
    merchant_name?: string
    merchant_category?: string
  }): Promise<NessieTransaction> {
    try {
      // Use backend proxy instead of direct API call
      const response = await axios.post(`/api/users/nessie/accounts/${accountId}/purchases`, transactionData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  // Create test transactions
  async createTestTransactions(accountId: string): Promise<NessieTransaction[]> {
    try {
      const transactions = [
        {
          type: 'purchase',
          transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          payer_id: accountId,
          payee_id: 'merchant_1',
          description: 'Coffee Shop Purchase',
          amount: 4.50,
          medium: 'balance',
          merchant_name: 'Starbucks',
          merchant_category: 'Food & Dining'
        },
        {
          type: 'purchase',
          transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          payer_id: accountId,
          payee_id: 'merchant_2',
          description: 'Gas Station',
          amount: 45.00,
          medium: 'balance',
          merchant_name: 'Shell',
          merchant_category: 'Gas & Fuel'
        },
        {
          type: 'purchase',
          transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          payer_id: accountId,
          payee_id: 'merchant_3',
          description: 'Grocery Store',
          amount: 78.50,
          medium: 'balance',
          merchant_name: 'Whole Foods',
          merchant_category: 'Groceries'
        },
        {
          type: 'purchase',
          transaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          payer_id: accountId,
          payee_id: 'merchant_4',
          description: 'Online Shopping',
          amount: 125.00,
          medium: 'balance',
          merchant_name: 'Amazon',
          merchant_category: 'Online Shopping'
        },
        {
          type: 'purchase',
          transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          payer_id: accountId,
          payee_id: 'merchant_5',
          description: 'Restaurant',
          amount: 32.75,
          medium: 'balance',
          merchant_name: 'Local Restaurant',
          merchant_category: 'Food & Dining'
        }
      ]

      const createdTransactions = []
      for (const tx of transactions) {
        const createdTx = await this.createTransaction(accountId, tx)
        createdTransactions.push(createdTx)
      }

      return createdTransactions
    } catch (error) {
      console.error('Error creating test transactions:', error)
      throw error
    }
  }
}

// Helper function to get Nessie API key from environment
export const getNessieService = (): NessieService => {
  const apiKey = (import.meta as any).env?.VITE_NESSIE_API_KEY
  if (!apiKey) {
    throw new Error('Nessie API key not found. Please set VITE_NESSIE_API_KEY in your environment variables.')
  }
  return new NessieService(apiKey)
}

