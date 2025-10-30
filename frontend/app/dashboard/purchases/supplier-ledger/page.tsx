'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Package,
  RotateCcw,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useSupplierLedger, useExportSupplierLedger } from '@/hooks/useSupplierLedger'

interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

interface LedgerEntry {
  id: string
  date: string
  type: 'PURCHASE' | 'RETURN' | 'PAYMENT'
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

interface SupplierLedger {
  supplier: Supplier
  summary: {
    totalPurchases: number
    totalPaid: number
    totalReturns: number
    currentBalance: number
    totalTransactions: number
  }
  ledger: LedgerEntry[]
}

export default function SupplierLedgerPage() {
  const router = useRouter()
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<{ data: Supplier[] }> => {
      const response = await apiClient.get('/suppliers')
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch supplier ledger
  const { data: ledger, isLoading, error } = useSupplierLedger(selectedSupplierId, { startDate, endDate })

  // Export mutation
  const exportMutation = useExportSupplierLedger()

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!selectedSupplierId) return

    exportMutation.mutate({
      supplierId: selectedSupplierId,
      format,
      params: { startDate, endDate }
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'RETURN':
        return <RotateCcw className="h-4 w-4 text-orange-500" />
      case 'PAYMENT':
        return <DollarSign className="h-4 w-4 text-green-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-blue-400'
      case 'RETURN':
        return 'text-orange-400'
      case 'PAYMENT':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading supplier ledger: {error.message}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Supplier Ledger</h1>
          <p className="text-gray-400">Financial tracking and payment history for suppliers</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedSupplierId || "none"} onValueChange={(value) => setSelectedSupplierId(value === "none" ? "" : value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a supplier</SelectItem>
                {suppliers?.data?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={!selectedSupplierId}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={!selectedSupplierId}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSupplierId ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Select a Supplier</h3>
            <p className="text-gray-400">Choose a supplier from the dropdown above to view their ledger</p>
          </CardContent>
        </Card>
      ) : ledger ? (
        <>
          {/* Supplier Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Supplier Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{ledger.supplier.name}</h3>
                  <div className="space-y-2 text-sm">
                    {ledger.supplier.contactPerson && (
                      <div className="flex items-center text-gray-300">
                        <User className="h-4 w-4 mr-2" />
                        {ledger.supplier.contactPerson}
                      </div>
                    )}
                    {ledger.supplier.email && (
                      <div className="flex items-center text-gray-300">
                        <Mail className="h-4 w-4 mr-2" />
                        {ledger.supplier.email}
                      </div>
                    )}
                    {ledger.supplier.phone && (
                      <div className="flex items-center text-gray-300">
                        <Phone className="h-4 w-4 mr-2" />
                        {ledger.supplier.phone}
                      </div>
                    )}
                    {ledger.supplier.address && (
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        {ledger.supplier.address}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Purchases:</span>
                      <span className="text-white">${ledger.summary.totalPurchases.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Paid:</span>
                      <span className="text-white">${ledger.summary.totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Returns:</span>
                      <span className="text-white">${ledger.summary.totalReturns.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-400 font-semibold">Current Balance:</span>
                      <span className={`font-semibold ${ledger.summary.currentBalance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        ${ledger.summary.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Purchases</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.totalPurchases.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-100">Total Paid</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.totalPaid.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <RotateCcw className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-100">Total Returns</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.totalReturns.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 ${ledger.summary.currentBalance >= 0 ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/80">Current Balance</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.currentBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction Ledger</CardTitle>
              <CardDescription className="text-gray-400">
                Showing {ledger.ledger.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Reference</TableHead>
                      <TableHead className="text-gray-300">Description</TableHead>
                      <TableHead className="text-gray-300 text-right">Debit</TableHead>
                      <TableHead className="text-gray-300 text-right">Credit</TableHead>
                      <TableHead className="text-gray-300 text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.ledger.map((entry: any) => (
                      <TableRow key={entry.id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-gray-300">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(entry.type)}
                            <span className={getTypeColor(entry.type)}>
                              {entry.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {entry.reference}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? (
                            <span className="text-red-400 font-semibold">
                              ${entry.debit.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? (
                            <span className="text-green-400 font-semibold">
                              ${entry.credit.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${entry.balance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ${entry.balance.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
