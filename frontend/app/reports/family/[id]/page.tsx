"use client";
import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

type Family = {
  file_number?: string;
  head_name?: string;
  head_id_number?: string;
  phone?: string;
  head_birth_date?: string;
  head_health_status?: string;
  has_chronic_disease?: boolean;
  has_disability?: boolean;
  notes?: string;
  created_at?: string;
  age?: number | null;
  family_members_count?: number | null;
};

type Wife = {
  name?: string;
  id_number?: string;
  birth_date?: string;
  health_status?: string;
  age?: number | null;
};

type Member = {
  id: string;
  full_name?: string;
  id_number?: string;
  birth_date?: string;
  gender?: string;
  health_status?: string;
  age?: number | null;
};

export default function FamilyReportPage() {
  const params = useParams();
  const router = useRouter();
  const fileNumber = params?.id ?? ""; // استخدم Optional Chaining
  const [family, setFamily] = useState<Family | null>(null);
  const [wife, setWife] = useState<Wife | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        const res = await fetch(`${API_URL}/families/${fileNumber}`);
        const data = await res.json();

        if (data.success) {
          setFamily(data.family || null);
          setWife(data.wife || null);
          setMembers(Array.isArray(data.members) ? data.members : []);
        } else {
          setFamily(null);
        }
      } catch (error) {
        console.error("خطأ في تحميل التقرير:", error);
        setFamily(null);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyData();
  }, [fileNumber]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
    padding: "32px",
  };

  const printCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
    maxWidth: "1100px",
    margin: "0 auto",
  };

  const headerStyle: React.CSSProperties = {
    borderBottom: "2px solid #14532d",
    paddingBottom: "18px",
    marginBottom: "24px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "34px",
    fontWeight: "bold",
    color: "#14532d",
    margin: "0 0 8px 0",
  };

  const subTextStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.9",
    margin: 0,
    fontWeight: "500",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "28px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 14px 0",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  };

  const infoCardStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
  };

  const labelStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const valueStyle: React.CSSProperties = {
    color: "#111827",
    fontSize: "17px",
    fontWeight: "700",
    lineHeight: "1.8",
  };

  const tableWrapStyle: React.CSSProperties = {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
  };

  const thStyle: React.CSSProperties = {
    background: "#14532d",
    color: "white",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "bold",
    textAlign: "center",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px",
    fontSize: "14px",
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
  };

  const actionRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "24px",
  };

  const buttonStyle: React.CSSProperties = {
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={pageStyle}>
          <AppTopNav
            title="تقرير العائلة"
            subtitle="عرض تقرير منظم وقابل للطباعة والحفظ PDF."
          />
          <div style={printCardStyle}>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}
            >
              جاري تحميل التقرير...
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!family) {
    return (
      <ProtectedRoute>
        <div style={pageStyle}>
          <AppTopNav
            title="تقرير العائلة"
            subtitle="عرض تقرير منظم وقابل للطباعة والحفظ PDF."
          />
          <div style={printCardStyle}>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}
            >
              لم يتم العثور على بيانات العائلة
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
          title="تقرير العائلة"
          subtitle="عرض تقرير منظم وقابل للطباعة والحفظ PDF."
        />

        <div style={actionRowStyle}>
          <button
            onClick={() => window.print()}
            style={{ ...buttonStyle, background: "#14532d" }}
          >
            طباعة / حفظ PDF
          </button>

          <button
            onClick={() => router.push(`/families/${fileNumber}`)}
            style={{ ...buttonStyle, background: "#1d4ed8" }}
          >
            العودة إلى ملف العائلة
          </button>
        </div>

        <div style={printCardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>تقرير بيانات الأسرة</h1>
            <p style={subTextStyle}>
              رقم الملف: {family.file_number || "-"} | تاريخ التقرير:{" "}
              {new Date().toLocaleDateString("ar-EG")}
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>بيانات رب الأسرة</h2>
            <div style={gridStyle}>
              <div style={infoCardStyle}>
                <div style={labelStyle}>الاسم</div>
                <div style={valueStyle}>{family.head_name || "-"}</div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>رقم الهوية</div>
                <div style={valueStyle}>{family.head_id_number || "-"}</div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>العمر</div>
                <div style={valueStyle}>{family.age ?? "-"}</div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>الهاتف</div>
                <div style={valueStyle}>{family.phone || "-"}</div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>تاريخ الميلاد</div>
                <div style={valueStyle}>
                  {family.head_birth_date
                    ? new Date(family.head_birth_date).toLocaleDateString(
                        "ar-EG",
                      )
                    : "-"}
                </div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>الحالة الصحية</div>
                <div style={valueStyle}>{family.head_health_status || "-"}</div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>مرض مزمن</div>
                <div style={valueStyle}>
                  {family.has_chronic_disease ? "نعم" : "لا"}
                </div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>إعاقة</div>
                <div style={valueStyle}>
                  {family.has_disability ? "نعم" : "لا"}
                </div>
              </div>
              <div style={infoCardStyle}>
                <div style={labelStyle}>عدد أفراد الأسرة</div>
                <div style={valueStyle}>
                  {family.family_members_count ?? "-"}
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>بيانات الزوجة</h2>
            {!wife ? (
              <div style={infoCardStyle}>
                <div style={valueStyle}>لا توجد بيانات زوجة مسجلة</div>
              </div>
            ) : (
              <div style={gridStyle}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>الاسم</div>
                  <div style={valueStyle}>{wife.name || "-"}</div>
                </div>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>رقم الهوية</div>
                  <div style={valueStyle}>{wife.id_number || "-"}</div>
                </div>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>العمر</div>
                  <div style={valueStyle}>{wife.age ?? "-"}</div>
                </div>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>تاريخ الميلاد</div>
                  <div style={valueStyle}>
                    {wife.birth_date
                      ? new Date(wife.birth_date).toLocaleDateString("ar-EG")
                      : "-"}
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>الحالة الصحية</div>
                  <div style={valueStyle}>{wife.health_status || "-"}</div>
                </div>
              </div>
            )}
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>أفراد الأسرة</h2>
            {members.length === 0 ? (
              <div style={infoCardStyle}>
                <div style={valueStyle}>لا يوجد أفراد مسجلون</div>
              </div>
            ) : (
              <div style={tableWrapStyle}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "white",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>الاسم</th>
                      <th style={thStyle}>رقم الهوية</th>
                      <th style={thStyle}>العمر</th>
                      <th style={thStyle}>تاريخ الميلاد</th>
                      <th style={thStyle}>الجنس</th>
                      <th style={thStyle}>الحالة الصحية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr
                        key={member.id}
                        style={{
                          background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                        }}
                      >
                        <td style={tdStyle}>{member.full_name || "-"}</td>
                        <td style={tdStyle}>{member.id_number || "-"}</td>
                        <td style={tdStyle}>{member.age ?? "-"}</td>
                        <td style={tdStyle}>
                          {member.birth_date
                            ? new Date(member.birth_date).toLocaleDateString(
                                "ar-EG",
                              )
                            : "-"}
                        </td>
                        <td style={tdStyle}>{member.gender || "-"}</td>
                        <td style={tdStyle}>{member.health_status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>ملاحظات</h2>
            <div style={infoCardStyle}>
              <div style={valueStyle}>{family.notes || "لا توجد ملاحظات"}</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
