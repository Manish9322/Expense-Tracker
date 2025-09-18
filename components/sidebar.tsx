"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import {
  BarChart2,
  Home,
  ListChecks,
  Settings,
  User,
  CircleDollarSign,
  Menu,
  X,
  FileEdit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Expenses', href: '/expenses', icon: ListChecks },
  { name: 'Manage', href: '/manage', icon: FileEdit },
  { name: 'Visuals', href: '/visuals', icon: BarChart2 },
  { name: 'Users', href: '/users', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

  // Update CSS custom property when collapse state changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 bg-card border-r transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
        // Mobile responsive behavior
        "transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop width based on collapsed state
        isCollapsed ? "md:w-16" : "md:w-64",
        // Mobile always uses full sidebar width
        "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "p-4 border-b flex-shrink-0 overflow-hidden",
          isCollapsed && "md:p-2"
        )}>
          <div className={cn(
            "flex items-center gap-2 font-semibold text-xl",
            isCollapsed && "md:justify-center"
          )}>
            <CircleDollarSign className="h-6 w-6 text-primary flex-shrink-0" />
            <span className={cn(
              "transition-opacity duration-300 whitespace-nowrap",
              isCollapsed && "md:opacity-0 md:w-0 md:overflow-hidden"
            )}>
              Expense Tracker
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={cn(
          "flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden",
          isCollapsed && "md:p-2"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative group overflow-hidden',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && "gap-0 md:justify-center md:px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "transition-opacity duration-300 whitespace-nowrap",
                  isCollapsed && "md:opacity-0 md:w-0 md:overflow-hidden"
                )}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer with controls */}
        <div className={cn(
          "border-t mt-auto flex-shrink-0",
          isCollapsed ? "md:p-2" : "p-4"
        )}>
          {/* Collapse button (desktop only) */}
          <div className={cn(
            "hidden md:flex mb-2",
            isCollapsed ? "justify-center" : "justify-end"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Theme toggle */}
          <div className={cn(
            isCollapsed && "md:flex md:justify-center"
          )}>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}