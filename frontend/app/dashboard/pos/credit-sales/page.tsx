'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CreditCard, 
  DollarSign, 
  User, 
  Calendar,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface CreditSale {
  id: string;
  saleNumber: string;
  saleDate: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    balance: number;
  };
  location: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string;
  };
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID';
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL' | 'CREDIT';
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    referenceNumber?: string;
    notes?: string;
  }>;
  createdAt: string;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'MOBILE_PAYMENT' | 'OTHER';
  referenceNumber: string;
  notes: string;
}

export default function CreditSalesPage() {
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<CreditSale | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: 0,
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalCreditSales: 0,
    totalOutstanding: 0,
    totalCollected: 0,
    averageOutstanding: 0,
  });

  useEffect(() => {
    loadCreditSales();
  }, [currentPage, searchTerm, dateRange, statusFilter, customerFilter]);

  const loadCreditSales = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        statuses: statusFilter === 'all' ? 'CREDIT,PARTIAL' : statusFilter, // Filter by status
        ...(searchTerm && { saleNumber: searchTerm }),
        ...(dateRange?.from && { startDate: dateRange.from.toISOString().split('T')[0] }),
        ...(dateRange?.to && { endDate: dateRange.to.toISOString().split('T')[0] }),
        ...(customerFilter && customerFilter !== 'all' && { customerId: customerFilter }),
      });

      const response = await apiClient.get(`/pos/sales?${params}`);
      const data = response.data;
      
      // Filter for credit sales and calculate outstanding balances
      const creditSalesData = (data.data || []).map((sale: any) => ({
        ...sale,
        outstandingBalance: Number(sale.totalAmount) - Number(sale.amountPaid || 0),
        customer: {
          ...sale.customer,
          balance: Number(sale.customer.balance || 0),
        },
        totalAmount: Number(sale.totalAmount),
        amountPaid: Number(sale.amountPaid || 0),
      })).filter((sale: any) => {
        // Only include sales that have outstanding balance AND are not cancelled/refunded
        return sale.outstandingBalance > 0 && 
               sale.status !== 'CANCELLED' && 
               sale.status !== 'REFUNDED';
      });
      
      setCreditSales(creditSalesData);
      setTotalPages(data.meta?.totalPages || 1);
      
      // Calculate summary stats
      const totalOutstanding = creditSalesData.reduce((sum: any, sale: any) => sum + sale.outstandingBalance, 0);
      const totalCollected = creditSalesData.reduce((sum: any, sale: any) => sum + (sale.amountPaid || 0), 0);
      
      setSummaryStats({
        totalCreditSales: creditSalesData.length,
        totalOutstanding,
        totalCollected,
        averageOutstanding: creditSalesData.length > 0 ? totalOutstanding / creditSalesData.length : 0,
      });
    } catch (error: any) {
      console.error('Error loading credit sales:', error);
      toast.error(error.response?.data?.message || 'Error loading credit sales');
      
      // Set empty data on error
      setCreditSales([]);
      setSummaryStats({
        totalCreditSales: 0,
        totalOutstanding: 0,
        totalCollected: 0,
        averageOutstanding: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = (sale: CreditSale) => {
    // Check if sale is cancelled or refunded
    if (sale.status === 'CANCELLED' || sale.status === 'REFUNDED') {
      toast.error('Cannot add payment to cancelled or refunded sale');
      return;
    }

    setSelectedSale(sale);
    setPaymentForm({
      amount: 0,
      paymentMethod: 'CASH',
      referenceNumber: '',
      notes: ''
    });
    setShowPaymentDialog(true);
  };

  const handleViewDetails = (sale: CreditSale) => {
    console.log('🔍 Viewing sale with payments:', {
      saleId: sale.id,
      saleNumber: sale.saleNumber,
      payments: sale.payments,
      paymentsCount: sale.payments?.length || 0,
      amountPaid: sale.amountPaid,
      totalAmount: sale.totalAmount
    });
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedSale || paymentForm.amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (paymentForm.amount > selectedSale.outstandingBalance) {
      toast.error('Payment amount cannot exceed outstanding balance');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      const response = await apiClient.post(`/pos/sales/${selectedSale.id}/payments`, {
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber || undefined,
        notes: paymentForm.notes || undefined,
      });

      toast.success('Payment added successfully');
      setShowPaymentDialog(false);
      loadCreditSales(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error processing payment');
      console.error(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'CREDIT': 'destructive',
      'PARTIAL': 'secondary',
      'COMPLETED': 'default',
      'CANCELLED': 'destructive',
      'REFUNDED': 'outline',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PAID': 'default',
      'PENDING': 'destructive',
      'PARTIAL': 'secondary',
      'REFUNDED': 'destructive',
      'CANCELLED': 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Credit Sales Management</h1>
          <p className="text-gray-300">Manage credit sales and outstanding payments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadCreditSales}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Credit Sales</p>
                <p className="text-2xl font-bold">{summaryStats.totalCreditSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.averageOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Sale number, customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow all standard text input keys
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'ArrowUp' ||
                      e.key === 'ArrowDown' ||
                      e.key === 'Tab' ||
                      e.key === 'Enter' ||
                      e.key.length === 1 // Allow any single character
                    ) {
                      return;
                    }
                    e.preventDefault();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setDateRange(undefined);
                  setStatusFilter('all');
                  setCustomerFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Credit Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading credit sales...</p>
            </div>
          ) : creditSales.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No outstanding credit sales found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale Number</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Sale Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.saleNumber}</div>
                        <div className="text-sm text-gray-500">{sale.location.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(sale.saleDate)}</div>
                          <div className="text-gray-500">
                            {new Date(sale.saleDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sale.customer.name}</div>
                          {sale.customer.email && (
                            <div className="text-sm text-gray-500">{sale.customer.email}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            Balance: {formatCurrency(sale.customer.balance)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.totalAmount)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(sale.amountPaid)}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(sale.outstandingBalance)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(sale.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sale.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPayment(sale)}
                            disabled={sale.outstandingBalance <= 0 || sale.status === 'CANCELLED' || sale.status === 'REFUNDED'}
                            title={sale.status === 'CANCELLED' || sale.status === 'REFUNDED' ? 'Cannot add payment to cancelled/refunded sale' : 'Add Payment'}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Payment
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(sale)}
                            title="View Sale Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-lg text-white">Sale Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sale Number</span>
                    <p className="text-sm font-mono text-gray-200 bg-gray-700 px-2 py-1 rounded border border-gray-600">{selectedSale.saleNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Customer</span>
                    <p className="text-sm font-medium text-gray-200">{selectedSale.customer.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Amount</span>
                    <p className="text-sm font-semibold text-gray-200">{formatCurrency(selectedSale.totalAmount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Amount Paid</span>
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(selectedSale.amountPaid)}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Outstanding Balance</span>
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-xl font-bold text-red-400">{formatCurrency(selectedSale.outstandingBalance)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Payment Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedSale.outstandingBalance}
                      value={paymentForm.amount || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        setPaymentForm({ ...paymentForm, amount: value });
                      }}
                      onKeyDown={(e) => {
                        // Allow backspace, delete, arrow keys, and number keys
                        if (
                          e.key === 'Backspace' ||
                          e.key === 'Delete' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'ArrowUp' ||
                          e.key === 'ArrowDown' ||
                          e.key === 'Tab' ||
                          e.key === 'Enter' ||
                          /[0-9]/.test(e.key) ||
                          e.key === '.'
                        ) {
                          return;
                        }
                        e.preventDefault();
                      }}
                      placeholder="Enter payment amount"
                      className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Maximum: {formatCurrency(selectedSale.outstandingBalance)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: selectedSale.outstandingBalance })}
                        className="text-xs h-6 px-2"
                      >
                        Fill Max
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select 
                      value={paymentForm.paymentMethod} 
                      onValueChange={(value: any) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    onKeyDown={(e) => {
                      // Allow all standard text input keys
                      if (
                        e.key === 'Backspace' ||
                        e.key === 'Delete' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'Tab' ||
                        e.key === 'Enter' ||
                        e.key.length === 1 // Allow any single character
                      ) {
                        return;
                      }
                      e.preventDefault();
                    }}
                    placeholder="Optional reference number"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    onKeyDown={(e) => {
                      // Allow all standard text input keys including Enter for multiline
                      if (
                        e.key === 'Backspace' ||
                        e.key === 'Delete' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'Tab' ||
                        e.key === 'Enter' ||
                        e.key.length === 1 // Allow any single character
                      ) {
                        return;
                      }
                      e.preventDefault();
                    }}
                    placeholder="Optional payment notes"
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isProcessingPayment}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment || paymentForm.amount <= 0 || paymentForm.amount > selectedSale.outstandingBalance}
                  className="w-full sm:w-auto"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Sale Details - {selectedSale?.saleNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sale Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Number:</span>
                      <span className="font-medium">{selectedSale.saleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">
                        {formatDate(selectedSale.saleDate)} {new Date(selectedSale.saleDate).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedSale.location.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium">{selectedSale.creator.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Status:</span>
                      <Badge variant={selectedSale.status === 'CREDIT' ? 'destructive' : 'secondary'}>
                        {selectedSale.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge variant={selectedSale.paymentStatus === 'PENDING' ? 'destructive' : 'secondary'}>
                        {selectedSale.paymentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedSale.customer.name}</span>
                    </div>
                    {selectedSale.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedSale.customer.email}</span>
                      </div>
                    )}
                    {selectedSale.customer.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedSale.customer.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className={`font-medium ${selectedSale.customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(selectedSale.customer.balance)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(selectedSale.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedSale.amountPaid || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Amount Paid</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedSale.outstandingBalance)}
                      </div>
                      <div className="text-sm text-gray-600">Outstanding Balance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSale.payments && selectedSale.payments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSale.payments.map((payment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{payment.paymentMethod}</div>
                            {payment.referenceNumber && (
                              <div className="text-sm text-gray-600 dark:text-gray-300">Ref: {payment.referenceNumber}</div>
                            )}
                            {payment.notes && (
                              <div className="text-sm text-gray-600 dark:text-gray-300">{payment.notes}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(payment.paymentDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p>No payments recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAddPayment(selectedSale);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
