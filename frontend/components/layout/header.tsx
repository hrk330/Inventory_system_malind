'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bell, User, Menu } from 'lucide-react'
import { useSidebar } from '@/contexts/sidebar-context'

export function Header() {
  const { data: session } = useSession()
  const { toggleSidebar } = useSidebar()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 shadow-2xl sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-green-400 hover:bg-white/10 transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-green-400 hover:bg-white/10 transition-all duration-300">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/20" />

          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <User className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-gray-200">
                {session?.user?.name}
              </span>
              <span className="text-xs text-gray-400">
                ({session?.user?.role})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
