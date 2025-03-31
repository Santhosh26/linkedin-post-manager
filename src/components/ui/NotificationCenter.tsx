// src/components/ui/NotificationCenter.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
  metadata: any;
}

export default function NotificationCenter() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Set up a polling interval to check for new notifications
      const interval = setInterval(fetchNotifications, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    try {
      // Updated to use consolidated endpoint
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/all`, { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Notifications Cleared",
        description: "All notifications marked as read.",
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: "Action Failed",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SCHEDULED_POST_FAILED':
        return <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <X className="h-4 w-4" />
        </div>;
      case 'SCHEDULED_POST_PUBLISHED':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <Check className="h-4 w-4" />
        </div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bell className="h-4 w-4" />
        </div>;
    }
  };
  
  if (!session) return null;
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map(notification => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-4 ${notification.read ? '' : 'bg-muted/40'} cursor-default`}
                >
                  <div className="flex w-full">
                    {getNotificationIcon(notification.type)}
                    <div className="ml-3 flex-1">
                      <p className="text-sm">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6 text-primary"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}