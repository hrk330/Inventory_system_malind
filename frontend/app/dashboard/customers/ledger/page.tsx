'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Search, 
  Download, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  RotateCcw, 
  ArrowLeft,
  Package,
  CreditCard,
  RefreshCw,
  Eye,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomerLedger, useExportCustomerLedger } from '@/hooks/useCustomerLedger';
import { useCustomerLedgerOverview } from '@/hooks/useCustomerLedgerOverview';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customerNumber: string
  address?: string
}

interface LedgerEntry {
  id: string
  date: string
  type: 'SALE' | 'PAYMENT' | 'REFUND'
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

interface CustomerLedger {
  customer: Customer
  summary: {
    totalSales: number
    totalPaid: number
    totalRefunds: number
    currentBalance: number
    totalTransactions: number
  }
  ledger: LedgerEntry[]
}

export default function CustomerLedgerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get('customerId') || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(customerId);

  // Fetch customer ledger overview (all customers)
  const { data: customers, isLoading: isLoadingOverview, error: overviewError } = useCustomerLedgerOverview(searchTerm);
  
  // Fetch specific customer ledger if one is selected
  const { data: ledger, isLoading: isLoadingLedger, error: ledgerError } = useCustomerLedger(selectedCustomer || '', {
    startDate: undefined,
    endDate: undefined,
  });

  const exportMutation = useExportCustomerLedger();

  const handleViewLedger = (customerId: string) => {
    setSelectedCustomer(customerId);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('customerId', customerId);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToOverview = () => {
    setSelectedCustomer(null);
    // Remove customerId from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('customerId');
    window.history.pushState({}, '', url.toString());
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!selectedCustomer) return;
    
    exportMutation.mutate({
      customerId: selectedCustomer,
      format,
      params: { startDate: undefined, endDate: undefined }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-green-500" />
      case 'REFUND':
        return <RotateCcw className="h-4 w-4 text-orange-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'text-blue-400'
      case 'PAYMENT':
        return 'text-green-400'
      case 'REFUND':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const filteredLedger = ledger?.ledger?.filter((entry: LedgerEntry) => 
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Show loading state
  if (isLoadingOverview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading customer ledgers...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (overviewError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading customer ledgers</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // If a specific customer is selected, show their detailed ledger
  if (selectedCustomer && ledger) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToOverview}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Customer Ledger</h1>
                <p className="text-gray-400">Transaction history and payment tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={exportMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={exportMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Customer Information */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="text-white font-medium">{ledger.customer.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{ledger.customer.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white">{ledger.customer.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Customer Number</Label>
                  <p className="text-white font-mono">{ledger.customer.customerNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ShoppingCart className="h-8 w-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Sales</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.totalSales.toFixed(2)}
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
                    <p className="text-sm font-medium text-orange-100">Total Refunds</p>
                    <p className="text-2xl font-semibold text-white">
                      ${ledger.summary.totalRefunds.toFixed(2)}
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

          {/* Transaction Ledger */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Transaction Ledger
                <span className="text-sm font-normal text-gray-400 ml-2">
                  Showing {filteredLedger.length} transactions
                </span>
              </CardTitle>
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
                    {filteredLedger.map((entry: LedgerEntry) => (
                      <TableRow key={entry.id} className="border-gray-700">
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
                        <TableCell className="text-right text-gray-300">
                          {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right text-white font-medium">
                          ${entry.balance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show customer overview (default view)
  if (!customers || customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-6">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Active Customers</h2>
            <p className="text-gray-400 mb-6">
              There are no active customers with ledger data.
            </p>
          </div>
          <div className="space-x-4">
            <Button 
              onClick={() => router.push('/dashboard/customers')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Customers
            </Button>
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalCustomers = customers.length;
  const totalSales = customers.reduce((sum, customer) => sum + customer.totalSales, 0);
  const totalPaid = customers.reduce((sum, customer) => sum + customer.totalPaid, 0);
  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const customersWithBalance = customers.filter(customer => customer.balance > 0).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Customer Ledger Overview</h1>
            <p className="text-gray-400">All active customers and their ledger summaries</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push('/dashboard/customers')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Customers
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-white" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-100">Total Customers</p>
                  <p className="text-2xl font-semibold text-white">{totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-white" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-100">Total Sales</p>
                  <p className="text-2xl font-semibold text-white">${totalSales.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-white" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-100">Total Collected</p>
                  <p className="text-2xl font-semibold text-white">${totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 ${totalOutstanding > 0 ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-white" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/80">Outstanding Balance</p>
                  <p className="text-2xl font-semibold text-white">${totalOutstanding.toFixed(2)}</p>
                  <p className="text-xs text-white/70">{customersWithBalance} customers owe money</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Customers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, phone, or customer number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{customer.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{customer.customerNumber}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.balance > 0 
                      ? 'bg-red-900 text-red-200' 
                      : customer.balance < 0 
                      ? 'bg-green-900 text-green-200'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {customer.balance > 0 ? 'Owes' : customer.balance < 0 ? 'Credit' : 'Paid Up'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-1">
                  {customer.email && (
                    <p className="text-gray-400 text-sm">{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-gray-400 text-sm">{customer.phone}</p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Sales</p>
                    <p className="text-white font-semibold">${customer.totalSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Paid</p>
                    <p className="text-white font-semibold">${customer.totalPaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Balance</p>
                    <p className={`font-semibold ${
                      customer.balance > 0 
                        ? 'text-red-400' 
                        : customer.balance < 0 
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}>
                      ${Math.abs(customer.balance).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Transactions</p>
                    <p className="text-white font-semibold">{customer.transactionCount}</p>
                  </div>
                </div>

                {/* Last Transaction */}
                {customer.lastTransactionDate && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-gray-400 text-xs">Last Transaction</p>
                    <p className="text-white text-sm">
                      {format(new Date(customer.lastTransactionDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleViewLedger(customer.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Detailed Ledger
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
