'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/hooks/pos/useCustomers';

interface CustomerFormProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  onCreateCustomer: (customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => Promise<Customer | null>;
}

export default function CustomerForm({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onCreateCustomer
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: ''
  });

  const handleCreateCustomer = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const customerData = {
      name: formData.name,
      email: formData.contact.includes('@') ? formData.contact : undefined,
      phone: formData.contact.includes('@') ? undefined : formData.contact,
      address: formData.address || undefined
    };

    const newCustomer = await onCreateCustomer(customerData);
    
    if (newCustomer) {
      // Clear form
      setFormData({
        name: '',
        contact: '',
        address: ''
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Select 
            value={selectedCustomer?.id || undefined} 
            onValueChange={(value) => {
              const customer = customers.find(c => c.id === value);
              onCustomerSelect(customer || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="walk_in_customer s/o Nil | NILL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk_in">Walk-in Customer</SelectItem>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} | {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleCreateCustomer}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!formData.name.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Name</label>
          <Input 
            placeholder="Name" 
            value={formData.name} 
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Contact#</label>
          <Input 
            placeholder="Contact#" 
            value={formData.contact} 
            onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))} 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-900 mb-1">Address</label>
        <textarea 
          className="w-full p-2 border border-gray-300 rounded-md" 
          rows={3}
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
    </div>
  );
}
