"use client"

import React, { useState } from 'react';
import { Bell, X, Eye, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import { useNotifications } from '@/contexts/notification-context';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications();

  // State for notification detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  
  // Handle mark as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };
  
  // Handle notification refresh
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };
  
  // Open notification detail dialog
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDetailDialog = (notification: any) => {
    setSelectedNotification(notification);
    setLastViewed(notification.id);
    setDialogOpen(true);
    
    // Mark as read when viewing details
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  // Format date to Arabic
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-400';
      case 'low':
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] max-w-[90vw]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0"
              title="تحديث الإشعارات"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <span>الإشعارات</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={unreadCount === 0}
            className="text-xs"
          >
            تعيين الكل كمقروء
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="h-[400px] overflow-y-auto px-1">
          {notifications.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`mb-2 p-2 rounded-md cursor-pointer hover:bg-accent/50 
                  ${!notification.isRead ? 'bg-muted/70' : lastViewed === notification.id ? 'bg-muted/30 border border-blue-200' : ''}`}
                onClick={() => openDetailDialog(notification)}
              >
                <div className="flex items-start gap-2">
                  <div className={`${getPriorityColor(notification.priority)} w-2 h-2 mt-1.5 rounded-full flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{notification.title}</div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleMarkAsRead(notification.id, e)} 
                            className="h-5 px-1.5 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>قراءة</span>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => openDetailDialog(notification)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/admin-dashboard/notifications';
          }}
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          عرض كل الإشعارات
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      {/* Notification Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] text-right">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <DialogClose className="text-muted-foreground">
                <X className="h-4 w-4" />
              </DialogClose>
              <span>{selectedNotification?.title}</span>
              <div className={`${selectedNotification ? getPriorityColor(selectedNotification.priority) : 'bg-blue-400'} w-3 h-3 rounded-full`} />
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-right">
              {selectedNotification && formatDate(selectedNotification.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="py-4">
              <div className="border-r-2 border-muted-foreground/20 pr-4 py-2 mb-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>النوع:</span>
                  <span className="font-medium">{selectedNotification.type || "عام"}</span>
                </div>
                <div className="flex justify-between">
                  <span>الأولوية:</span>
                  <span className="font-medium">
                    {selectedNotification.priority === 'high' ? 'عالية' : 
                     selectedNotification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الحالة:</span>
                  <span className="font-medium">{selectedNotification.isRead ? 'مقروء' : 'غير مقروء'}</span>
                </div>
                <div className="flex justify-between">
                  <span>المعرف:</span>
                  <span className="font-medium text-xs opacity-50">{selectedNotification.id}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNotification && !selectedNotification.isRead) {
                  markAsRead(selectedNotification.id);
                }
              }}
              disabled={selectedNotification && selectedNotification.isRead}
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              تعيين كمقروء
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Close dialog and redirect to main notifications page
                setDialogOpen(false);
                window.location.href = '/admin-dashboard/notifications';
              }}
            >
              عرض كل الإشعارات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
