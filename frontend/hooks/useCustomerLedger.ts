import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

// Customer Ledger Hooks
export const useCustomerLedger = (customerId: string, params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['customer-ledger', customerId, params],
    queryFn: async () => {
      if (!customerId) throw new Error('Customer ID is required');
      
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const { data } = await apiClient.get(`/customers/${customerId}/ledger?${searchParams.toString()}`);
      return data;
    },
    enabled: !!customerId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExportCustomerLedger = () => {
  return useMutation({
    mutationFn: async ({ customerId, format, params }: { 
      customerId: string; 
      format: 'csv' | 'pdf'; 
      params?: { startDate?: string; endDate?: string } 
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/customers/${customerId}/ledger/export/${format}?${searchParams.toString()}`, {
        responseType: 'blob',
      });
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      const blob = new Blob([data], { 
        type: variables.format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-${variables.customerId}-ledger.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${variables.format.toUpperCase()} export downloaded successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export customer ledger');
    },
  });
};
