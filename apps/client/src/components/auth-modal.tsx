"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import api from "../lib/api"
import { toast } from "sonner"
import Cookies from "js-cookie"

type AuthMode = "login" | "register"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

interface AuthModalProps {
  isOpen: boolean; 
  initialView: AuthMode;
  redirectTo?: string | null;
  onClose: () => void;
  onLoginSuccess?: (token: string, user: any) => void; 
}

export function AuthModal({
  isOpen,
  initialView,
  redirectTo,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialView);

  // Update mode when initialView changes (if modal is re-opened)
  useEffect(() => {
    setMode(initialView);
  }, [initialView, isOpen]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", values);
      
      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      // Set cookie immediately so interceptors work
      Cookies.set("token", token, { expires: 1 });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
      }

      // Get user profile immediately to pass back
      const profileRes = await api.get("/auth/profile");
      
      if (onLoginSuccess) {
          onLoginSuccess(token, profileRes.data);
      } else {
          // Fallback if no handler
          window.location.reload();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      setLoading(true);
      await api.post("/auth/register", values);
      const response = await api.post("/auth/login", { email: values.email, password: values.password });
      
      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      // Set cookie immediately so interceptors work
      Cookies.set("token", token, { expires: 1 });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
      }

      const profileRes = await api.get("/auth/profile");

      if (onLoginSuccess) {
          onLoginSuccess(token, profileRes.data);
      } else {
          window.location.reload();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle>{mode === "login" ? "Login" : "Register"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Enter your credentials to access your account."
              : "Create a new account."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-2">
          <Button
            variant={mode === "login" ? "default" : "outline"}
            className="flex-1"
            onClick={() => switchMode("login")}
          >
            Login
          </Button>
          <Button
            variant={mode === "register" ? "default" : "outline"}
            className="flex-1"
            onClick={() => switchMode("register")}
          >
            Register
          </Button>
        </div>

        {mode === "login" ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
