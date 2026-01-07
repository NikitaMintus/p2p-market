"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { User } from "lucide-react"
import { useAuth } from "../context/auth-context"

export function NavbarUser() {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Login or Register"
        onClick={() => openAuthModal("login")}
      >
        <User className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center gap-2"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </Button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg p-1 z-50"
        >
          <Button asChild variant="ghost" className="w-full justify-start" onClick={() => setMenuOpen(false)}>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => { setMenuOpen(false); logout(); }}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
