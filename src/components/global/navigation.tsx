"use client"
import { useState, useEffect } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, Settings, MapPin, Star, MessageSquare, Bell } from "lucide-react"
import { ReactNode } from 'react';

interface NavigationProps {
  children: ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const pathname = usePathname()
  
  // Load collapsed state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setCollapsed(savedState === 'true')
    }
    setIsLoaded(true)
  }, [])

  const toggleSidebar = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div 
        className={cn(
          "flex flex-col h-screen  border-r border-gray-200 transition-all duration-300",
          isLoaded ? (collapsed ? "w-16" : "w-48") : "w-48"
        )}
      >
        <div className="flex items-center p-4 justify-between">
          {(!isLoaded || !collapsed) ? (
            <div className="flex items-center gap-2 font-bold text-2xl text-blue-500">
              ParkSMART
            </div>
          ) : (
            <div className="mx-auto font-bold text-blue-500">
              P
            </div>
          )}
          
          {/* Collapse button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-4 px-3 py-4 flex-grow">
          <NavItem 
            href="/settings" 
            icon={<Settings size={16} />} 
            label="Profile Settings" 
            collapsed={isLoaded && collapsed} 
            pathname={pathname} 
          />
          <NavItem 
            href="/" 
            icon={<MapPin size={16} />} 
            label="Find Car Parks" 
            collapsed={isLoaded && collapsed} 
            pathname={pathname} 
          />
          <NavItem 
            href="/favourites" 
            icon={<Star size={16} />} 
            label="Favourites" 
            collapsed={isLoaded && collapsed} 
            pathname={pathname} 
          />
          <NavItem 
            href="/reviews" 
            icon={<MessageSquare size={16} />} 
            label="Leave A Review" 
            collapsed={isLoaded && collapsed} 
            pathname={pathname} 
          />
          <NavItem 
            href="/notifications" 
            icon={<Bell size={16} />} 
            label="Notifications" 
            collapsed={isLoaded && collapsed} 
            pathname={pathname} 
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  pathname: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, collapsed, pathname, isActive = false }: NavItemProps) {
  // Check if the current path matches the nav item href
  const active = isActive || 
    (href === "/" 
      ? pathname === "/" || pathname === ""
      : pathname && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 transition-colors",
        collapsed ? "justify-center" : "",
        active 
          ? "bg-blue-50 text-blue-500 font-medium" 
          : "hover:bg-gray-100"
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}