"use client";
import { API_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

type AuditItem = {
  id: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  created_at?: string;
  meta?:
    | {
        file_number?: string;
        head_name?: string;
      }
    | string
    | null;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/audit`);
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("خطأ في تحميل سجل التعديلات:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return logs;

    return logs.filter((log) => {
      const action = (log.action || "").toLowerCase();
      const entityType = (log.entity_type || "").toLowerCase();
      const entityId = (log.entity_id || "").toLowerCase();

      let fileNumber = "";
      let headName = "";

      if (log.meta && typeof log.meta === "object") {
        fileNumber = (log.meta.file_number || "").toLowerCase();
        headName = (log.meta.head_name || "").toLowerCase();
      }

      return (
        action.includes(keyword) ||
        entityType.includes(keyword) ||
        entityId.includes(keyword) ||
        fileNumber.includes(keyword) ||
        headName.includes(keyword)
      );
    });
  }, [logs, search]);

  const pageStyle: React.CSSProperties = {
    padding: "32px",
    direction: "rtl",
    background: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  };

  const heroStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
    color: "white",
    padding: "34px",
    borderRadius: "26px",
    marginBottom: "26px",
    boxShadow: "0 18px 40px rgba(20,83,45,0.22)",
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: "40px",
    margin: "0 0 12px 0",
    fontWeight: "bold",
    lineHeight: "1.2",
  };

  const heroTextStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "2",
    margin: 0,
    color: "#ecfdf5",
    fontWeight: "500",
    maxWidth: "900px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "28px",
    margin: "0 0 10px 0",
    fontWeight: "bold",
  };

  const sectionTextStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.9",
    margin: "0 0 18px 0",
    fontWeight: "500",
  };

  const badgeStyle: React.CSSProperties = {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "15px",
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
  };

  const tableWrapStyle: React.CSSProperties = {
    overflowX: "auto",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "white",
  };

  const thStyle: React.CSSProperties = {
    padding: "16px",
    fontSize: "16px",
    background: "#14532d",
    color: "white",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const tdStyle: React.CSSProperties = {
    padding: "16px",
    color: "#111827",
    fontSize: "15px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
  };

  const getEntityTypeLabel = (value?: string) => {
    if (!value) return "-";
    if (value === "family") return "عائلة";
    if (value === "document") return "وثيقة";
    if (value === "member") return "فرد";
    return value;
  };

  const getMetaValue = (
    meta: AuditItem["meta"],
    key: "file_number" | "head_name",
  ) => {
    if (!meta) return "-";
    if (typeof meta === "object") {
      return meta[key] || "-";
    }
    return "-";
  };

  return (
    <ProtectedRoute>
      <div style={pageStyle}>
        <AppTopNav
          title="سجل التعديلات"
          subtitle="مراجعة واضحة لجميع العمليات التي تمت داخل النظام مع الرجوع السريع إلى لوحة التحكم."
        />

        <div style={heroStyle}>
          <h1 style={heroTitleStyle}>سجل التعديلات</h1>
          <p style={heroTextStyle}>
            من هذه الصفحة يمكنك متابعة جميع العمليات التي تمت داخل النظام، مثل
            إضافة العائلات، تعديل الملفات، ورفع أو حذف الوثائق، وذلك لمراجعة
            النشاط داخل النظام بشكل واضح ومنظم.
          </p>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2 style={sectionTitleStyle}>عرض السجلات</h2>
              <p style={sectionTextStyle}>
                يمكنك البحث داخل السجلات باستخدام اسم العملية أو رقم الملف أو
                اسم رب الأسرة أو نوع السجل.
              </p>
            </div>

            <div style={badgeStyle}>عدد السجلات: {filteredLogs.length}</div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <input
              style={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العملية أو رقم الملف أو اسم رب الأسرة"
            />
          </div>

          {loading ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                color: "#111827",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              جاري تحميل سجل التعديلات...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                color: "#111827",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              لا توجد سجلات مطابقة للبحث الحالي
            </div>
          ) : (
            <div style={tableWrapStyle}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "white",
                  minWidth: "980px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>العملية</th>
                    <th style={thStyle}>نوع السجل</th>
                    <th style={thStyle}>رقم الملف</th>
                    <th style={thStyle}>اسم رب الأسرة</th>
                    <th style={thStyle}>المعرف</th>
                    <th style={thStyle}>التاريخ</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      style={{
                        background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: "700" }}>
                        {log.action || "-"}
                      </td>
                      <td style={tdStyle}>
                        {getEntityTypeLabel(log.entity_type)}
                      </td>
                      <td style={tdStyle}>
                        {getMetaValue(log.meta, "file_number")}
                      </td>
                      <td style={tdStyle}>
                        {getMetaValue(log.meta, "head_name")}
                      </td>
                      <td style={tdStyle}>{log.entity_id || "-"}</td>
                      <td style={tdStyle}>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("ar-EG")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
