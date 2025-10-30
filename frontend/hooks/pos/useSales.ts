import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { CartItem } from './useCart';
import { Customer } from './useCustomers';
import { Location } from './useLocations';

export interface SaleData {
  saleType: string;
  customerId?: string;
  locationId: string;
  items: any[];
  payments: any[];
  taxRate: number;
  discountType: string;
  discountValue: number;
  notes: string;
  isCreditSale?: boolean;
  amountPaid?: number;
  totalAmount?: number;
}

export const useSales = () => {
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptCartItems, setReceiptCartItems] = useState<CartItem[]>([]);
  const [receiptTotals, setReceiptTotals] = useState<any>(null);

  const processPayment = async (
    cartItems: CartItem[],
    selectedCustomer: Customer | null,
    selectedLocation: Location,
    paymentMethod: string,
    amountPaid: number,
    saleNotes: string,
    taxRate: number,
    discount: any,
    subtotal: number,
    itemDiscounts: number,
    saleDiscount: number,
    subtotalAfterDiscount: number,
    taxAmount: number,
    totalAmount: number,
    changeGiven: number,
    isCreditSale: boolean = false
  ) => {
    // Allow partial payments for credit sales or when customer is selected
    if (!isCreditSale && amountPaid < totalAmount && !selectedCustomer) {
      toast.error('Amount paid is less than total amount');
      return;
    }

    if (!selectedLocation) {
      toast.error('No location selected');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('No items in cart');
      return;
    }

    setIsCompletingSale(true);
    
    try {
      // Validate required data
      if (!selectedLocation?.id) {
        throw new Error('No location selected');
      }
      
      if (cartItems.length === 0) {
        throw new Error('No items in cart');
      }
      
      // Validate cart items
      for (const item of cartItems) {
        if (!item.itemName || !item.quantity || !item.unitPrice) {
          throw new Error(`Invalid item data: ${item.itemName}`);
        }
        if (item.itemType === 'PRODUCT' && !item.productId) {
          throw new Error(`Product item missing productId: ${item.itemName}`);
        }
      }

      // Store cart data and totals for receipt preview BEFORE clearing
      console.log('Storing receipt data:', {
        cartItems: cartItems.length,
        subtotal,
        totalAmount,
        amountPaid,
        changeGiven,
        selectedCustomer: selectedCustomer?.name,
        selectedLocation: selectedLocation?.name
      });
      
      setReceiptCartItems([...cartItems]);
      setReceiptTotals({
        subtotal,
        itemDiscounts,
        saleDiscount,
        subtotalAfterDiscount,
        taxAmount,
        totalAmount,
        amountPaid,
        changeGiven,
        taxRate,
        discount,
        selectedCustomer,
        selectedLocation
      });

      // Prepare sale data
      const saleData: SaleData = {
        saleType: 'RETAIL',
        customerId: selectedCustomer?.id || undefined,
        locationId: selectedLocation.id,
        items: cartItems.map(item => ({
          productId: item.productId || undefined,
          itemType: item.itemType,
          itemName: item.itemName,
          sku: item.sku || undefined,
          barcode: item.barcode || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: 0, // We don't have cost price in frontend
          itemTaxRate: taxRate,
          itemDiscountType: 'PERCENTAGE',
          itemDiscountRate: 0,
          notes: ''
        })),
        payments: amountPaid > 0 ? [{
          paymentMethod: paymentMethod,
          amount: amountPaid,
          referenceNumber: paymentMethod === 'CARD' ? 'CARD' + Date.now().toString().slice(-4) : undefined,
          notes: saleNotes
        }] : [],
        taxRate: taxRate,
        discountType: discount.type,
        discountValue: discount.value,
        notes: saleNotes,
        isCreditSale: isCreditSale,
        amountPaid: amountPaid,
        totalAmount: totalAmount
      };

      console.log('Creating sale with data:', saleData);

      // Step 1: Create sale (fast operation)
      toast.loading('Processing sale...', { id: 'sale-processing' });
      const response = await apiClient.post('/pos/sales', saleData);
      const sale = response.data;
      console.log('Sale created successfully:', sale);

      // Step 2: Show success message and receipt preview immediately
      toast.success(`Sale completed successfully! Sale #${sale.saleNumber}`, { id: 'sale-processing' });
      setCompletedSale(sale);
      setShowReceiptModal(true);

      // Step 3: Generate receipt in background (non-blocking)
      generateReceiptInBackground(sale.id);
      
      return { sale, receipt: null };
      
    } catch (error: any) {
      console.error('Error creating sale:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to complete sale';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Sale failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsCompletingSale(false);
    }
  };

  // Background receipt generation (non-blocking)
  const generateReceiptInBackground = async (saleId: string) => {
    try {
      console.log('Generating receipt in background for sale:', saleId);
      const receiptResponse = await apiClient.post(`/receipts/generate/${saleId}?format=PDF`);
      const receipt = receiptResponse.data;
      console.log('Receipt generated successfully in background:', receipt);
      
      // Update receipt data when ready
      setReceiptData(receipt);
      toast.success('Receipt generated successfully!');
      
    } catch (receiptError: any) {
      console.error('Error generating receipt in background:', receiptError);
      // Don't show error to user since sale is already complete
      console.log('Receipt generation failed, but sale was completed successfully');
    }
  };

  const generateReceipt = async (saleId: string) => {
    try {
      const receiptResponse = await apiClient.post(`/receipts/generate/${saleId}?format=PDF`);
      const receipt = receiptResponse.data;
      setReceiptData(receipt);
      toast.success('Receipt generated successfully!');
      return receipt;
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt. Please try again.');
      throw error;
    }
  };

  const downloadReceipt = async (receiptId: string) => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receiptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const printReceipt = async (receiptId: string) => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob URL and open in new window for printing
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Failed to print receipt');
    }
  };

  return {
    isCompletingSale,
    showReceiptModal,
    setShowReceiptModal,
    completedSale,
    setCompletedSale,
    receiptData,
    setReceiptData,
    receiptCartItems,
    setReceiptCartItems,
    receiptTotals,
    setReceiptTotals,
    processPayment,
    generateReceipt,
    downloadReceipt,
    printReceipt
  };
};

