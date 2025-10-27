'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/hooks/pos/useCart';

interface CartItemsProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  editingQuantities: {[key: string]: string};
  onQuantityEdit: (itemId: string, value: string) => void;
  onQuantityEditFocus: (itemId: string, value: string) => void;
  onQuantityEditBlur: (itemId: string, value: string) => void;
  onQuantityEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => void;
  getProductStockQuantity?: (product: any) => number;
  products?: any[];
}

export default function CartItems({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  editingQuantities,
  onQuantityEdit,
  onQuantityEditFocus,
  onQuantityEditBlur,
  onQuantityEditKeyDown,
  getProductStockQuantity,
  products
}: CartItemsProps) {
  return (
    <div className="h-80 overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-50">
            <th className="text-left py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">Item Name</th>
            <th className="text-center py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">QTY</th>
            <th className="text-right py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">Retail</th>
            <th className="text-right py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">Discount</th>
            <th className="text-right py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">Unit Price</th>
            <th className="text-right py-2 px-2 text-xs text-gray-900 font-semibold border-r border-gray-200">Total Price</th>
            <th className="text-center py-2 px-2 text-xs text-gray-900 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            // Get stock information for products
            let availableStock = null;
            let isAtStockLimit = false;
            
            if (item.itemType === 'PRODUCT' && item.productId && getProductStockQuantity && products) {
              const product = products.find(p => p.id === item.productId);
              if (product) {
                availableStock = getProductStockQuantity(product);
                isAtStockLimit = item.quantity >= availableStock;
              }
            }
            
            return (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-2 text-xs text-gray-900 border-r border-gray-200 font-medium">
                {item.itemName}
                {availableStock !== null && (
                  <div className="text-xs text-gray-500 mt-1">
                    Stock: {availableStock}
                  </div>
                )}
              </td>
              <td className="py-2 px-2 text-center border-r border-gray-200">
                <div className="flex items-center justify-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-5 w-5 p-0 border-gray-300 hover:bg-gray-100"
                  >
                    <Minus className="h-2 w-2" />
                  </Button>
                  <Input
                    type="number"
                    value={editingQuantities[item.id] !== undefined ? editingQuantities[item.id] : item.quantity.toString()}
                    onChange={(e) => onQuantityEdit(item.id, e.target.value)}
                    onFocus={() => onQuantityEditFocus(item.id, item.quantity.toString())}
                    onBlur={() => onQuantityEditBlur(item.id, editingQuantities[item.id] || item.quantity.toString())}
                    onKeyDown={(e) => onQuantityEditKeyDown(e, item.id)}
                    className="w-12 h-6 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    max={availableStock || undefined}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isAtStockLimit}
                    className={`h-5 w-5 p-0 border-gray-300 hover:bg-gray-100 ${
                      isAtStockLimit 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    <Plus className="h-2 w-2" />
                  </Button>
                </div>
              </td>
              <td className="py-2 px-2 text-right text-xs text-gray-900 border-r border-gray-200">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-xs text-gray-900 border-r border-gray-200">${item.itemDiscountAmount.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-xs text-gray-900 border-r border-gray-200">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-xs text-gray-900 border-r border-gray-200 font-semibold">${item.lineTotal.toFixed(2)}</td>
              <td className="py-2 px-2 text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-2 w-2" />
                </Button>
              </td>
            </tr>
            );
          })}
          {cartItems.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-500 border-b border-gray-200">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="text-lg font-medium">No items added</p>
                  <p className="text-sm">Add products to start your order</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
