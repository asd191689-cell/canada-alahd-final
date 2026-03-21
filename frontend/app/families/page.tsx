"use client";
import { API_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

type FamilyItem = {
  id: string;
  file_number?: string;
  head_name?: string;
  head_id_number?: string;
  age?: number | null;
  family_members_count?: number | null;
  phone?: string;
  created_at?: string;
};

type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "members-high"
  | "members-low";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [membersFilter, setMembersFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    fetch(`${API_URL}/families`)
      .then((res) => res.json())
      .then((data) => {
        setFamilies(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("خطأ في تحميل العائلات:", error);
        setFamilies([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredFamilies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = families.filter((family) => {
      const fileNumber = (family.file_number || "").toLowerCase();
      const headName = (family.head_name || "").toLowerCase();
      const headId = (family.head_id_number || "").toLowerCase();
      const phone = (family.phone || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        fileNumber.includes(keyword) ||
        headName.includes(keyword) ||
        headId.includes(keyword) ||
        phone.includes(keyword);

      const membersCount = Number(family.family_members_count || 0);

      let matchesMembersFilter = true;

      if (membersFilter === "small") {
        matchesMembersFilter = membersCount >= 1 && membersCount <= 3;
      } else if (membersFilter === "medium") {
        matchesMembersFilter = membersCount >= 4 && membersCount <= 6;
      } else if (membersFilter === "large") {
        matchesMembersFilter = membersCount >= 7;
      }

      return matchesSearch && matchesMembersFilter;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
      }

      if (sortBy === "name-asc") {
        return (a.head_name || "").localeCompare(b.head_name || "", "ar");
      }

      if (sortBy === "name-desc") {
        return (b.head_name || "").localeCompare(a.head_name || "", "ar");
      }

      if (sortBy === "members-high") {
        return (
          Number(b.family_members_count || 0) -
          Number(a.family_members_count || 0)
        );
      }

      if (sortBy === "members-low") {
        return (
          Number(a.family_members_count || 0) -
          Number(b.family_members_count || 0)
        );
      }

      return 0;
    });

    return result;
  }, [families, search, membersFilter, sortBy]);

  const totalFamilies = families.length;
  const totalFiltered = filteredFamilies.length;
  const totalMembersShown = filteredFamilies.reduce(
    (sum, family) => sum + Number(family.family_members_count || 0),
    0,
  );

  const pageStyle: React.CSSProperties = {
    padding: "32px",
    direction: "rtl",
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
  };

  const heroStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
    color: "white",
    padding: "34px",
    borderRadius: "24px",
    marginBottom: "26px",
    boxShadow: "0 16px 35px rgba(20,83,45,0.22)",
  };

  const heroTitleStyle: React.CSSProperties = {
    margin: "0 0 10px 0",
    fontSize: "42px",
    fontWeight: "bold",
    color: "white",
    lineHeight: "1.2",
  };

  const heroTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "17px",
    color: "#ecfdf5",
    lineHeight: "1.9",
    fontWeight: "600",
    maxWidth: "920px",
  };

  const summaryGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  };

  const summaryCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
  };

  const summaryNumberStyle: React.CSSProperties = {
    fontSize: "38px",
    fontWeight: "bold",
    color: "#14532d",
    lineHeight: "1",
    marginBottom: "10px",
  };

  const summaryLabelStyle: React.CSSProperties = {
    color: "#374151",
    fontSize: "16px",
    fontWeight: "bold",
  };

  const summaryHelperStyle: React.CSSProperties = {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.8",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)",
    border: "1px solid #e5e7eb",
  };

  const filterGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "220px 1fr 220px 220px",
    gap: "16px",
    alignItems: "end",
    marginBottom: "22px",
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
    height: "56px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    padding: "0 16px",
    fontSize: "15px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
    fontWeight: "600",
  };

  const addButtonStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontWeight: "bold",
    fontSize: "17px",
    height: "56px",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(20,83,45,0.18)",
    width: "100%",
  };

  const actionsRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  };

  const titleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
  };

  const helperStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.9",
    margin: "8px 0 0 0",
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

  const tableWrapperStyle: React.CSSProperties = {
    overflowX: "auto",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "white",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1250px",
  };

  const thStyle: React.CSSProperties = {
    background: "#14532d",
    color: "white",
    padding: "18px 14px",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "18px 14px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const subtleTdStyle: React.CSSProperties = {
    ...tdStyle,
    color: "#1f2937",
    fontWeight: "600",
  };

  const actionWrapStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  };

  const viewButtonStyle: React.CSSProperties = {
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    display: "inline-block",
    minWidth: "82px",
  };

  const editButtonStyle: React.CSSProperties = {
    background: "#f59e0b",
    color: "white",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    display: "inline-block",
    minWidth: "82px",
  };

  const resetButtonStyle: React.CSSProperties = {
    background: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  };

  const emptyStateStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "26px",
    textAlign: "center",
    color: "#111827",
    fontWeight: "700",
    fontSize: "18px",
  };

  return (
    <ProtectedRoute>
      <div style={pageStyle}>
        <AppTopNav
          title="قائمة العائلات"
          subtitle="يمكنك من هنا إدارة العائلات والبحث بينها وتصفية النتائج وترتيبها وفتح الملفات أو تعديلها بسرعة."
        />

        <div style={heroStyle}>
          <h1 style={heroTitleStyle}>قائمة العائلات</h1>
          <p style={heroTextStyle}>
            صفحة موحدة لإدارة العائلات المسجلة داخل النظام، مع إمكانيات بحث
            وفلترة وترتيب تسهّل الوصول السريع للملفات المطلوبة أثناء العمل
            اليومي.
          </p>
        </div>

        <div style={summaryGridStyle}>
          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{totalFamilies}</div>
            <div style={summaryLabelStyle}>إجمالي العائلات</div>
            <div style={summaryHelperStyle}>
              جميع الملفات المسجلة داخل النظام
            </div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{totalFiltered}</div>
            <div style={summaryLabelStyle}>نتائج العرض الحالية</div>
            <div style={summaryHelperStyle}>
              عدد العائلات بعد البحث والفلترة
            </div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{totalMembersShown}</div>
            <div style={summaryLabelStyle}>إجمالي الأفراد المعروضين</div>
            <div style={summaryHelperStyle}>
              مجموع أفراد العائلات الظاهرة حاليًا
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={filterGridStyle}>
            <Link href="/families/add" style={{ textDecoration: "none" }}>
              <button type="button" style={addButtonStyle}>
                + إضافة عائلة
              </button>
            </Link>

            <div>
              <label style={labelStyle}>البحث</label>
              <input
                type="text"
                placeholder="ابحث باسم رب الأسرة أو رقم الهوية أو رقم الملف أو الهاتف"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>فلترة حسب عدد الأفراد</label>
              <select
                value={membersFilter}
                onChange={(e) => setMembersFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="all">جميع العائلات</option>
                <option value="small">أسرة صغيرة (1 - 3)</option>
                <option value="medium">أسرة متوسطة (4 - 6)</option>
                <option value="large">أسرة كبيرة (7 فأكثر)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>الترتيب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={inputStyle}
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="oldest">الأقدم أولًا</option>
                <option value="name-asc">الاسم أ → ي</option>
                <option value="name-desc">الاسم ي → أ</option>
                <option value="members-high">الأكثر أفرادًا</option>
                <option value="members-low">الأقل أفرادًا</option>
              </select>
            </div>
          </div>

          <div style={actionsRowStyle}>
            <div>
              <h2 style={titleStyle}>العائلات المسجلة</h2>
              <p style={helperStyle}>
                يمكنك فتح ملف العائلة مباشرة أو الانتقال إلى صفحة التعديل.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={badgeStyle}>
                عدد النتائج: {filteredFamilies.length}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMembersFilter("all");
                  setSortBy("newest");
                }}
                style={resetButtonStyle}
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          </div>

          {loading ? (
            <div style={emptyStateStyle}>جاري تحميل بيانات العائلات...</div>
          ) : filteredFamilies.length === 0 ? (
            <div style={emptyStateStyle}>
              لا توجد نتائج مطابقة للبحث أو الفلاتر الحالية
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>رقم الملف</th>
                    <th style={thStyle}>اسم رب الأسرة</th>
                    <th style={thStyle}>رقم الهوية</th>
                    <th style={thStyle}>العمر</th>
                    <th style={thStyle}>عدد أفراد الأسرة</th>
                    <th style={thStyle}>الهاتف</th>
                    <th style={thStyle}>تاريخ الإنشاء</th>
                    <th style={thStyle}>العمليات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFamilies.map((family, index) => (
                    <tr
                      key={family.id}
                      style={{
                        background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td style={tdStyle}>{family.file_number || "-"}</td>
                      <td style={tdStyle}>{family.head_name || "-"}</td>
                      <td style={subtleTdStyle}>
                        {family.head_id_number || "-"}
                      </td>
                      <td style={subtleTdStyle}>{family.age ?? "-"}</td>
                      <td style={subtleTdStyle}>
                        {family.family_members_count ?? "-"}
                      </td>
                      <td style={subtleTdStyle}>{family.phone || "-"}</td>
                      <td style={subtleTdStyle}>
                        {family.created_at
                          ? new Date(family.created_at).toLocaleDateString(
                              "ar-EG",
                            )
                          : "-"}
                      </td>
                      <td style={tdStyle}>
                        <div style={actionWrapStyle}>
                          <Link
                            href={`/families/${family.file_number}`}
                            style={viewButtonStyle}
                          >
                            عرض
                          </Link>

                          <Link
                            href={`/families/edit/${family.file_number}`}
                            style={editButtonStyle}
                          >
                            تعديل
                          </Link>
                        </div>
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
