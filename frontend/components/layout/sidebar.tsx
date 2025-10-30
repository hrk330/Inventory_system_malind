'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Package,
  MapPin,
  BarChart3,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Truck,
  ChevronDown,
  ChevronRight,
  Tag,
  Ruler,
  Trash2,
  Plus,
  Upload,
  Menu,
  X,
  CreditCard,
  ShoppingCart,
  Receipt,
  Users,
  RotateCcw,
  LayoutDashboard,
  PackageSearch,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useSidebar } from '@/contexts/sidebar-context'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { 
    name: 'POS', 
    href: '/dashboard/pos', 
    icon: CreditCard,
    hasSubmenu: true,
    submenu: [
      { name: 'Point of Sale', href: '/pos', icon: ShoppingCart },
      { name: 'Sales History', href: '/dashboard/pos/history', icon: Receipt },
      { name: 'Credit Sales', href: '/dashboard/pos/credit-sales', icon: CreditCard },
      { name: 'Reports', href: '/dashboard/pos/reports', icon: BarChart3 },
    ]
  },
  { 
    name: 'Customers', 
    href: '/dashboard/customers', 
    icon: Users,
    hasSubmenu: true,
    submenu: [
      { name: 'Customer List', href: '/dashboard/customers', icon: Users },
      { name: 'Customer Ledger', href: '/dashboard/customers/ledger', icon: FileText },
    ]
  },
  { 
    name: 'Products', 
    href: '/dashboard/products', 
    icon: Package,
    hasSubmenu: true,
        submenu: [
          { name: 'Products', href: '/dashboard/products', icon: Package },
          { name: 'Add Product', href: '/dashboard/products/add', icon: Plus },
          { name: 'Bulk Import', href: '/dashboard/products/bulk-import', icon: Upload },
          { name: 'Import History', href: '/dashboard/products/bulk-import-history', icon: FileText },
          { name: 'Companies', href: '/dashboard/products/companies', icon: Tag },
          { name: 'Categories', href: '/dashboard/products/categories', icon: Tag },
          { name: 'UOMs', href: '/dashboard/products/uoms', icon: Ruler },
          { name: 'Deleted Products', href: '/dashboard/products/deleted', icon: Trash2 },
        ]
  },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
  { 
    name: 'Purchases', 
    href: '/dashboard/purchases', 
    icon: Package,
    hasSubmenu: true,
    submenu: [
      { name: 'Dashboard', href: '/dashboard/purchases/dashboard', icon: LayoutDashboard },
      { name: 'Purchase Orders', href: '/dashboard/purchases', icon: PackageSearch },
      { name: 'Add Purchase', href: '/dashboard/purchases/add', icon: Plus },
      { name: 'Purchase History', href: '/dashboard/purchases/history', icon: History },
      { name: 'Purchase Returns', href: '/dashboard/purchases/returns', icon: RotateCcw },
      { name: 'Return List', href: '/dashboard/purchases/returns/list', icon: RotateCcw },
      { name: 'Purchase Reports', href: '/dashboard/purchases/reports', icon: BarChart3 },
      { name: 'Supplier Ledger', href: '/dashboard/purchases/supplier-ledger', icon: FileText },
    ]
  },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
  { name: 'Stock Balances', href: '/dashboard/balances', icon: ClipboardList },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Stocktake', href: '/dashboard/stocktake', icon: ClipboardList },
  { name: 'Reorder Alerts', href: '/dashboard/reorder', icon: AlertTriangle },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggleSidebar } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<string[]>(['POS', 'Products', 'Purchases'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemActive = (item: any) => {
    if (item.hasSubmenu) {
      return item.submenu.some((subItem: any) => pathname === subItem.href)
    }
    return pathname === item.href
  }

  const isSubItemActive = (subItem: any) => {
    return pathname === subItem.href
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-black/20 backdrop-blur-xl border-r border-white/10 px-6 pb-4 shadow-2xl scrollbar-hide">
          <div className="flex h-20 shrink-0 items-center justify-center px-4">
            <div className="flex items-center justify-center w-full">
              {/* Logo - Clickable */}
              <Link href="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
                <div className="relative h-16 w-40 flex-shrink-0 bg-white rounded-xl p-3 shadow-lg border-2 border-green-400/30">
            <Image
              src="/images/logo.png"
              alt="Malind Tech Logo"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              priority
            />
                </div>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden absolute right-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = isItemActive(item)
                  const isExpanded = expandedItems.includes(item.name)
                  
                  return (
                    <li key={item.name}>
                      {item.hasSubmenu ? (
                        <div>
                          <button
                            onClick={() => {
                              if (isOpen) {
                                toggleExpanded(item.name)
                              } else {
                                // When collapsed, navigate to the main page
                                router.push(item.href)
                              }
                            }}
                            title={!isOpen ? `Go to ${item.name}` : undefined}
                            className={cn(
                              isActive
                                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                : 'text-gray-300 hover:text-green-400 hover:bg-white/10',
                              'group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-300 backdrop-blur-sm'
                            )}
                          >
                            <item.icon
                              className={cn(
                                isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400',
                                'h-6 w-6 shrink-0 transition-colors duration-300'
                              )}
                              aria-hidden="true"
                            />
                            <span className={cn(
                              "flex-1 text-left transition-opacity duration-300",
                              isOpen ? "opacity-100" : "opacity-0 lg:hidden"
                            )}>{item.name}</span>
                            <div className={cn(
                              "transition-opacity duration-300",
                              isOpen ? "opacity-100" : "opacity-0 lg:hidden"
                            )}>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                          {isExpanded && isOpen && (
                            <ul className="mt-1 space-y-1 ml-6">
                              {item.submenu.map((subItem: any) => {
                                const isSubActive = isSubItemActive(subItem)
                                return (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.href}
                                      className={cn(
                                        isSubActive
                                          ? 'bg-green-500/10 text-green-400 font-medium border-l-2 border-green-400'
                                          : 'text-gray-400 hover:text-green-400 hover:bg-white/5',
                                        'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm transition-all duration-300'
                                      )}
                                    >
                                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                      {subItem.name}
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                              : 'text-gray-300 hover:text-green-400 hover:bg-white/10',
                            'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-300 backdrop-blur-sm'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400',
                              'h-6 w-6 shrink-0 transition-colors duration-300'
                            )}
                            aria-hidden="true"
                          />
                          <span className={cn(
                            "transition-opacity duration-300",
                            isOpen ? "opacity-100" : "opacity-0 lg:hidden"
                          )}>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl p-3 transition-all duration-300"
                onClick={() => {
                  // Clear POS session data before logout
                  sessionStorage.removeItem('pos-selected-location');
                  sessionStorage.removeItem('pos-session-id');
                  sessionStorage.removeItem('pos-session-location');
                  sessionStorage.removeItem('pos-last-session');
                  // Then logout
                  signOut({ callbackUrl: '/auth/login' });
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isOpen ? "opacity-100" : "opacity-0 lg:hidden"
                )}>Sign out</span>
              </Button>
            </li>
          </ul>
        </nav>
        </div>
      </div>
    </>
  )
}
