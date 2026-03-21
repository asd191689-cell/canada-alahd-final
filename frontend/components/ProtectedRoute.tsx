"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router, pathname]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          direction: "rtl",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
            color: "#14532d",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          جاري التحقق من صلاحية الدخول...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
