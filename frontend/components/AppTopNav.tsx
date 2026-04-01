"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AppTopNavProps = {
  title?: string;
  subtitle?: string;
};

export default function AppTopNav({
  title = "نظام إدارة العائلات والوثائق",
  subtitle = "تنقل سريع وواضح بين الصفحات الأساسية داخل النظام.",
}: AppTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "لوحة التحكم", icon: "🏠" },
    { href: "/families", label: "العائلات", icon: "👨‍👩‍👧‍👦" },
    { href: "/families/add", label: "إضافة عائلة", icon: "➕" },
    { href: "/documents", label: "الوثائق", icon: "📄" },
    { href: "/audit-log", label: "سجل التعديلات", icon: "🕓" },
    { href: "/export", label: "التصدير", icon: "📊" },
    { href: "/reports", label: "التقارير", icon: "🖨️" },
  ];

  const wrapperStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "18px 20px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const topRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: "#14532d",
    fontSize: "26px",
    fontWeight: "bold",
    lineHeight: "1.3",
  };

  const subtitleStyle: React.CSSProperties = {
    margin: "6px 0 0 0",
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.9",
    fontWeight: "500",
  };

  const rightActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  };

  const badgeStyle: React.CSSProperties = {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    whiteSpace: "nowrap",
  };

  const logoutButtonStyle: React.CSSProperties = {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 18px rgba(220,38,38,0.18)",
  };

  const linksWrapStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  };

  const getLinkStyle = (active: boolean): React.CSSProperties => ({
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "14px",
    fontWeight: "bold",
    fontSize: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: active ? "1px solid #14532d" : "1px solid #e5e7eb",
    background: active ? "#14532d" : "#f9fafb",
    color: active ? "#ffffff" : "#14532d",
    boxShadow: active
      ? "0 10px 20px rgba(20,83,45,0.16)"
      : "0 4px 10px rgba(15,23,42,0.03)",
  });

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";

    if (href === "/families") {
      return (
        pathname === "/families" ||
        (pathname?.startsWith("/families") &&
          !pathname?.startsWith("/families/add"))
      );
    }

    if (href === "/families/add") return pathname === "/families/add";
    if (href === "/reports")
      return pathname === "/reports" || pathname?.startsWith("/reports/");
    return pathname === href;
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div style={wrapperStyle}>
      <div style={topRowStyle}>
        <div>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>

        <div style={rightActionsStyle}>
          <div style={badgeStyle}>تنقل موحّد داخل النظام</div>

          <button onClick={handleLogout} style={logoutButtonStyle}>
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div style={linksWrapStyle}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={getLinkStyle(isActive(link.href))}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
