'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Settings,
  LogOut,
  BarChart2,
  FileText,
  MessageSquare,
  Shield,
  CreditCard,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Пользователи',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Роли и доступы',
    href: '/admin/roles',
    icon: Shield
  },
  {
    name: 'События',
    href: '/admin/events',
    icon: Home
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen bg-card border-r border-border">
        {/* Логотип */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Админ-панель</h1>
        </div>

        {/* Навигация */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Профиль и выход */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
                <span className="font-medium">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Администратор</p>
              <p className="text-xs font-medium text-muted-foreground">admin@example.com</p>
            </div>
          </div>
          <button className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-destructive font-medium rounded-lg border border-transparent hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}