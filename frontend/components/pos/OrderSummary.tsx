'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Discount } from '@/hooks/pos/useCart';

interface OrderSummaryProps {
  subtotal: number;
  discount: Discount;
  onDiscountChange: (discount: Discount) => void;
  totalAmount: number;
  taxAmount: number;
  taxRate: number;
  onTaxRateChange: (taxRate: number) => void;
  onCompleteSale: () => void;
  isCompletingSale: boolean;
  cartItemsCount: number;
}

export default function OrderSummary({
  subtotal,
  discount,
  onDiscountChange,
  totalAmount,
  taxAmount,
  taxRate,
  onTaxRateChange,
  onCompleteSale,
  isCompletingSale,
  cartItemsCount
}: OrderSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs text-gray-900">Subtotal:</span>
        <span className="text-xs text-gray-900">${Number(subtotal || 0).toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-gray-900">Discount:</span>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            className="w-16 text-right text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            value={discount.value || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
              onDiscountChange({
                ...discount,
                value,
                amount: discount.type === 'PERCENTAGE' ? (subtotal * value / 100) : value
              });
            }}
            onKeyDown={(e) => {
              // Allow backspace, delete, arrow keys, and number keys
              if (e.key === 'Backspace' || e.key === 'Delete' || 
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                  e.key === 'Tab' || e.key === 'Enter' ||
                  /[0-9.]/.test(e.key)) {
                return;
              }
              e.preventDefault();
            }}
          />
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="discountType" 
                checked={discount.type === 'FIXED'}
                onChange={() => onDiscountChange({ ...discount, type: 'FIXED' })}
                className="mr-1"
              />
              <span className="text-xs text-gray-900">$</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="discountType" 
                checked={discount.type === 'PERCENTAGE'}
                onChange={() => onDiscountChange({ ...discount, type: 'PERCENTAGE' })}
                className="mr-1"
              />
              <span className="text-xs text-gray-900">%</span>
            </label>
          </div>
        </div>
      </div>
      
      {discount.amount > 0 && (
        <div className="flex justify-between text-green-600">
          <span className="text-xs">Discount Amount:</span>
          <span className="text-xs">-${Number(discount.amount || 0).toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-900">Tax:</span>
          <Input 
            type="number" 
            className="w-12 text-right text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            value={taxRate || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
              onTaxRateChange(value);
            }}
            onKeyDown={(e) => {
              // Allow backspace, delete, arrow keys, and number keys
              if (e.key === 'Backspace' || e.key === 'Delete' || 
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                  e.key === 'Tab' || e.key === 'Enter' ||
                  /[0-9.]/.test(e.key)) {
                return;
              }
              e.preventDefault();
            }}
            min="0"
            max="100"
            step="0.1"
          />
          <span className="text-xs text-gray-900">%</span>
        </div>
        <span className="text-xs text-gray-900">${Number(taxAmount || 0).toFixed(2)}</span>
      </div>
      
      <div className="border-t border-gray-300 pt-2">
        <div className="flex justify-between text-blue-600 font-semibold">
          <span className="text-sm">Total Amount:</span>
          <span className="text-sm">${Number(totalAmount || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-900 mb-1">Note</label>
        <Input placeholder="Note" />
      </div>
      
      <div className="mt-6">
        <Button 
          onClick={onCompleteSale}
          disabled={cartItemsCount === 0 || isCompletingSale}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCompletingSale ? 'Processing...' : 'Complete'}
        </Button>
      </div>
    </div>
  );
}
