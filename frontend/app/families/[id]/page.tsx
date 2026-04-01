"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Family = {
  file_number?: string;
  head_name?: string;
  head_id_number?: string;
  age?: number | null;
  family_members_count?: number | null;
  phone?: string;
  head_birth_date?: string;
  head_health_status?: string;
  has_chronic_disease?: boolean;
  has_disability?: boolean;
  notes?: string;
  created_at?: string;
};

type Wife = {
  name?: string;
  id_number?: string;
  age?: number | null;
  birth_date?: string;
  health_status?: string;
};

type Member = {
  id: string;
  full_name?: string;
  id_number?: string;
  age?: number | null;
  birth_date?: string;
  gender?: string;
  health_status?: string;
};

type DocumentItem = {
  id: string;
  doc_type?: string;
  file_url?: string;
  uploaded_at?: string;
};

export default function FamilyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const fileNumber = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id ?? "");

  const [family, setFamily] = useState<Family | null>(null);
  const [wife, setWife] = useState<Wife | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editFamily, setEditFamily] = useState<Family>({
    file_number: "",
    head_name: "",
    head_id_number: "",
    age: null,
    family_members_count: 1,
    phone: "",
    head_birth_date: "",
    head_health_status: "",
    has_chronic_disease: false,
    has_disability: false,
    notes: "",
    created_at: "",
  });

  const [editWife, setEditWife] = useState<Wife>({
    name: "",
    id_number: "",
    age: null,
    birth_date: "",
    health_status: "",
  });

  const [editMembers, setEditMembers] = useState<Member[]>([]);
  const [editDocuments, setEditDocuments] = useState<DocumentItem[]>([]);

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 0 ? String(age) : "";
  };

  const liveFatherAge = useMemo(
    () => calculateAge(editFamily.head_birth_date),
    [editFamily.head_birth_date],
  );

  const liveWifeAge = useMemo(
    () => calculateAge(editWife.birth_date),
    [editWife.birth_date],
  );

  const liveFamilyMembersCount = useMemo(() => {
    const wifeCount = editWife.name?.trim() ? 1 : 0;
    return 1 + wifeCount + editMembers.length;
  }, [editWife.name, editMembers.length]);

  const loadFamilyData = async () => {
    try {
      const res = await fetch(`${API_URL}/families/${fileNumber}`);
      const data = await res.json();

      if (data.success) {
        const loadedFamily = data.family || null;
        const loadedWife = data.wife || null;
        const loadedMembers = Array.isArray(data.members) ? data.members : [];
        const loadedDocuments = Array.isArray(data.documents)
          ? data.documents
          : [];

        setFamily(loadedFamily);
        setWife(loadedWife);
        setMembers(loadedMembers);
        setDocuments(loadedDocuments);

        setEditFamily(
          loadedFamily || {
            file_number: "",
            head_name: "",
            head_id_number: "",
            age: null,
            family_members_count: 1,
            phone: "",
            head_birth_date: "",
            head_health_status: "",
            has_chronic_disease: false,
            has_disability: false,
            notes: "",
            created_at: "",
          },
        );

        setEditWife(
          loadedWife || {
            name: "",
            id_number: "",
            age: null,
            birth_date: "",
            health_status: "",
          },
        );

        setEditMembers(loadedMembers);
        setEditDocuments(loadedDocuments);
      }
    } catch (error) {
      console.error("خطأ في جلب ملف العائلة:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileNumber) {
      loadFamilyData();
    } else {
      setLoading(false);
    }
  }, [fileNumber]);

  const pageStyle: React.CSSProperties = {
    padding: "32px",
    direction: "rtl",
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "26px",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const heroCardStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 16px 36px rgba(20,83,45,0.24)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "24px",
    color: "white",
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "28px",
    margin: "0 0 16px 0",
    fontWeight: "bold",
  };

  const subSectionTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "22px",
    margin: "0 0 14px 0",
    fontWeight: "bold",
  };

  const helperTextStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.9",
    margin: "0 0 18px 0",
    fontWeight: "500",
  };

  const labelStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const valueStyle: React.CSSProperties = {
    color: "#111827",
    fontSize: "19px",
    fontWeight: "700",
    lineHeight: "1.8",
  };

  const infoBoxStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "52px",
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

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#f9fafb",
    color: "#14532d",
    fontWeight: "bold",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "120px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    padding: "14px",
    fontSize: "16px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    fontWeight: "600",
  };

  const badgeStyle: React.CSSProperties = {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "15px",
    minWidth: "90px",
    textAlign: "center",
  };

  const actionButtonBase: React.CSSProperties = {
    color: "white",
    border: "none",
    padding: "13px 18px",
    borderRadius: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  };

  const summaryCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
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
  };

  const tdBaseStyle: React.CSSProperties = {
    padding: "16px",
    color: "#111827",
    fontSize: "15px",
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const heroButtonStyle: React.CSSProperties = {
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

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string,
  ) => {
    const updated = [...editMembers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditMembers(updated);
  };

  const handleAddMember = () => {
    setEditMembers((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        full_name: "",
        id_number: "",
        age: null,
        birth_date: "",
        gender: "ذكر",
        health_status: "سليم",
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    const updated = [...editMembers];
    updated.splice(index, 1);
    setEditMembers(updated);
  };

  const handleDocumentTypeChange = (index: number, value: string) => {
    const updated = [...editDocuments];
    updated[index] = {
      ...updated[index],
      doc_type: value,
    };
    setEditDocuments(updated);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الوثيقة؟");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في حذف الوثيقة");
      }

      const updatedDocs = editDocuments.filter((doc) => doc.id !== documentId);
      setEditDocuments(updatedDocs);
      setDocuments(updatedDocs);

      alert("تم حذف الوثيقة بنجاح");
    } catch (error: any) {
      console.error("خطأ في حذف الوثيقة:", error);
      alert(error.message || "حدث خطأ أثناء حذف الوثيقة");
    }
  };

  const handleDeleteFamily = async () => {
    if (!family?.file_number) return;

    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف هذه العائلة؟ سيتم حذف جميع البيانات والوثائق.",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/families/${family.file_number}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في حذف العائلة");
      }

      alert("تم حذف العائلة بنجاح");
      router.push("/families");
    } catch (error: any) {
      console.error("خطأ في حذف العائلة:", error);
      alert(error.message || "حدث خطأ أثناء حذف العائلة");
    }
  };

  const handleSaveLocalEdit = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/families/${fileNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          family: editFamily,
          wife: editWife,
          members: editMembers,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في حفظ التعديلات");
      }

      for (const doc of editDocuments) {
        const docResponse = await fetch(`${API_URL}/documents/${doc.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            docType: doc.doc_type || "وثيقة",
          }),
        });

        const docData = await docResponse.json();

        if (!docResponse.ok || !docData.success) {
          throw new Error(docData.message || "فشل في تعديل الوثائق");
        }
      }

      setFamily(editFamily);
      setWife(editWife);
      setMembers(editMembers);
      setDocuments(editDocuments);
      setIsEditing(false);

      alert("تم حفظ جميع التعديلات بما فيها الوثائق بنجاح");
      await loadFamilyData();
    } catch (error: any) {
      console.error("خطأ في حفظ التعديلات:", error);
      alert(error.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...cardStyle,
            color: "#111827",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          جاري تحميل ملف العائلة...
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...cardStyle,
            color: "#111827",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          لم يتم العثور على ملف العائلة
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={heroCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <Link href="/families" style={heroButtonStyle}>
                ← العودة إلى قائمة العائلات
              </Link>

              <button
                onClick={() => window.print()}
                style={{
                  ...heroButtonStyle,
                  border: "1px solid rgba(255,255,255,0.22)",
                  cursor: "pointer",
                }}
              >
                طباعة الملف
              </button>
            </div>

            <h1
              style={{
                fontSize: "38px",
                margin: "0 0 10px 0",
                fontWeight: "bold",
                color: "white",
                lineHeight: "1.2",
              }}
            >
              ملف العائلة
            </h1>

            <p
              style={{
                color: "#ecfdf5",
                fontSize: "16px",
                margin: 0,
                fontWeight: "500",
                lineHeight: "1.9",
                maxWidth: "720px",
              }}
            >
              عرض كامل ومنظم لجميع بيانات العائلة بشكل واضح وسهل القراءة، مع
              إمكانية تعديل البيانات والوثائق وإدارة الملف من مكان واحد.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "16px 20px",
              borderRadius: "16px",
              minWidth: "200px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            رقم الملف: {family.file_number || "-"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={summaryCardStyle}>
          <div style={labelStyle}>رب الأسرة</div>
          <div style={valueStyle}>{family.head_name || "-"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>رقم الهوية</div>
          <div style={valueStyle}>{family.head_id_number || "-"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>رقم الهاتف</div>
          <div style={valueStyle}>{family.phone || "-"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>عدد أفراد الأسرة</div>
          <div style={valueStyle}>{family.family_members_count ?? "-"}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            ...actionButtonBase,
            background: "#14532d",
          }}
        >
          {isEditing ? "إغلاق التعديل" : "تعديل البيانات"}
        </button>

        <button
          onClick={() =>
            router.push(`/documents?family=${family.file_number || ""}`)
          }
          style={{
            ...actionButtonBase,
            background: "#d97706",
          }}
        >
          رفع وثيقة
        </button>

        <button
          onClick={handleDeleteFamily}
          style={{
            ...actionButtonBase,
            background: "#dc2626",
          }}
        >
          حذف العائلة
        </button>
      </div>

      {isEditing && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>تعديل كامل لبيانات ملف العائلة</h2>
          <p style={helperTextStyle}>
            يمكنك من هنا تعديل بيانات رب الأسرة والزوجة والأفراد والوثائق من
            مكان واحد. يتم حساب الأعمار وعدد أفراد الأسرة تلقائيًا أثناء
            التعديل.
          </p>

          <div style={{ marginBottom: "28px" }}>
            <h3 style={subSectionTitleStyle}>بيانات رب الأسرة</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              <div>
                <div style={labelStyle}>اسم رب الأسرة</div>
                <input
                  style={inputStyle}
                  value={editFamily.head_name || ""}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      head_name: e.target.value,
                    })
                  }
                  placeholder="أدخل اسم رب الأسرة"
                />
              </div>

              <div>
                <div style={labelStyle}>رقم هوية رب الأسرة</div>
                <input
                  style={inputStyle}
                  value={editFamily.head_id_number || ""}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      head_id_number: e.target.value,
                    })
                  }
                  placeholder="أدخل رقم الهوية"
                />
              </div>

              <div>
                <div style={labelStyle}>رقم الهاتف</div>
                <input
                  style={inputStyle}
                  value={editFamily.phone || ""}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      phone: e.target.value,
                    })
                  }
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <div style={labelStyle}>تاريخ الميلاد</div>
                <input
                  type="date"
                  style={inputStyle}
                  value={
                    editFamily.head_birth_date
                      ? String(editFamily.head_birth_date).split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      head_birth_date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <div style={labelStyle}>العمر</div>
                <input
                  style={readOnlyInputStyle}
                  value={liveFatherAge || ""}
                  readOnly
                  placeholder="يُحسب تلقائيًا"
                />
              </div>

              <div>
                <div style={labelStyle}>عدد أفراد الأسرة</div>
                <input
                  style={readOnlyInputStyle}
                  value={String(liveFamilyMembersCount)}
                  readOnly
                />
              </div>

              <div>
                <div style={labelStyle}>الحالة الصحية</div>
                <input
                  style={inputStyle}
                  value={editFamily.head_health_status || ""}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      head_health_status: e.target.value,
                    })
                  }
                  placeholder="مثال: سليم"
                />
              </div>

              <div>
                <div style={labelStyle}>مرض مزمن</div>
                <select
                  style={inputStyle}
                  value={editFamily.has_chronic_disease ? "نعم" : "لا"}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      has_chronic_disease: e.target.value === "نعم",
                    })
                  }
                >
                  <option value="لا">لا</option>
                  <option value="نعم">نعم</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>إعاقة</div>
                <select
                  style={inputStyle}
                  value={editFamily.has_disability ? "نعم" : "لا"}
                  onChange={(e) =>
                    setEditFamily({
                      ...editFamily,
                      has_disability: e.target.value === "نعم",
                    })
                  }
                >
                  <option value="لا">لا</option>
                  <option value="نعم">نعم</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <div style={labelStyle}>الملاحظات</div>
              <textarea
                style={textareaStyle}
                value={editFamily.notes || ""}
                onChange={(e) =>
                  setEditFamily({
                    ...editFamily,
                    notes: e.target.value,
                  })
                }
                placeholder="أدخل أي ملاحظات إضافية متعلقة بالملف"
              />
            </div>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h3 style={subSectionTitleStyle}>بيانات الزوجة</h3>
            <p style={helperTextStyle}>
              يمكنك إدخال أو تعديل بيانات الزوجة هنا، ويُحسب العمر تلقائيًا حسب
              تاريخ الميلاد.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              <div>
                <div style={labelStyle}>اسم الزوجة</div>
                <input
                  style={inputStyle}
                  value={editWife.name || ""}
                  onChange={(e) =>
                    setEditWife({ ...editWife, name: e.target.value })
                  }
                  placeholder="أدخل اسم الزوجة"
                />
              </div>

              <div>
                <div style={labelStyle}>رقم هوية الزوجة</div>
                <input
                  style={inputStyle}
                  value={editWife.id_number || ""}
                  onChange={(e) =>
                    setEditWife({ ...editWife, id_number: e.target.value })
                  }
                  placeholder="أدخل رقم الهوية"
                />
              </div>

              <div>
                <div style={labelStyle}>تاريخ ميلاد الزوجة</div>
                <input
                  type="date"
                  style={inputStyle}
                  value={
                    editWife.birth_date
                      ? String(editWife.birth_date).split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditWife({ ...editWife, birth_date: e.target.value })
                  }
                />
              </div>

              <div>
                <div style={labelStyle}>العمر</div>
                <input
                  style={readOnlyInputStyle}
                  value={liveWifeAge || ""}
                  readOnly
                  placeholder="يُحسب تلقائيًا"
                />
              </div>

              <div>
                <div style={labelStyle}>الحالة الصحية للزوجة</div>
                <input
                  style={inputStyle}
                  value={editWife.health_status || ""}
                  onChange={(e) =>
                    setEditWife({
                      ...editWife,
                      health_status: e.target.value,
                    })
                  }
                  placeholder="مثال: سليم"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ ...subSectionTitleStyle, marginBottom: "8px" }}>
                  تعديل أفراد العائلة
                </h3>
                <p style={{ ...helperTextStyle, marginBottom: 0 }}>
                  أضف أفرادًا جددًا أو عدّل بيانات الأفراد الحاليين أو احذف أي
                  فرد غير مطلوب.
                </p>
              </div>

              <button
                onClick={handleAddMember}
                type="button"
                style={{
                  ...actionButtonBase,
                  background: "#14532d",
                  padding: "10px 16px",
                }}
              >
                + إضافة فرد
              </button>
            </div>

            {editMembers.length === 0 ? (
              <div
                style={{
                  ...infoBoxStyle,
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                لا يوجد أفراد، يمكنك إضافة أفراد الآن
              </div>
            ) : (
              editMembers.map((member, index) => (
                <div
                  key={member.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "18px",
                    marginBottom: "16px",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        color: "#14532d",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      الفرد {index + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      style={{
                        ...actionButtonBase,
                        background: "#dc2626",
                        padding: "8px 14px",
                      }}
                    >
                      حذف
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={labelStyle}>الاسم الكامل</div>
                      <input
                        style={inputStyle}
                        value={member.full_name || ""}
                        onChange={(e) =>
                          handleMemberChange(index, "full_name", e.target.value)
                        }
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    <div>
                      <div style={labelStyle}>رقم الهوية</div>
                      <input
                        style={inputStyle}
                        value={member.id_number || ""}
                        onChange={(e) =>
                          handleMemberChange(index, "id_number", e.target.value)
                        }
                        placeholder="أدخل رقم الهوية"
                      />
                    </div>

                    <div>
                      <div style={labelStyle}>تاريخ الميلاد</div>
                      <input
                        type="date"
                        style={inputStyle}
                        value={
                          member.birth_date
                            ? String(member.birth_date).split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            "birth_date",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <div style={labelStyle}>العمر</div>
                      <input
                        style={readOnlyInputStyle}
                        value={calculateAge(member.birth_date) || ""}
                        readOnly
                        placeholder="يُحسب تلقائيًا"
                      />
                    </div>

                    <div>
                      <div style={labelStyle}>الجنس</div>
                      <select
                        style={inputStyle}
                        value={member.gender || "ذكر"}
                        onChange={(e) =>
                          handleMemberChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>

                    <div>
                      <div style={labelStyle}>الحالة الصحية</div>
                      <input
                        style={inputStyle}
                        value={member.health_status || ""}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            "health_status",
                            e.target.value,
                          )
                        }
                        placeholder="مثال: سليم"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={subSectionTitleStyle}>تعديل الوثائق</h3>
            <p style={helperTextStyle}>
              يمكنك تعديل نوع الوثيقة أو حذفها، كما يمكنك فتح أي وثيقة للتأكد من
              محتواها قبل الحفظ.
            </p>

            {editDocuments.length === 0 ? (
              <div
                style={{
                  ...infoBoxStyle,
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                لا توجد وثائق مرفوعة لهذه العائلة
              </div>
            ) : (
              editDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "18px",
                    marginBottom: "16px",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(220px, 2fr) minmax(180px, 1fr) auto",
                      gap: "12px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <div style={labelStyle}>نوع الوثيقة</div>
                      <input
                        style={inputStyle}
                        value={doc.doc_type || ""}
                        onChange={(e) =>
                          handleDocumentTypeChange(index, e.target.value)
                        }
                        placeholder="أدخل نوع الوثيقة"
                      />
                    </div>

                    <div>
                      <div style={labelStyle}>الملف</div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          ...actionButtonBase,
                          background: "#14532d",
                          display: "inline-block",
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        فتح الوثيقة
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      style={{
                        ...actionButtonBase,
                        background: "#dc2626",
                      }}
                    >
                      حذف الوثيقة
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSaveLocalEdit}
              disabled={saving}
              style={{
                ...actionButtonBase,
                background: saving ? "#9ca3af" : "#14532d",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ جميع التعديلات"}
            </button>

            <button
              onClick={() => setIsEditing(false)}
              style={{
                ...actionButtonBase,
                background: "#6b7280",
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>بيانات رب الأسرة</h2>
        <p style={helperTextStyle}>
          هذه البطاقة تعرض البيانات الأساسية الخاصة برب الأسرة كما هي محفوظة في
          الملف.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          <div style={infoBoxStyle}>
            <div style={labelStyle}>اسم رب الأسرة</div>
            <div style={valueStyle}>{family.head_name || "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>رقم الهوية</div>
            <div style={valueStyle}>{family.head_id_number || "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>العمر</div>
            <div style={valueStyle}>{family.age ?? "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>عدد أفراد الأسرة</div>
            <div style={valueStyle}>{family.family_members_count ?? "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>رقم الهاتف</div>
            <div style={valueStyle}>{family.phone || "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>تاريخ الميلاد</div>
            <div style={valueStyle}>
              {family.head_birth_date
                ? new Date(family.head_birth_date).toLocaleDateString("ar-EG")
                : "-"}
            </div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>الحالة الصحية</div>
            <div style={valueStyle}>{family.head_health_status || "-"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>مرض مزمن</div>
            <div style={valueStyle}>
              {family.has_chronic_disease ? "نعم" : "لا"}
            </div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>إعاقة</div>
            <div style={valueStyle}>{family.has_disability ? "نعم" : "لا"}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>تاريخ التسجيل</div>
            <div style={valueStyle}>
              {family.created_at
                ? new Date(family.created_at).toLocaleDateString("ar-EG")
                : "-"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <div style={labelStyle}>ملاحظات</div>
          <div style={{ ...infoBoxStyle, ...valueStyle }}>
            {family.notes || "لا توجد ملاحظات"}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>بيانات الزوجة</h2>
        <p style={helperTextStyle}>
          هذه البطاقة تعرض بيانات الزوجة المسجلة ضمن ملف العائلة.
        </p>

        {!wife ? (
          <div
            style={{ ...infoBoxStyle, color: "#4b5563", fontWeight: "bold" }}
          >
            لا توجد بيانات زوجة مسجلة
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            <div style={infoBoxStyle}>
              <div style={labelStyle}>اسم الزوجة</div>
              <div style={valueStyle}>{wife.name || "-"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>رقم الهوية</div>
              <div style={valueStyle}>{wife.id_number || "-"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>العمر</div>
              <div style={valueStyle}>{wife.age ?? "-"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>تاريخ الميلاد</div>
              <div style={valueStyle}>
                {wife.birth_date
                  ? new Date(wife.birth_date).toLocaleDateString("ar-EG")
                  : "-"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>الحالة الصحية</div>
              <div style={valueStyle}>{wife.health_status || "-"}</div>
            </div>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
              أفراد العائلة
            </h2>
            <p style={{ ...helperTextStyle, marginBottom: 0 }}>
              جدول يوضح جميع الأفراد المسجلين ضمن هذا الملف.
            </p>
          </div>
          <div style={badgeStyle}>العدد: {members.length}</div>
        </div>

        {members.length === 0 ? (
          <div
            style={{ ...infoBoxStyle, color: "#4b5563", fontWeight: "bold" }}
          >
            لا يوجد أفراد مسجلون
          </div>
        ) : (
          <div style={tableWrapStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
                background: "white",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>الاسم الكامل</th>
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
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={{ ...tdBaseStyle, fontWeight: "700" }}>
                      {member.full_name || "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {member.id_number || "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {member.age ?? "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {member.birth_date
                        ? new Date(member.birth_date).toLocaleDateString(
                            "ar-EG",
                          )
                        : "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {member.gender || "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {member.health_status || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
              الوثائق
            </h2>
            <p style={{ ...helperTextStyle, marginBottom: 0 }}>
              جميع الوثائق المرفوعة لهذه العائلة تظهر هنا مع إمكانية فتحها
              مباشرة.
            </p>
          </div>
          <div style={badgeStyle}>العدد: {documents.length}</div>
        </div>

        {documents.length === 0 ? (
          <div
            style={{ ...infoBoxStyle, color: "#4b5563", fontWeight: "bold" }}
          >
            لا توجد وثائق مرفوعة لهذه العائلة
          </div>
        ) : (
          <div style={tableWrapStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
                background: "white",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>نوع الوثيقة</th>
                  <th style={thStyle}>تاريخ الرفع</th>
                  <th style={thStyle}>الملف</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={{ ...tdBaseStyle, fontWeight: "700" }}>
                      {doc.doc_type || "-"}
                    </td>
                    <td style={{ ...tdBaseStyle, fontWeight: "600" }}>
                      {doc.uploaded_at
                        ? new Date(doc.uploaded_at).toLocaleDateString("ar-EG")
                        : "-"}
                    </td>
                    <td style={tdBaseStyle}>
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: "#14532d",
                            color: "white",
                            padding: "9px 14px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            display: "inline-block",
                          }}
                        >
                          فتح
                        </a>
                      ) : (
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          -
                        </span>
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
  );
}
