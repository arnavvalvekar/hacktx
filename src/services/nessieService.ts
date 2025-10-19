import nessieMockData from '../data/nessieMockData.json';
import {
  Customer,
  Account,
  Bill,
  Merchant,
  Purchase,
  Transfer,
  Deposit,
  Transaction,
  AccountSummary,
  TransactionSummary,
  BillSummary,
  CarbonFootprintData
} from '../types/nessieTypes';

// Carbon footprint factors by merchant category (kg CO2 per $1 spent)
const CARBON_FACTORS = {
  'Groceries': 0.5,
  'Organic Food': 0.3,
  'Gas Station': 2.5,
  'Convenience Store': 0.8,
  'Retail': 0.6,
  'Department Store': 0.7,
  'Food & Drink': 0.4,
  'Coffee Shop': 0.2,
  'default': 0.5
};

class NessieService {
  // Get all customers
  getCustomers(): Customer[] {
    return nessieMockData.customers;
  }

  // Get customer by ID
  getCustomerById(customerId: string): Customer | undefined {
    return nessieMockData.customers.find(customer => customer._id === customerId);
  }

  // Get all accounts
  getAccounts(): Account[] {
    return nessieMockData.accounts;
  }

  // Get accounts by customer ID
  getAccountsByCustomerId(customerId: string): Account[] {
    return nessieMockData.accounts.filter(account => account.customer_id === customerId);
  }

  // Get account summary
  getAccountSummary(customerId?: string): AccountSummary {
    const accounts = customerId ? this.getAccountsByCustomerId(customerId) : this.getAccounts();
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    return {
      totalBalance,
      accountCount: accounts.length,
      accounts
    };
  }

  // Get all bills
  getBills(): Bill[] {
    return nessieMockData.bills;
  }

  // Get bills by account ID
  getBillsByAccountId(accountId: string): Bill[] {
    return nessieMockData.bills.filter(bill => bill.account_id === accountId);
  }

  // Get bill summary
  getBillSummary(customerId?: string): BillSummary {
    const accounts = customerId ? this.getAccountsByCustomerId(customerId) : this.getAccounts();
    const accountIds = accounts.map(account => account._id);
    const bills = nessieMockData.bills.filter(bill => accountIds.includes(bill.account_id));
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const totalAmountDue = pendingBills.reduce((sum, bill) => sum + bill.payment_amount, 0);
    
    return {
      totalBills: bills.length,
      pendingBills: pendingBills.length,
      totalAmountDue,
      bills
    };
  }

  // Get all merchants
  getMerchants(): Merchant[] {
    return nessieMockData.merchants;
  }

  // Get merchant by ID
  getMerchantById(merchantId: string): Merchant | undefined {
    return nessieMockData.merchants.find(merchant => merchant._id === merchantId);
  }

  // Get all purchases
  getPurchases(): Purchase[] {
    return nessieMockData.purchases;
  }

  // Get purchases by account ID
  getPurchasesByAccountId(accountId: string): Purchase[] {
    return nessieMockData.purchases.filter(purchase => purchase.account_id === accountId);
  }

  // Get all transfers
  getTransfers(): Transfer[] {
    return nessieMockData.transfers;
  }

  // Get transfers by account ID
  getTransfersByAccountId(accountId: string): Transfer[] {
    return nessieMockData.transfers.filter(transfer => 
      transfer.payer_account === accountId || transfer.payee_account === accountId
    );
  }

  // Get all deposits
  getDeposits(): Deposit[] {
    return nessieMockData.deposits;
  }

  // Get deposits by account ID
  getDepositsByAccountId(accountId: string): Deposit[] {
    return nessieMockData.deposits.filter(deposit => deposit.account_id === accountId);
  }

  // Get combined transactions for an account
  getTransactionsByAccountId(accountId: string): Transaction[] {
    const purchases = this.getPurchasesByAccountId(accountId).map(purchase => ({
      _id: purchase._id,
      type: 'purchase' as const,
      amount: purchase.amount,
      status: purchase.status,
      description: purchase.description,
      date: purchase.date,
      account_id: purchase.account_id,
      merchant_id: purchase.merchant_id,
      category: this.getMerchantById(purchase.merchant_id)?.category
    }));

    const transfers = this.getTransfersByAccountId(accountId).map(transfer => ({
      _id: transfer._id,
      type: 'transfer' as const,
      amount: transfer.amount,
      status: transfer.status,
      description: transfer.description,
      date: transfer.transaction_date,
      account_id: accountId,
      category: ['Transfer']
    }));

    const deposits = this.getDepositsByAccountId(accountId).map(deposit => ({
      _id: deposit._id,
      type: 'deposit' as const,
      amount: deposit.amount,
      status: deposit.status,
      description: deposit.description,
      date: deposit.transaction_date,
      account_id: deposit.account_id,
      category: ['Deposit']
    }));

    return [...purchases, ...transfers, ...deposits].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Get transaction summary
  getTransactionSummary(customerId?: string): TransactionSummary {
    const accounts = customerId ? this.getAccountsByCustomerId(customerId) : this.getAccounts();
    const allTransactions: Transaction[] = [];
    
    accounts.forEach(account => {
      allTransactions.push(...this.getTransactionsByAccountId(account._id));
    });

    // Remove duplicates by creating a Map with unique IDs
    const uniqueTransactions = new Map();
    allTransactions.forEach(transaction => {
      uniqueTransactions.set(transaction._id, transaction);
    });
    const deduplicatedTransactions = Array.from(uniqueTransactions.values());

    const totalTransactions = deduplicatedTransactions.length;
    const totalSpent = deduplicatedTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDeposited = deduplicatedTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const recentTransactions = deduplicatedTransactions.slice(0, 10);

    return {
      totalTransactions,
      totalSpent,
      totalDeposited,
      recentTransactions
    };
  }

  // Calculate carbon footprint for transactions
  getCarbonFootprintData(customerId?: string): CarbonFootprintData[] {
    const accounts = customerId ? this.getAccountsByCustomerId(customerId) : this.getAccounts();
    const carbonData: CarbonFootprintData[] = [];

    accounts.forEach(account => {
      const purchases = this.getPurchasesByAccountId(account._id);
      
      purchases.forEach(purchase => {
        const merchant = this.getMerchantById(purchase.merchant_id);
        const categories = merchant?.category || ['default'];
        const primaryCategory = categories[0];
        const carbonFactor = CARBON_FACTORS[primaryCategory as keyof typeof CARBON_FACTORS] || CARBON_FACTORS.default;
        const carbonFootprint = purchase.amount * carbonFactor;

        carbonData.push({
          transactionId: purchase._id,
          amount: purchase.amount,
          merchant: merchant?.name || 'Unknown Merchant',
          category: categories,
          carbonFootprint,
          date: purchase.date
        });
      });
    });

    // Remove duplicates by creating a Map with unique transaction IDs
    const uniqueCarbonData = new Map();
    carbonData.forEach(data => {
      uniqueCarbonData.set(data.transactionId, data);
    });

    return Array.from(uniqueCarbonData.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get total carbon footprint
  getTotalCarbonFootprint(customerId?: string): number {
    const carbonData = this.getCarbonFootprintData(customerId);
    return carbonData.reduce((total, data) => total + data.carbonFootprint, 0);
  }
}

export const nessieService = new NessieService();
