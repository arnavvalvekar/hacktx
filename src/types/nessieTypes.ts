// Nessie API Data Types based on Capital One API documentation

export interface Address {
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip: string;
}

export interface Geocode {
  lat: number;
  lng: number;
}

export interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  address: Address;
}

export interface Account {
  _id: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Money Market';
  nickname: string;
  rewards: number;
  balance: number;
  customer_id: string;
  account_number: string;
}

export interface Bill {
  _id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'recurring';
  payee: string;
  nickname: string;
  payment_date: string;
  recurring_date: number;
  payment_amount: number;
  account_id: string;
}

export interface Merchant {
  _id: string;
  name: string;
  category: string[];
  address: Address;
  geocode: Geocode;
}

export interface Purchase {
  _id: string;
  merchant_id: string;
  payer_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  description: string;
  date: string;
  account_id: string;
}

export interface Transfer {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  transaction_date: string;
  status: 'completed' | 'pending' | 'cancelled';
  medium: 'balance' | 'reward' | 'credit';
  amount: number;
  description: string;
  payer_id: string;
  payee_id: string;
  payer_account: string;
  payee_account?: string;
}

export interface Deposit {
  _id: string;
  type: 'deposit';
  transaction_date: string;
  status: 'completed' | 'pending' | 'cancelled';
  medium: 'balance' | 'reward';
  amount: number;
  description: string;
  payer_id: string;
  account_id: string;
}

// Combined transaction type for unified display
export interface Transaction {
  _id: string;
  type: 'purchase' | 'transfer' | 'deposit' | 'bill';
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  description: string;
  date: string;
  account_id: string;
  merchant_id?: string;
  category?: string[];
  // CO₂ estimation properties (optional for mock mode)
  co2e_kg?: number;
  method?: string;
  confidence?: string;
  mcc?: string;
}

// Nessie API Response Types
export interface NessieApiResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Dashboard specific types
export interface AccountSummary {
  totalBalance: number;
  accountCount: number;
  accounts: Account[];
}

export interface TransactionSummary {
  totalTransactions: number;
  totalSpent: number;
  totalDeposited: number;
  recentTransactions: Transaction[];
}

export interface BillSummary {
  totalBills: number;
  pendingBills: number;
  totalAmountDue: number;
  bills: Bill[];
}

export interface CarbonFootprintData {
  transactionId: string;
  amount: number;
  merchant: string;
  category: string[];
  carbonFootprint: number;
  date: string;
}
