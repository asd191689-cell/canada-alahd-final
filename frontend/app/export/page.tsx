"use client";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ExportPage() {
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

  const topLinksWrapStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "16px",
  };

  const topLinkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "15px",
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.12)",
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
    maxWidth: "920px",
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

  const infoGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginTop: "18px",
  };

  const infoCardStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
  };

  const infoLabelStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const infoValueStyle: React.CSSProperties = {
    color: "#111827",
    fontSize: "17px",
    fontWeight: "700",
    lineHeight: "1.8",
  };

  const exportBoxStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  };

  const exportButtonStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
    color: "white",
    textDecoration: "none",
    padding: "16px 22px",
    borderRadius: "16px",
    fontWeight: "bold",
    fontSize: "16px",
    display: "inline-block",
    minWidth: "250px",
    textAlign: "center",
    boxShadow: "0 12px 24px rgba(20,83,45,0.18)",
  };

  return (
    <ProtectedRoute>
      <div style={pageStyle}>
        <AppTopNav
          title="تصدير البيانات"
          subtitle="تنزيل نسخة شاملة من جميع بيانات الأسر مع الوصول السريع إلى لوحة التحكم وبقية الصفحات."
        />

        <div style={heroStyle}>
          <div style={topLinksWrapStyle}>
            <Link href="/dashboard" style={topLinkStyle}>
              ← العودة إلى لوحة التحكم
            </Link>

            <Link href="/families" style={topLinkStyle}>
              الرجوع إلى قائمة العائلات
            </Link>
          </div>

          <h1 style={heroTitleStyle}>تصدير البيانات</h1>

          <p style={heroTextStyle}>
            من هذه الصفحة يمكنك تنزيل نسخة شاملة من بيانات الأسر بصيغة CSV
            متوافقة مع Excel، وتشمل بيانات رب الأسرة والزوجة وجميع الأفراد داخل
            كل أسرة.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>محتوى ملف التصدير</h2>
          <p style={sectionTextStyle}>
            ملف التصدير أصبح شاملاً لكل أسرة، بحيث يحتوي على البيانات الأساسية
            الكاملة مع تفاصيل الأفراد بشكل منظم داخل Excel.
          </p>

          <div style={infoGridStyle}>
            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>صيغة الملف</div>
              <div style={infoValueStyle}>CSV متوافق مع Excel</div>
            </div>

            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>بيانات رب الأسرة</div>
              <div style={infoValueStyle}>
                الاسم، الهوية، العمر، الهاتف، الحالة الصحية، تاريخ الميلاد
              </div>
            </div>

            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>بيانات الزوجة</div>
              <div style={infoValueStyle}>
                الاسم، الهوية، العمر، تاريخ الميلاد، الحالة الصحية
              </div>
            </div>

            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>بيانات الأفراد</div>
              <div style={infoValueStyle}>
                عدد الأفراد + تفاصيل كل فرد داخل خلية منظمة
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>تنزيل ملف التصدير الكامل</h2>
          <p style={sectionTextStyle}>
            اضغط على الزر التالي لتنزيل ملف البيانات الشامل مباشرة من الخادم.
            سيتم فتح التنزيل في تبويب جديد حتى لا تفقد مكانك داخل النظام.
          </p>

          <div style={exportBoxStyle}>
            <div>
              <div
                style={{
                  color: "#14532d",
                  fontSize: "22px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                تحميل ملف البيانات الكامل
              </div>

              <p
                style={{
                  color: "#4b5563",
                  fontSize: "15px",
                  lineHeight: "1.9",
                  margin: 0,
                  fontWeight: "500",
                  maxWidth: "720px",
                }}
              >
                سيحتوي الملف على جميع الأسر وبيانات رب الأسرة والزوجة والأفراد،
                وهو مناسب للمراجعة والطباعة والأرشفة والإرسال للإدارة.
              </p>
            </div>

            <a
              href={`${API_URL}/export`}
              target="_blank"
              rel="noreferrer"
              style={exportButtonStyle}
            >
              تحميل ملف Excel / CSV الكامل
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
