'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bell, User, Menu } from 'lucide-react'
import { useSidebar } from '@/contexts/sidebar-context'

export function Header() {
  const { data: session } = useSession()
  const { toggleSidebar } = useSidebar()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {session?.user?.name}
              </span>
              <span className="text-xs text-gray-500">
                ({session?.user?.role})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
