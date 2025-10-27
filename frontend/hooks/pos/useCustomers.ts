import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/customers');
      const data = response.data;
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    if (!customerData.name.trim()) {
      toast.error('Please enter customer name');
      return null;
    }

    try {
      const response = await apiClient.post('/customers', customerData);
      const newCustomer = response.data;

      // Add to customers list
      setCustomers(prev => [...prev, newCustomer]);
      
      // Select the new customer
      setSelectedCustomer(newCustomer);
      
      toast.success('Customer created successfully');
      return newCustomer;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create customer';
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    isLoading,
    loadCustomers,
    createCustomer
  };
};

