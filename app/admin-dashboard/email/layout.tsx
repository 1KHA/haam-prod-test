'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  FileText,
  Bell,
  Send,
  Calendar,
  BarChart3,
} from 'lucide-react';

const emailNavItems = [
  {
    name: 'الإعدادات',
    href: '/admin-dashboard/email/settings',
    icon: Settings,
  },
  {
    name: 'القوالب',
    href: '/admin-dashboard/email/templates',
    icon: FileText,
  },
  {
    name: 'السيناريوهات',
    href: '/admin-dashboard/email/scenarios',
    icon: Bell,
  },
  {
    name: 'إرسال بريد',
    href: '/admin-dashboard/email/send',
    icon: Send,
  },
  {
    name: 'الحملات المجدولة',
    href: '/admin-dashboard/email/scheduled',
    icon: Calendar,
  },
  {
    name: 'التحليلات',
    href: '/admin-dashboard/email/analytics',
    icon: BarChart3,
  },
];

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <nav className="border-b">
        <ul className="flex flex-wrap gap-1">
          {emailNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
