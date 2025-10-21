'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiClient } from '@/lib/api-client'
import { Plus, ArrowUpDown, ArrowDown, ArrowUp, RotateCcw, FileText } from 'lucide-react'
import TransactionReceipt from '@/components/receipts/TransactionReceipt'

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['stock-transactions'],
    queryFn: () => apiClient.get('/stock/transactions').then(res => res.data),
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return <ArrowDown className="h-4 w-4 text-green-600" />
      case 'ISSUE':
        return <ArrowUp className="h-4 w-4 text-red-600" />
      case 'TRANSFER':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      case 'ADJUSTMENT':
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'text-green-600 bg-green-100'
      case 'ISSUE':
        return 'text-red-600 bg-red-100'
      case 'TRANSFER':
        return 'text-blue-600 bg-blue-100'
      case 'ADJUSTMENT':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-green-400 bg-green-500/20 border border-green-400/30'
    }
  }

  const handleViewReceipt = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsReceiptOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Stock Transactions</h1>
            <p className="mt-1 text-lg text-gray-300">
              View and manage all stock movements
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            All stock movements in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(transactions?.data || transactions || [])?.map((transaction: any) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.product.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTransactionColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {transaction.referenceNo && `Ref: ${transaction.referenceNo}`}
                        {transaction.remarks && ` • ${transaction.remarks}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {transaction.quantity} {transaction.product.unit}
                    </div>
                    <div className="text-sm text-gray-300">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {(transaction.fromLocation || transaction.toLocation) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {transaction.fromLocation && (
                      <span>From: {transaction.fromLocation.name}</span>
                    )}
                    {transaction.fromLocation && transaction.toLocation && (
                      <span className="mx-2">→</span>
                    )}
                    {transaction.toLocation && (
                      <span>To: {transaction.toLocation.name}</span>
                    )}
                  </div>
                )}
                
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReceipt(transaction)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {(transactions?.data || transactions || [])?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-300">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionReceipt 
              transaction={selectedTransaction} 
              onClose={() => setIsReceiptOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
