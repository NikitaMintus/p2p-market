"use client"

import { Suspense, useEffect } from "react"
import { useAuth } from "../../context/auth-context"
import { useSearchParams, useRouter } from "next/navigation"

function LoginPageInner() {
  const { openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    openAuthModal("login", redirectTo);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(redirectTo);
    }
  }, [openAuthModal, redirectTo, router]);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
