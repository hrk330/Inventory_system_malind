'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Package, MapPin, AlertTriangle, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => apiClient.get('/products?status=active').then(res => res.data),
  })

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations').then(res => res.data),
  })

  const { data: stockBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['stock-balances'],
    queryFn: () => apiClient.get('/stock/balances').then(res => res.data),
  })

  const { data: reorderAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['reorder-alerts'],
    queryFn: () => apiClient.get('/reorder/alerts').then(res => res.data),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  })

  const totalProducts = products?.length || 0
  const totalLocations = locations?.length || 0
  const totalStockValue = stockBalances?.reduce((sum: number, balance: any) => sum + balance.quantity, 0) || 0
  const totalAlerts = reorderAlerts?.length || 0

  const stats = [
    {
      name: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Locations',
      value: totalLocations,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Stock Units',
      value: totalStockValue,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Reorder Alerts',
      value: totalAlerts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (productsLoading || locationsLoading || balancesLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Stock Transactions</CardTitle>
            <CardDescription>
              Latest stock movements in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockBalances?.slice(0, 5).map((balance: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {balance.product?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {balance.location?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {balance.quantity} {balance.product?.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reorder Alerts</CardTitle>
            <CardDescription>
              Products that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reorderAlerts?.slice(0, 5).map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.product?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {alert.location?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {alert.quantity} / {alert.product?.reorderLevel}
                    </p>
                    <p className="text-xs text-gray-500">Low Stock</p>
                  </div>
                </div>
              ))}
              {reorderAlerts?.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No reorder alerts at this time
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
