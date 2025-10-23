'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Download, RefreshCw, TrendingUp, Users, ShoppingCart, DollarSign, CreditCard, BarChart3, PieChart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface DailySummary {
  date: string;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  paymentMethods: Array<{
    method: string;
    totalAmount: number;
    count: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    salesCount: number;
  }>;
  salesByUser: Array<{
    userId: string;
    totalSales: number;
    transactionCount: number;
    averageValue: number;
  }>;
}

interface SalesByUserReport {
  userId: string;
  userName: string;
  totalSales: number;
  transactionCount: number;
  averageValue: number;
  totalAmount: number;
}

interface TopProductsReport {
  name: string;
  quantity: number;
  revenue: number;
  salesCount: number;
  averagePrice: number;
}

interface HourlySalesReport {
  hour: number;
  sales: number;
  transactions: number;
  averageValue: number;
}

interface PaymentMethodReport {
  method: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export default function POSReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Report data
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [salesByUser, setSalesByUser] = useState<SalesByUserReport[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductsReport[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySalesReport[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodReport[]>([]);

  useEffect(() => {
    loadLocations();
    loadDailySummary();
  }, [selectedDate, selectedLocation]);

  useEffect(() => {
    if (dateRange) {
      loadSalesByUserReport();
      loadTopProductsReport();
      loadHourlySalesReport();
    }
  }, [dateRange, selectedLocation]);

  const loadLocations = async () => {
    try {
      const response = await apiClient.get('/locations');
      const data = response.data;
      setLocations(data.data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadDailySummary = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
        ...(selectedLocation && selectedLocation !== 'all' && { locationId: selectedLocation }),
      });

      const response = await apiClient.get(`/pos/sales/daily-summary?${params}`);
      const data = response.data;
      setDailySummary(data);
    } catch (error) {
      toast.error('Error loading daily summary');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSalesByUserReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange!.from.toISOString().split('T')[0],
        endDate: dateRange!.to.toISOString().split('T')[0],
        ...(selectedLocation && selectedLocation !== 'all' && { locationId: selectedLocation }),
      });

      const response = await apiClient.get(`/pos/reports/sales-by-user?${params}`);
      const data = response.data;
      setSalesByUser(data);
    } catch (error) {
      console.error('Error loading sales by user report:', error);
    }
  };

  const loadTopProductsReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange!.from.toISOString().split('T')[0],
        endDate: dateRange!.to.toISOString().split('T')[0],
        limit: '10',
      });

      const response = await apiClient.get(`/pos/reports/top-products?${params}`);
      const data = response.data;
      setTopProducts(data);
    } catch (error) {
      console.error('Error loading top products report:', error);
    }
  };

  const loadHourlySalesReport = async () => {
    try {
      const params = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
        ...(selectedLocation && selectedLocation !== 'all' && { locationId: selectedLocation }),
      });

      const response = await apiClient.get(`/pos/reports/hourly-sales?${params}`);
      const data = response.data;
      setHourlySales(data);
    } catch (error) {
      console.error('Error loading hourly sales report:', error);
    }
  };

  const loadPaymentMethodsReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange!.from.toISOString().split('T')[0],
        endDate: dateRange!.to.toISOString().split('T')[0],
        ...(selectedLocation && selectedLocation !== 'all' && { locationId: selectedLocation }),
      });

      const response = await apiClient.get(`/pos/reports/payment-methods?${params}`);
      const data = response.data;
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error loading payment methods report:', error);
    }
  };

  const handleExportReport = (reportType: string) => {
    toast.success(`${reportType} report exported successfully`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <DollarSign className="h-4 w-4" />;
      case 'CARD': return <CreditCard className="h-4 w-4" />;
      case 'MOBILE_PAYMENT': return <ShoppingCart className="h-4 w-4" />;
      case 'BANK_TRANSFER': return <BarChart3 className="h-4 w-4" />;
      case 'CHEQUE': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'CARD': return 'Card';
      case 'MOBILE_PAYMENT': return 'Mobile Payment';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CHEQUE': return 'Cheque';
      case 'OTHER': return 'Other';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">POS Reports</h1>
          <p className="text-gray-600">Analytics and insights for your point of sale system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDailySummary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Date</label>
              <Select onValueChange={(value) => {
                const today = new Date();
                switch (value) {
                  case 'today':
                    setSelectedDate(today);
                    setDateRange(undefined);
                    break;
                  case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(yesterday);
                    setDateRange(undefined);
                    break;
                  case 'thisWeek':
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    setDateRange({ from: startOfWeek, to: endOfWeek });
                    setSelectedDate(today);
                    break;
                  case 'thisMonth':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    setDateRange({ from: startOfMonth, to: endOfMonth });
                    setSelectedDate(today);
                    break;
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(new Date());
                  setDateRange(undefined);
                  setSelectedLocation('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary Cards */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(dailySummary.totalSales)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-2xl font-bold">{dailySummary.transactionCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Average Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(dailySummary.averageTransactionValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Top Performer</p>
                  <p className="text-lg font-bold">
                    {dailySummary.salesByUser.length > 0 
                      ? formatCurrency(dailySummary.salesByUser[0].totalSales)
                      : '$0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="users">Sales by User</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Payment Methods</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailySummary?.paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payment data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailySummary?.paymentMethods.map((method, index) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(method.method)}
                          <span className="text-sm font-medium">
                            {getPaymentMethodLabel(method.method)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(method.totalAmount)}</div>
                          <div className="text-sm text-gray-500">{method.count} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailySummary?.topProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No product data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailySummary?.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.quantity} sold • {product.salesCount} transactions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Selling Products</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Top Products')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No product data available for the selected period
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.quantity} units sold • {product.salesCount} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(product.revenue)}</div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(product.averagePrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales by User Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales by User</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Sales by User')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {salesByUser.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No user data available for the selected period
                </div>
              ) : (
                <div className="space-y-4">
                  {salesByUser.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-gray-500">
                            {user.transactionCount} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(user.totalSales)}</div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(user.averageValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods Analysis</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Payment Methods')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment data available for the selected period
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getPaymentMethodIcon(method.method)}
                        <div>
                          <div className="font-medium">{getPaymentMethodLabel(method.method)}</div>
                          <div className="text-sm text-gray-500">
                            {method.count} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(method.totalAmount)}</div>
                        <div className="text-sm text-gray-500">
                          {method.percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hourly Analysis Tab */}
        <TabsContent value="hourly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hourly Sales Analysis</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('Hourly Analysis')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hourlySales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hourly data available for the selected date
                </div>
              ) : (
                <div className="space-y-4">
                  {hourlySales.map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {hour.hour}:00 - {hour.hour + 1}:00
                          </div>
                          <div className="text-sm text-gray-500">
                            {hour.transactions} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(hour.sales)}</div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(hour.averageValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
