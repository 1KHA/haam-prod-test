"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Clock, AlertCircle, Info, Calendar, Users, FileCheck, Award, DollarSign, Shield } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/notification-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Type icon mapping
const typeIcons: Record<string, React.ReactNode> = {
  milestone: <FileCheck className="h-4 w-4" />,
  application: <Check className="h-4 w-4" />,
  event: <Calendar className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
  reminder: <Clock className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  funding: <DollarSign className="h-4 w-4" />,
  mentorship: <Award className="h-4 w-4" />,
};

// Priority colors
const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

// Priority badge variants
const priorityVariants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onActionClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onActionClick }: NotificationItemProps) {
  const icon = typeIcons[notification.type] || <Info className="h-4 w-4" />;
  
  // Use Arabic by default, fallback to English if needed
  const title = notification.title;
  const message = notification.message;
  const actionLabel = notification.actionLabel || 'عرض';

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer text-right",
        notification.isRead 
          ? "bg-muted/50 hover:bg-muted" 
          : "bg-primary/5 hover:bg-primary/10 border-r-2 border-primary"
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        notification.isRead ? "bg-muted" : "bg-primary/10"
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge 
            variant={priorityVariants[notification.priority] || 'secondary'}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {notification.priority === 'high' ? 'عالي' : notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
          </Badge>
          <h4 className="text-sm font-medium truncate">{title}</h4>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          
          {/* Action Button */}
          {notification.actionUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(notification);
              }}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className={cn(
          "flex-shrink-0 w-2 h-2 rounded-full mt-2",
          priorityColors[notification.priority] || 'bg-blue-500'
        )} />
      )}
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setOpen(false);
  };

  const criticalNotifications = notifications.filter(
    (n) => n.priority === 'high' && !n.isRead
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant={criticalNotifications.length > 0 ? 'destructive' : 'default'}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 ml-1" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onActionClick={handleActionClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              router.push('/notifications');
              setOpen(false);
            }}
          >
            عرض كل الإشعارات
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
