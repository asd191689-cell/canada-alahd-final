"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReportsPage() {
  const router = useRouter();
  const [fileNumber, setFileNumber] = useState("");

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
    padding: "32px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
    maxWidth: "760px",
    margin: "0 auto",
  };

  const titleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "30px",
    fontWeight: "bold",
    margin: "0 0 12px 0",
  };

  const textStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.9",
    margin: "0 0 18px 0",
    fontWeight: "500",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "54px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: "16px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
    fontWeight: "600",
    marginBottom: "16px",
  };

  const buttonStyle: React.CSSProperties = {
    background: "#14532d",
    color: "white",
    border: "none",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  };

  return (
    <ProtectedRoute>
      <div style={pageStyle}>
        <AppTopNav
          title="التقارير والطباعة"
          subtitle="الوصول السريع إلى تقرير أي عائلة وحفظه أو طباعته PDF."
        />

        <div style={cardStyle}>
          <h1 style={titleStyle}>تقرير عائلة</h1>
          <p style={textStyle}>
            أدخل رقم الملف ثم انتقل إلى صفحة التقرير المنسقة للطباعة أو الحفظ
            PDF.
          </p>

          <label style={labelStyle}>رقم الملف</label>
          <input
            style={inputStyle}
            value={fileNumber}
            onChange={(e) => setFileNumber(e.target.value)}
            placeholder="مثال: CA-0001"
          />

          <button
            style={buttonStyle}
            onClick={() => {
              if (!fileNumber.trim()) return;
              router.push(`/reports/family/${fileNumber.trim()}`);
            }}
          >
            فتح التقرير
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
