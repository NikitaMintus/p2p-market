"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './auth-context';

interface NotificationContextType {
  socket: Socket | null;
  notifications: any[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && user) {
      const token = Cookies.get('token');
      if (token) {
        newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000', {
          extraHeaders: {
            Authorization: `Bearer ${token}`
          },
          query: {
              token: token
          }
        });

        newSocket.on('connect', () => {
          console.log('Connected to notification server');
        });

        newSocket.on('notification', (data) => {
          console.log('New notification:', data);
          setNotifications((prev) => [...prev, data]);
          // Simple toast
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
          toast.innerText = data.message;
          document.body.appendChild(toast);
          setTimeout(() => {
              toast.remove();
          }, 5000);
        });

        setSocket(newSocket);
      }
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider value={{ socket, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}



