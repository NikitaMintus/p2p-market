"use client"

import { Suspense, useEffect } from "react"
import { useAuth } from "../../context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

function RegisterPageInner() {
  const { openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    openAuthModal("register", redirectTo);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(redirectTo);
    }
  }, [openAuthModal, redirectTo, router]);

  return null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
