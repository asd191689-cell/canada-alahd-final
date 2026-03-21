"use client";
import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

type LatestFamily = {
  file_number?: string;
  head_name?: string;
  phone?: string;
  family_members_count?: number | null;
  created_at?: string;
};

type Stats = {
  families: number;
  members: number;
  documents: number;
  avgFamilySize: string;
  latestFamilies: LatestFamily[];
};

type QuickLink = {
  title: string;
  description: string;
  href: string;
  icon: string;
  background: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    families: 0,
    members: 0,
    documents: 0,
    avgFamilySize: "0.0",
    latestFamilies: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/stats`);
        const data = await res.json();

        if (res.ok) {
          setStats({
            families: data.families || 0,
            members: data.members || 0,
            documents: data.documents || 0,
            avgFamilySize: data.avgFamilySize || "0.0",
            latestFamilies: Array.isArray(data.latestFamilies)
              ? data.latestFamilies
              : [],
          });
        }
      } catch (error) {
        console.error("خطأ في تحميل الإحصائيات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks: QuickLink[] = [
    {
      title: "إضافة عائلة جديدة",
      description: "فتح نموذج تسجيل عائلة جديدة وإدخال البيانات الأساسية.",
      href: "/families/add",
      icon: "＋",
      background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
    },
    {
      title: "قائمة العائلات",
      description: "عرض جميع العائلات والبحث بينها وفتح الملفات بسرعة.",
      href: "/families",
      icon: "👨‍👩‍👧‍👦",
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    },
    {
      title: "إدارة الوثائق",
      description: "رفع الوثائق، مراجعتها، البحث فيها، وحذف غير المطلوب.",
      href: "/documents",
      icon: "📄",
      background: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    },
    {
      title: "سجل التعديلات",
      description: "مراجعة العمليات التي تمت داخل النظام بشكل منظم وواضح.",
      href: "/audit-log",
      icon: "🕓",
      background: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
    },
    {
      title: "تصدير البيانات",
      description: "تنزيل ملف CSV / Excel من البيانات المسجلة في النظام.",
      href: "/export",
      icon: "📊",
      background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    },
  ];

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
    padding: "32px",
  };

  const heroStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
    color: "white",
    borderRadius: "28px",
    padding: "34px",
    boxShadow: "0 18px 40px rgba(20,83,45,0.22)",
    marginBottom: "26px",
  };

  const heroTitleStyle: React.CSSProperties = {
    margin: "0 0 10px 0",
    fontSize: "40px",
    lineHeight: "1.2",
    fontWeight: "bold",
    color: "white",
  };

  const heroTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "16px",
    lineHeight: "2",
    color: "#ecfdf5",
    fontWeight: "500",
    maxWidth: "920px",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  };

  const statCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "26px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
  };

  const statNumberStyle: React.CSSProperties = {
    fontSize: "46px",
    fontWeight: "bold",
    color: "#14532d",
    marginBottom: "10px",
    lineHeight: "1",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "17px",
    color: "#374151",
    fontWeight: "bold",
  };

  const statHelperStyle: React.CSSProperties = {
    marginTop: "8px",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "600",
    lineHeight: "1.8",
  };

  const sectionCardStyle: React.CSSProperties = {
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

  const quickLinksGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  };

  const quickLinkCardStyle: React.CSSProperties = {
    borderRadius: "24px",
    padding: "22px",
    color: "white",
    textDecoration: "none",
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
  };

  const quickIconStyle: React.CSSProperties = {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "16px",
  };

  const quickTitleStyle: React.CSSProperties = {
    margin: "0 0 8px 0",
    fontSize: "22px",
    fontWeight: "bold",
    lineHeight: "1.5",
    color: "white",
  };

  const quickTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.9",
    color: "rgba(255,255,255,0.95)",
    fontWeight: "500",
  };

  const quickFooterStyle: React.CSSProperties = {
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#ffffff",
  };

  const latestTableWrapStyle: React.CSSProperties = {
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

  const viewLinkStyle: React.CSSProperties = {
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    display: "inline-block",
  };

  const emptyStateStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "17px",
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={pageStyle}>
          <AppTopNav
            title="لوحة التحكم"
            subtitle="متابعة الإحصائيات العامة والوصول السريع إلى صفحات النظام."
          />

          <div style={sectionCardStyle}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#111827",
                textAlign: "center",
              }}
            >
              جاري تحميل لوحة التحكم...
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={pageStyle}>
        <AppTopNav
          title="لوحة التحكم"
          subtitle="متابعة الإحصائيات العامة والوصول السريع إلى صفحات النظام."
        />

        <div style={heroStyle}>
          <h1 style={heroTitleStyle}>لوحة التحكم</h1>
          <p style={heroTextStyle}>
            من هذه الصفحة يمكنك متابعة الإحصائيات العامة للنظام، والوصول السريع
            إلى أهم الصفحات، ومراجعة آخر العائلات المضافة بسهولة ووضوح.
          </p>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{stats.families}</div>
            <div style={statLabelStyle}>عدد العائلات</div>
            <div style={statHelperStyle}>
              إجمالي الملفات المسجلة داخل النظام
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statNumberStyle}>{stats.members}</div>
            <div style={statLabelStyle}>عدد الأفراد</div>
            <div style={statHelperStyle}>
              يشمل جميع الأفراد المضافين في العائلات
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statNumberStyle}>{stats.documents}</div>
            <div style={statLabelStyle}>عدد الوثائق</div>
            <div style={statHelperStyle}>جميع الملفات والوثائق المرفوعة</div>
          </div>

          <div style={statCardStyle}>
            <div style={statNumberStyle}>{stats.avgFamilySize}</div>
            <div style={statLabelStyle}>متوسط أفراد الأسرة</div>
            <div style={statHelperStyle}>
              متوسط عدد أفراد الأسرة في الملفات المسجلة
            </div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>الإجراءات السريعة</h2>
          <p style={sectionTextStyle}>
            هذه البطاقات مخصصة للوصول السريع إلى أهم العمليات اليومية داخل
            النظام.
          </p>

          <div style={quickLinksGridStyle}>
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...quickLinkCardStyle,
                  background: item.background,
                }}
              >
                <div>
                  <div style={quickIconStyle}>{item.icon}</div>
                  <h3 style={quickTitleStyle}>{item.title}</h3>
                  <p style={quickTextStyle}>{item.description}</p>
                </div>

                <div style={quickFooterStyle}>فتح الصفحة ←</div>
              </Link>
            ))}
          </div>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>آخر العائلات المضافة</h2>
          <p style={sectionTextStyle}>
            يعرض هذا الجدول آخر الملفات التي تمت إضافتها داخل النظام مع إمكانية
            فتح ملف العائلة مباشرة.
          </p>

          {stats.latestFamilies.length === 0 ? (
            <div style={emptyStateStyle}>لا توجد عائلات مضافة حتى الآن</div>
          ) : (
            <div style={latestTableWrapStyle}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "white",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>رقم الملف</th>
                    <th style={thStyle}>اسم رب الأسرة</th>
                    <th style={thStyle}>رقم الهاتف</th>
                    <th style={thStyle}>عدد أفراد الأسرة</th>
                    <th style={thStyle}>تاريخ الإضافة</th>
                    <th style={thStyle}>الملف</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.latestFamilies.map((family, index) => (
                    <tr
                      key={`${family.file_number || "family"}-${index}`}
                      style={{
                        background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td style={tdStyle}>{family.file_number || "-"}</td>
                      <td style={tdStyle}>{family.head_name || "-"}</td>
                      <td style={tdStyle}>{family.phone || "-"}</td>
                      <td style={tdStyle}>
                        {family.family_members_count ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {family.created_at
                          ? new Date(family.created_at).toLocaleString("ar-EG")
                          : "-"}
                      </td>
                      <td style={tdStyle}>
                        {family.file_number ? (
                          <Link
                            href={`/families/${family.file_number}`}
                            style={viewLinkStyle}
                          >
                            فتح الملف
                          </Link>
                        ) : (
                          "-"
                        )}
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
