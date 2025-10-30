import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

// Supplier Ledger Hooks
export const useSupplierLedger = (supplierId: string, params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['supplier-ledger', supplierId, params],
    queryFn: async () => {
      if (!supplierId) throw new Error('Supplier ID is required');
      
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const { data } = await apiClient.get(`/suppliers/${supplierId}/ledger?${searchParams.toString()}`);
      return data;
    },
    enabled: !!supplierId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExportSupplierLedger = () => {
  return useMutation({
    mutationFn: async ({ 
      supplierId, 
      format, 
      params 
    }: { 
      supplierId: string; 
      format: 'csv' | 'pdf'; 
      params?: { startDate?: string; endDate?: string } 
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/suppliers/${supplierId}/ledger/export/${format}?${searchParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supplier-${variables.supplierId}-ledger.${variables.format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Export ${variables.format.toUpperCase()} downloaded successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to export: ${error.response?.data?.message || error.message}`);
    },
  });
};
