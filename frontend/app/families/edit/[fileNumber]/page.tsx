"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type FamilyForm = {
  file_number?: string;
  head_name: string;
  head_id_number: string;
  age?: number | null;
  family_members_count?: number | null;
  phone: string;
  head_birth_date: string;
  head_health_status: string;
  has_chronic_disease: boolean;
  has_disability: boolean;
  notes: string;
};

type WifeForm = {
  name: string;
  id_number: string;
  age?: number | null;
  birth_date: string;
  health_status: string;
};

type MemberForm = {
  id: string;
  full_name: string;
  id_number: string;
  age?: number | null;
  birth_date: string;
  gender: string;
  health_status: string;
};

export default function EditFamilyPage() {
  const params = useParams();
  const router = useRouter();
  const fileNumber = Array.isArray(params?.fileNumber)
    ? params.fileNumber[0]
    : (params?.fileNumber ?? "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [family, setFamily] = useState<FamilyForm>({
    file_number: "",
    head_name: "",
    head_id_number: "",
    age: null,
    family_members_count: 1,
    phone: "",
    head_birth_date: "",
    head_health_status: "سليم",
    has_chronic_disease: false,
    has_disability: false,
    notes: "",
  });

  const [wife, setWife] = useState<WifeForm>({
    name: "",
    id_number: "",
    age: null,
    birth_date: "",
    health_status: "سليم",
  });

  const [members, setMembers] = useState<MemberForm[]>([]);

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

  const fatherAge = useMemo(
    () => calculateAge(family.head_birth_date),
    [family.head_birth_date],
  );

  const wifeAge = useMemo(
    () => calculateAge(wife.birth_date),
    [wife.birth_date],
  );

  const familyMembersCount = useMemo(() => {
    const wifeCount = wife.name.trim() ? 1 : 0;
    return 1 + wifeCount + members.length;
  }, [wife.name, members.length]);

  useEffect(() => {
    if (!fileNumber) {
      setLoading(false);
      return;
    }

    const loadFamily = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_URL}/families/${fileNumber}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "تعذر تحميل بيانات العائلة");
        }

        const loadedFamily = data.family || {};
        const loadedWife = data.wife || {};
        const loadedMembers = Array.isArray(data.members) ? data.members : [];

        setFamily({
          file_number: loadedFamily.file_number || "",
          head_name: loadedFamily.head_name || "",
          head_id_number: loadedFamily.head_id_number || "",
          age: loadedFamily.age ?? null,
          family_members_count: loadedFamily.family_members_count ?? 1,
          phone: loadedFamily.phone || "",
          head_birth_date: loadedFamily.head_birth_date
            ? String(loadedFamily.head_birth_date).split("T")[0]
            : "",
          head_health_status: loadedFamily.head_health_status || "سليم",
          has_chronic_disease: !!loadedFamily.has_chronic_disease,
          has_disability: !!loadedFamily.has_disability,
          notes: loadedFamily.notes || "",
        });

        setWife({
          name: loadedWife.name || "",
          id_number: loadedWife.id_number || "",
          age: loadedWife.age ?? null,
          birth_date: loadedWife.birth_date
            ? String(loadedWife.birth_date).split("T")[0]
            : "",
          health_status: loadedWife.health_status || "سليم",
        });

        setMembers(
          loadedMembers.map((member: any) => ({
            id: member.id,
            full_name: member.full_name || "",
            id_number: member.id_number || "",
            age: member.age ?? null,
            birth_date: member.birth_date
              ? String(member.birth_date).split("T")[0]
              : "",
            gender: member.gender || "ذكر",
            health_status: member.health_status || "سليم",
          })),
        );
      } catch (error: any) {
        setErrorMessage(error.message || "حدث خطأ في تحميل بيانات العائلة");
      } finally {
        setLoading(false);
      }
    };

    loadFamily();
  }, [fileNumber]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!family.head_name.trim()) {
        throw new Error("يرجى إدخال اسم رب الأسرة");
      }

      if (!family.head_id_number.trim()) {
        throw new Error("يرجى إدخال رقم هوية رب الأسرة");
      }

      const response = await fetch(`${API_URL}/families/${fileNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          family: {
            ...family,
            age: fatherAge ? Number(fatherAge) : null,
            family_members_count: familyMembersCount,
          },
          wife: {
            ...wife,
            age: wifeAge ? Number(wifeAge) : null,
          },
          members: members.map((member) => ({
            ...member,
            age: member.birth_date
              ? Number(calculateAge(member.birth_date))
              : null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "تعذر حفظ التعديلات");
      }

      setSuccessMessage("تم حفظ التعديلات بنجاح");

      setTimeout(() => {
        router.push(`/families/${fileNumber}`);
      }, 1200);
    } catch (error: any) {
      setErrorMessage(error.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random()}`,
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
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const handleMemberChange = (
    index: number,
    field: keyof MemberForm,
    value: string,
  ) => {
    const updated = [...members];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setMembers(updated);
  };

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

  const helperTextStyle: React.CSSProperties = {
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
    marginBottom: "8px",
    fontWeight: "bold",
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

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  };

  const summaryGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  };

  const summaryCardStyle: React.CSSProperties = {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "18px",
    padding: "18px",
    textAlign: "center",
  };

  const summaryNumberStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#14532d",
    lineHeight: "1",
    marginBottom: "8px",
  };

  const summaryLabelStyle: React.CSSProperties = {
    color: "#166534",
    fontSize: "15px",
    fontWeight: "bold",
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

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...cardStyle,
            fontSize: "20px",
            fontWeight: "bold",
            color: "#111827",
          }}
        >
          جاري تحميل بيانات العائلة...
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <div style={topLinksWrapStyle}>
          <Link href="/dashboard" style={topLinkStyle}>
            ← العودة إلى لوحة التحكم
          </Link>

          <Link href={`/families/${fileNumber}`} style={topLinkStyle}>
            الرجوع إلى ملف العائلة
          </Link>
        </div>

        <h1 style={heroTitleStyle}>تعديل ملف العائلة</h1>
        <p style={heroTextStyle}>
          من هذه الصفحة يمكنك تعديل جميع بيانات الملف بشكل احترافي ومنظم، مع
          حساب الأعمار وعدد أفراد الأسرة تلقائيًا أثناء التعديل.
        </p>
      </div>

      {errorMessage ? (
        <div
          style={{
            ...cardStyle,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              color: "#b91c1c",
              fontWeight: "bold",
              fontSize: "15px",
              lineHeight: "1.8",
            }}
          >
            {errorMessage}
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div
          style={{
            ...cardStyle,
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              color: "#166534",
              fontWeight: "bold",
              fontSize: "15px",
              lineHeight: "1.8",
            }}
          >
            {successMessage}
          </div>
        </div>
      ) : null}

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>بيانات رب الأسرة</h2>
        <p style={helperTextStyle}>
          هذه البيانات أساسية داخل الملف، ويظهر أدناه العمر وعدد أفراد الأسرة
          بشكل تلقائي أثناء التعديل.
        </p>

        <div style={summaryGridStyle}>
          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{familyMembersCount}</div>
            <div style={summaryLabelStyle}>عدد أفراد الأسرة الحالي</div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{members.length}</div>
            <div style={summaryLabelStyle}>عدد الأفراد المضافين</div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryNumberStyle}>{wife.name.trim() ? "1" : "0"}</div>
            <div style={summaryLabelStyle}>الزوجة مضافة</div>
          </div>
        </div>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>اسم رب الأسرة</label>
            <input
              style={inputStyle}
              value={family.head_name}
              onChange={(e) =>
                setFamily({ ...family, head_name: e.target.value })
              }
              placeholder="أدخل اسم رب الأسرة"
            />
          </div>

          <div>
            <label style={labelStyle}>رقم هوية رب الأسرة</label>
            <input
              style={inputStyle}
              value={family.head_id_number}
              onChange={(e) =>
                setFamily({ ...family, head_id_number: e.target.value })
              }
              placeholder="أدخل رقم الهوية"
            />
          </div>

          <div>
            <label style={labelStyle}>رقم الهاتف</label>
            <input
              style={inputStyle}
              value={family.phone}
              onChange={(e) => setFamily({ ...family, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div>
            <label style={labelStyle}>تاريخ الميلاد</label>
            <input
              type="date"
              style={inputStyle}
              value={family.head_birth_date}
              onChange={(e) =>
                setFamily({ ...family, head_birth_date: e.target.value })
              }
            />
          </div>

          <div>
            <label style={labelStyle}>العمر</label>
            <input
              style={readOnlyInputStyle}
              value={fatherAge}
              readOnly
              placeholder="يُحسب تلقائيًا"
            />
          </div>

          <div>
            <label style={labelStyle}>عدد أفراد الأسرة</label>
            <input
              style={readOnlyInputStyle}
              value={String(familyMembersCount)}
              readOnly
            />
          </div>

          <div>
            <label style={labelStyle}>الحالة الصحية</label>
            <input
              style={inputStyle}
              value={family.head_health_status}
              onChange={(e) =>
                setFamily({ ...family, head_health_status: e.target.value })
              }
              placeholder="مثال: سليم"
            />
          </div>

          <div>
            <label style={labelStyle}>مرض مزمن</label>
            <select
              style={inputStyle}
              value={family.has_chronic_disease ? "نعم" : "لا"}
              onChange={(e) =>
                setFamily({
                  ...family,
                  has_chronic_disease: e.target.value === "نعم",
                })
              }
            >
              <option value="لا">لا</option>
              <option value="نعم">نعم</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>إعاقة</label>
            <select
              style={inputStyle}
              value={family.has_disability ? "نعم" : "لا"}
              onChange={(e) =>
                setFamily({
                  ...family,
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
          <label style={labelStyle}>ملاحظات</label>
          <textarea
            style={textareaStyle}
            value={family.notes}
            onChange={(e) => setFamily({ ...family, notes: e.target.value })}
            placeholder="أدخل أي ملاحظات إضافية متعلقة بالعائلة"
          />
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>بيانات الزوجة</h2>
        <p style={helperTextStyle}>
          يمكنك تعديل بيانات الزوجة هنا، وسيظهر العمر تلقائيًا بعد إدخال تاريخ
          الميلاد.
        </p>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>اسم الزوجة</label>
            <input
              style={inputStyle}
              value={wife.name}
              onChange={(e) => setWife({ ...wife, name: e.target.value })}
              placeholder="أدخل اسم الزوجة"
            />
          </div>

          <div>
            <label style={labelStyle}>رقم هوية الزوجة</label>
            <input
              style={inputStyle}
              value={wife.id_number}
              onChange={(e) => setWife({ ...wife, id_number: e.target.value })}
              placeholder="أدخل رقم الهوية"
            />
          </div>

          <div>
            <label style={labelStyle}>تاريخ ميلاد الزوجة</label>
            <input
              type="date"
              style={inputStyle}
              value={wife.birth_date}
              onChange={(e) => setWife({ ...wife, birth_date: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>العمر</label>
            <input
              style={readOnlyInputStyle}
              value={wifeAge}
              readOnly
              placeholder="يُحسب تلقائيًا"
            />
          </div>

          <div>
            <label style={labelStyle}>الحالة الصحية</label>
            <input
              style={inputStyle}
              value={wife.health_status}
              onChange={(e) =>
                setWife({ ...wife, health_status: e.target.value })
              }
              placeholder="مثال: سليم"
            />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          <div>
            <h2 style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
              أفراد العائلة
            </h2>
            <p style={{ ...helperTextStyle, marginBottom: 0 }}>
              يمكنك تعديل بيانات الأفراد، وسيظهر عمر كل فرد تلقائيًا.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            style={{
              ...actionButtonBase,
              background: "#14532d",
            }}
          >
            + إضافة فرد
          </button>
        </div>

        {members.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              background: "#f9fafb",
              boxShadow: "none",
              marginBottom: 0,
            }}
          >
            <div
              style={{
                color: "#4b5563",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              لا يوجد أفراد مضافون بعد.
            </div>
          </div>
        ) : (
          members.map((member, index) => (
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
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <h3
                  style={{
                    color: "#14532d",
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  الفرد {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  style={{
                    ...actionButtonBase,
                    background: "#dc2626",
                    padding: "10px 14px",
                  }}
                >
                  حذف الفرد
                </button>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>الاسم الكامل</label>
                  <input
                    style={inputStyle}
                    value={member.full_name}
                    onChange={(e) =>
                      handleMemberChange(index, "full_name", e.target.value)
                    }
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label style={labelStyle}>رقم الهوية</label>
                  <input
                    style={inputStyle}
                    value={member.id_number}
                    onChange={(e) =>
                      handleMemberChange(index, "id_number", e.target.value)
                    }
                    placeholder="أدخل رقم الهوية"
                  />
                </div>

                <div>
                  <label style={labelStyle}>تاريخ الميلاد</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={member.birth_date}
                    onChange={(e) =>
                      handleMemberChange(index, "birth_date", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>العمر</label>
                  <input
                    style={readOnlyInputStyle}
                    value={calculateAge(member.birth_date)}
                    readOnly
                    placeholder="يُحسب تلقائيًا"
                  />
                </div>

                <div>
                  <label style={labelStyle}>الجنس</label>
                  <select
                    style={inputStyle}
                    value={member.gender}
                    onChange={(e) =>
                      handleMemberChange(index, "gender", e.target.value)
                    }
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>الحالة الصحية</label>
                  <select
                    style={inputStyle}
                    value={member.health_status}
                    onChange={(e) =>
                      handleMemberChange(index, "health_status", e.target.value)
                    }
                  >
                    <option value="سليم">سليم</option>
                    <option value="مريض">مريض</option>
                    <option value="يحتاج متابعة">يحتاج متابعة</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...actionButtonBase,
              background: saving ? "#9ca3af" : "#14532d",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "جاري حفظ التعديلات..." : "حفظ التعديلات"}
          </button>

          <Link
            href={`/families/${fileNumber}`}
            style={{
              ...actionButtonBase,
              background: "#6b7280",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            إلغاء والعودة
          </Link>
        </div>
      </div>
    </div>
  );
}
