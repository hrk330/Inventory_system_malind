import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CustomerLedgerSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  customerNumber: string;
  address?: string;
  balance: number;
  totalSales: number;
  totalPaid: number;
  totalRefunds: number;
  lastTransactionDate?: string;
  transactionCount: number;
}

export const useCustomerLedgerOverview = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['customer-ledger-overview', searchTerm],
    queryFn: async () => {
      const response = await apiClient.get('/customers/ledger-overview', {
        params: { search: searchTerm }
      });
      return response.data as CustomerLedgerSummary[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
