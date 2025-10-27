'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Discount } from '@/hooks/pos/useCart';

interface OrderSummaryProps {
  subtotal: number;
  discount: Discount;
  onDiscountChange: (discount: Discount) => void;
  totalAmount: number;
  onCompleteSale: () => void;
  isCompletingSale: boolean;
  cartItemsCount: number;
}

export default function OrderSummary({
  subtotal,
  discount,
  onDiscountChange,
  totalAmount,
  onCompleteSale,
  isCompletingSale,
  cartItemsCount
}: OrderSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs text-gray-900">Order Total:</span>
        <span className="text-xs text-gray-900">${Number(subtotal || 0).toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-gray-900">Discount:</span>
        <Input 
          type="number" 
          className="w-20 text-right" 
          value={discount.value}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            onDiscountChange({
              ...discount,
              value,
              amount: discount.type === 'PERCENTAGE' ? (subtotal * value / 100) : value
            });
          }}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="discountType" 
            checked={discount.type === 'FIXED'}
            onChange={() => onDiscountChange({ ...discount, type: 'FIXED' })}
            className="mr-2"
          />
          <span className="text-gray-900">Cash</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="discountType" 
            checked={discount.type === 'PERCENTAGE'}
            onChange={() => onDiscountChange({ ...discount, type: 'PERCENTAGE' })}
            className="mr-2"
          />
          <span className="text-gray-900">%age</span>
        </label>
        <span className="text-gray-900">${Number(discount.amount || 0).toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-gray-900">Pre. Balance:</span>
        <span className="text-xs text-gray-900">$0.00</span>
      </div>
      
      <div className="flex justify-between text-blue-600 font-semibold">
        <span className="text-xs">Net Payable:</span>
        <span className="text-xs">${Number(totalAmount || 0).toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-red-600">
        <span className="text-xs">Paid:</span>
        <span className="text-xs">$0.00</span>
      </div>
      
      <div className="flex justify-between text-blue-600">
        <span className="text-xs">Balance:</span>
        <span className="text-xs">$0.00</span>
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
