"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("يرجى إدخال اسم المستخدم");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("يرجى إدخال كلمة المرور");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل تسجيل الدخول");
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "28px",
    padding: "36px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
    border: "1px solid #e5e7eb",
  };

  const titleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "38px",
    margin: "0 0 12px 0",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: "1.2",
  };

  const descriptionStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "2",
    margin: "0 0 28px 0",
    fontWeight: "500",
    textAlign: "center",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#374151",
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    padding: "0 16px",
    fontSize: "16px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
    fontWeight: "600",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    height: "58px",
    borderRadius: "16px",
    border: "none",
    background: loading
      ? "#9ca3af"
      : "linear-gradient(135deg, #14532d 0%, #166534 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: "0 12px 24px rgba(20,83,45,0.18)",
    marginTop: "8px",
  };

  const errorStyle: React.CSSProperties = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "16px",
    padding: "14px 16px",
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "1.8",
    marginBottom: "18px",
  };

  const footerBoxStyle: React.CSSProperties = {
    marginTop: "22px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
    textAlign: "center",
  };

  const footerTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 6px 0",
  };

  const footerTextStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "13px",
    lineHeight: "1.9",
    margin: 0,
    fontWeight: "500",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <img
          src="/logo2.png"
          alt="شعار النظام"
          style={{
            width: "110px",
            height: "110px",
            objectFit: "contain",
            display: "block",
            margin: "0 auto 18px auto",
          }}
        />

        <h1 style={titleStyle}>تسجيل الدخول</h1>

        <p style={descriptionStyle}>
          نظام مخيم كندا العهد لإدارة بيانات العائلات والوثائق. أدخل بيانات
          الدخول للانتقال إلى لوحة التحكم ومتابعة العمل داخل النظام.
        </p>

        {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>اسم المستخدم</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={labelStyle}>كلمة المرور</label>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة التحكم"}
          </button>
        </form>

        <div style={footerBoxStyle}>
          <h3 style={footerTitleStyle}>
            جميع الحقوق محفوظة لدى مخيم كندا العهد 2025-2026 م
          </h3>
          <p style={footerTextStyle}>
            مسؤول النظام : إبراهيم العديني || مسؤول المخيم : مهدي الأسطل
          </p>
        </div>
      </div>
    </div>
  );
}
