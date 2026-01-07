"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import api from "../lib/api"
import { AuthModal } from "../components/auth-modal"

interface User {
  userId: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  openAuthModal: (view: "login" | "register", redirect?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  // We use a separate state for initial loading vs just "checking auth"
  const [isInitialized, setIsInitialized] = useState(!!initialUser);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"login" | "register">("login");
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | undefined>(undefined);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check for existing session on mount
  useEffect(() => {
    // If we already have a user from server, we might skip this or verify in background
    // For now, let's fetch to ensure client-side token is valid/sync if needed
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch (error) {
        // Not authenticated
        // Only fetch failed, but if we had initialUser, maybe session expired?
        // Let's assume if fetch fails, we are logged out.
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };
    
    if (!initialUser) {
        checkAuth();
    } else {
        setIsInitialized(true);
    }
  }, [initialUser]);

  // Handle ?login=true from middleware redirects
  useEffect(() => {
    if (searchParams?.get("login") === "true") {
      const redirectTarget = searchParams.get("redirect") || undefined;
      openAuthModal("login", redirectTarget);
    }
  }, [searchParams]);

  const login = (token: string, userData: User) => {
    // Cookie is set by the server/client logic in api.ts or component
    // But for client state:
    setUser(userData);
    setModalOpen(false);
    
    if (redirectAfterLogin) {
      router.push(redirectAfterLogin);
      setRedirectAfterLogin(undefined);
    } else {
        router.refresh(); // Refresh current route data
    }
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
        setUser(null);
        router.push('/');
        router.refresh();
    } catch (e) {
        console.error(e);
        // Force logout client side anyway
        setUser(null);
    }
  };

  const openAuthModal = (view: "login" | "register", redirect?: string) => {
    setModalView(view);
    setRedirectAfterLogin(redirect);
    setModalOpen(true);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
    setRedirectAfterLogin(undefined);
    
    // If we were forced to login on a protected route and closed the modal,
    // we should probably redirect away or handle it. 
    // Simple check: if route starts with /dashboard or /products/create
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/products/create")) {
       if(!user) router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
      <AuthModal 
        isOpen={modalOpen} 
        onClose={closeAuthModal} 
        initialView={modalView}
        onLoginSuccess={login}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
