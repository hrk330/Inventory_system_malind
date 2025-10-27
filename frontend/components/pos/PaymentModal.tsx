'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessPayment: (paymentData: {
    method: string;
    amount: number;
    notes: string;
  }) => Promise<void>;
  totalAmount: number;
  isProcessing: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onProcessPayment,
  totalAmount,
  isProcessing
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [amountPaid, setAmountPaid] = useState(0);
  const [changeGiven, setChangeGiven] = useState(0);
  const [saleNotes, setSaleNotes] = useState('');

  // Calculate change when amount paid changes
  useEffect(() => {
    if (amountPaid >= totalAmount) {
      setChangeGiven(amountPaid - totalAmount);
    } else {
      setChangeGiven(0);
    }
  }, [amountPaid, totalAmount]);

  const handleSubmit = async () => {
    if (amountPaid < totalAmount) {
      return;
    }

    await onProcessPayment({
      method: paymentMethod,
      amount: amountPaid,
      notes: saleNotes
    });
  };

  const handleClose = () => {
    setAmountPaid(0);
    setChangeGiven(0);
    setSaleNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
            <p className="text-sm text-gray-600 mt-1">Total Amount: ${totalAmount.toFixed(2)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Amount Paid</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={amountPaid === 0 ? '' : amountPaid}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setAmountPaid(0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      setAmountPaid(numValue);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && amountPaid >= totalAmount) {
                    handleSubmit();
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={() => setAmountPaid(totalAmount)}
                variant="outline"
                className="px-3"
                title="Set exact amount (Enter key)"
              >
                Exact
              </Button>
            </div>
          </div>

          {/* Change Given */}
          {changeGiven > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800">Change Given:</span>
                <span className="text-lg font-bold text-green-900">${changeGiven.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Sale Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sale Notes (Optional)</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Add notes for this sale..."
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 py-2 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={amountPaid < totalAmount || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-2"
          >
            {isProcessing ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </div>
    </div>
  );
}
