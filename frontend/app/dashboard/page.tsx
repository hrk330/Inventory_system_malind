'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Package, MapPin, AlertTriangle, TrendingUp, Activity, Users, BarChart3, Zap } from 'lucide-react'

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => apiClient.get('/products?status=active').then(res => res.data),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: locations, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations').then(res => res.data),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: stockBalances, isLoading: balancesLoading, error: balancesError } = useQuery({
    queryKey: ['stock-balances'],
    queryFn: () => apiClient.get('/stock/balances').then(res => res.data),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: reorderAlerts, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['reorder-alerts'],
    queryFn: () => apiClient.get('/reorder/alerts').then(res => res.data),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const totalProducts = products?.data?.length || products?.length || 0
  const totalLocations = locations?.data?.length || locations?.length || 0
  const totalStockValue = stockBalances?.data?.reduce((sum: number, balance: any) => sum + balance.quantity, 0) || stockBalances?.reduce((sum: number, balance: any) => sum + balance.quantity, 0) || 0
  const totalAlerts = reorderAlerts?.length || 0

  const stats = [
    {
      name: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/30',
      gradient: 'from-blue-500/20 to-blue-600/20',
    },
    {
      name: 'Total Locations',
      value: totalLocations,
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30',
      gradient: 'from-green-500/20 to-green-600/20',
    },
    {
      name: 'Total Stock Units',
      value: totalStockValue,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30',
      gradient: 'from-purple-500/20 to-purple-600/20',
    },
    {
      name: 'Reorder Alerts',
      value: totalAlerts,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/30',
      gradient: 'from-red-500/20 to-red-600/20',
    },
  ]

  // Handle errors
  if (productsError || locationsError || balancesError || alertsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Unable to load dashboard data</h2>
          <p className="text-gray-300 mb-4">There was an error connecting to the server.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (productsLoading || locationsLoading || balancesLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-green-400 border-r-blue-400"></div>
          <div className="absolute inset-0 rounded-full h-32 w-32 border-4 border-transparent border-b-purple-400 border-l-red-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-red-400 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="glass-card p-6 tech-glow mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome to <span className="gradient-text">Malind Tech</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300">
                  Your advanced inventory management dashboard
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">Live</div>
                  <div className="text-xs text-gray-400">System Status</div>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className={`stat-card tech-glow ${stat.borderColor}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 sm:p-3 rounded-2xl ${stat.bgColor} border ${stat.borderColor} backdrop-blur-sm icon-container`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} flex-shrink-0`} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">{stat.name}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center icon-container`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${stat.bgColor} flex items-center justify-center icon-container`}>
                    <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} flex-shrink-0`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="glass-card p-6 tech-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Activity className="h-6 w-6 text-green-400 mr-3" />
                  Recent Stock Transactions
                </h3>
                <p className="text-gray-400 mt-1">Latest stock movements in your system</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="space-y-4">
              {(stockBalances?.data || stockBalances) && (stockBalances?.data?.length || stockBalances?.length) > 0 ? (
                (stockBalances?.data || stockBalances).slice(0, 5).map((balance: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {balance.product?.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {balance.location?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {balance.quantity} {balance.product?.unit}
                      </p>
                      <p className="text-xs text-green-400">Available</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No stock data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 tech-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
                  Reorder Alerts
                </h3>
                <p className="text-gray-400 mt-1">Products that need restocking</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <div className="space-y-4">
              {reorderAlerts && reorderAlerts.length > 0 ? (
                reorderAlerts.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-400/20 hover:bg-red-500/15 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {alert.product?.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {alert.location?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">
                        {alert.quantity} / {alert.product?.reorderLevel}
                      </p>
                      <p className="text-xs text-red-300">Low Stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-gray-400">No reorder alerts at this time</p>
                  <p className="text-xs text-green-400 mt-1">All stock levels are healthy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
