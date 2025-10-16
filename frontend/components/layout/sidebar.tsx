'use client'

import Link from 'next/link'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useSidebar } from '@/contexts/sidebar-context'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
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
          { name: 'Categories', href: '/dashboard/products/categories', icon: Tag },
          { name: 'UOMs', href: '/dashboard/products/uoms', icon: Ruler },
          { name: 'Deleted Products', href: '/dashboard/products/deleted', icon: Trash2 },
        ]
  },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
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
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products'])

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
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <h1 className={cn(
              "text-xl font-bold text-gray-900 transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 lg:hidden"
            )}>Inventory System</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
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
                                ? 'bg-primary text-primary-foreground'
                                : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <item.icon
                              className={cn(
                                isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-primary',
                                'h-6 w-6 shrink-0'
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
                                          ? 'bg-gray-100 text-gray-900 font-medium'
                                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                                        'group flex items-center gap-x-3 rounded-md px-2 py-1.5 text-sm'
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
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-primary',
                              'h-6 w-6 shrink-0'
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
                className="w-full justify-start"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
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
