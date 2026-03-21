"use client";
import { API_URL } from "@/lib/api";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MemberForm = {
  id: string;
  fullName: string;
  idNumber: string;
  birthDate: string;
  gender: string;
  healthStatus: string;
};

export default function AddFamilyPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [family, setFamily] = useState({
    fatherName: "",
    fatherId: "",
    fatherBirth: "",
    phone: "",
    fatherHealthStatus: "سليم",
    fatherChronicDisease: "لا",
    fatherDisability: "لا",
    notes: "",

    motherName: "",
    motherId: "",
    motherBirth: "",
    motherHealthStatus: "سليم",
  });

  const [members, setMembers] = useState<MemberForm[]>([]);

  const calculateAge = (birthDate: string) => {
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
    () => calculateAge(family.fatherBirth),
    [family.fatherBirth],
  );

  const motherAge = useMemo(
    () => calculateAge(family.motherBirth),
    [family.motherBirth],
  );

  const totalFamilyCount = useMemo(() => {
    const wifeCount = family.motherName.trim() ? 1 : 0;
    return 1 + wifeCount + members.length;
  }, [family.motherName, members.length]);

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        fullName: "",
        idNumber: "",
        birthDate: "",
        gender: "ذكر",
        healthStatus: "سليم",
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

  const validateForm = () => {
    if (!family.fatherName.trim()) {
      return "يرجى إدخال اسم رب الأسرة";
    }

    if (!family.fatherId.trim()) {
      return "يرجى إدخال رقم هوية رب الأسرة";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/families`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          family,
          members,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في حفظ العائلة");
      }

      setSuccessMessage(
        `تم حفظ العائلة بنجاح. رقم الملف الجديد: ${data.fileNumber || "-"}`,
      );

      setTimeout(() => {
        if (data.fileNumber) {
          router.push(`/families/${data.fileNumber}`);
        } else {
          router.push("/families");
        }
      }, 1200);
    } catch (error: any) {
      console.error("خطأ في حفظ العائلة:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء حفظ العائلة");
    } finally {
      setSaving(false);
    }
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

  const infoBoxStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
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

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <div style={topLinksWrapStyle}>
          <Link href="/dashboard" style={topLinkStyle}>
            ← العودة إلى لوحة التحكم
          </Link>

          <Link href="/families" style={topLinkStyle}>
            الرجوع إلى قائمة العائلات
          </Link>
        </div>

        <h1 style={heroTitleStyle}>إضافة عائلة جديدة</h1>
        <p style={heroTextStyle}>
          من هذه الصفحة يمكنك إنشاء ملف عائلة جديد بشكل منظم وواضح. ابدأ ببيانات
          رب الأسرة، ثم الزوجة، ثم أضف أفراد العائلة الآخرين عند الحاجة.
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

      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>بيانات رب الأسرة</h2>
          <p style={helperTextStyle}>
            هذه البيانات أساسية لإنشاء الملف، لذلك احرص على إدخال الاسم ورقم
            الهوية بشكل صحيح وواضح. كما يظهر أدناه عدد أفراد الأسرة الحالي بشكل
            تلقائي أثناء إدخال البيانات.
          </p>

          <div style={summaryGridStyle}>
            <div style={summaryCardStyle}>
              <div style={summaryNumberStyle}>{totalFamilyCount}</div>
              <div style={summaryLabelStyle}>عدد أفراد الأسرة الحالي</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryNumberStyle}>{members.length}</div>
              <div style={summaryLabelStyle}>عدد الأفراد المضافين</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryNumberStyle}>
                {family.motherName.trim() ? "1" : "0"}
              </div>
              <div style={summaryLabelStyle}>الزوجة مضافة</div>
            </div>
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>اسم رب الأسرة</label>
              <input
                style={inputStyle}
                value={family.fatherName}
                onChange={(e) =>
                  setFamily({ ...family, fatherName: e.target.value })
                }
                placeholder="أدخل اسم رب الأسرة"
              />
            </div>

            <div>
              <label style={labelStyle}>رقم هوية رب الأسرة</label>
              <input
                style={inputStyle}
                value={family.fatherId}
                onChange={(e) =>
                  setFamily({ ...family, fatherId: e.target.value })
                }
                placeholder="أدخل رقم الهوية"
              />
            </div>

            <div>
              <label style={labelStyle}>رقم الهاتف</label>
              <input
                style={inputStyle}
                value={family.phone}
                onChange={(e) =>
                  setFamily({ ...family, phone: e.target.value })
                }
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            <div>
              <label style={labelStyle}>تاريخ الميلاد</label>
              <input
                type="date"
                style={inputStyle}
                value={family.fatherBirth}
                onChange={(e) =>
                  setFamily({ ...family, fatherBirth: e.target.value })
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
              <label style={labelStyle}>الحالة الصحية</label>
              <select
                style={inputStyle}
                value={family.fatherHealthStatus}
                onChange={(e) =>
                  setFamily({
                    ...family,
                    fatherHealthStatus: e.target.value,
                  })
                }
              >
                <option value="سليم">سليم</option>
                <option value="مريض">مريض</option>
                <option value="يحتاج متابعة">يحتاج متابعة</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>مرض مزمن</label>
              <select
                style={inputStyle}
                value={family.fatherChronicDisease}
                onChange={(e) =>
                  setFamily({
                    ...family,
                    fatherChronicDisease: e.target.value,
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
                value={family.fatherDisability}
                onChange={(e) =>
                  setFamily({
                    ...family,
                    fatherDisability: e.target.value,
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
            يمكنك إدخال بيانات الزوجة الآن أو استكمالها لاحقًا، بحسب توفر
            المعلومات، وسيتم حساب العمر تلقائيًا بمجرد إدخال تاريخ الميلاد.
          </p>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>اسم الزوجة</label>
              <input
                style={inputStyle}
                value={family.motherName}
                onChange={(e) =>
                  setFamily({ ...family, motherName: e.target.value })
                }
                placeholder="أدخل اسم الزوجة"
              />
            </div>

            <div>
              <label style={labelStyle}>رقم هوية الزوجة</label>
              <input
                style={inputStyle}
                value={family.motherId}
                onChange={(e) =>
                  setFamily({ ...family, motherId: e.target.value })
                }
                placeholder="أدخل رقم الهوية"
              />
            </div>

            <div>
              <label style={labelStyle}>تاريخ ميلاد الزوجة</label>
              <input
                type="date"
                style={inputStyle}
                value={family.motherBirth}
                onChange={(e) =>
                  setFamily({ ...family, motherBirth: e.target.value })
                }
              />
            </div>

            <div>
              <label style={labelStyle}>العمر</label>
              <input
                style={readOnlyInputStyle}
                value={motherAge}
                readOnly
                placeholder="يُحسب تلقائيًا"
              />
            </div>

            <div>
              <label style={labelStyle}>الحالة الصحية للزوجة</label>
              <select
                style={inputStyle}
                value={family.motherHealthStatus}
                onChange={(e) =>
                  setFamily({
                    ...family,
                    motherHealthStatus: e.target.value,
                  })
                }
              >
                <option value="سليم">سليم</option>
                <option value="مريض">مريض</option>
                <option value="تحتاج متابعة">تحتاج متابعة</option>
              </select>
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
                أضف جميع الأفراد الآخرين المسجلين ضمن نفس الملف، مثل الأبناء أو
                أي فرد تابع للعائلة، وسيتم حساب العمر تلقائيًا لكل فرد.
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
            <div style={infoBoxStyle}>
              <div
                style={{
                  color: "#4b5563",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                لا يوجد أفراد مضافون بعد. يمكنك البدء بإضافة فرد جديد من الزر
                أعلاه.
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
                      value={member.fullName}
                      onChange={(e) =>
                        handleMemberChange(index, "fullName", e.target.value)
                      }
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>رقم الهوية</label>
                    <input
                      style={inputStyle}
                      value={member.idNumber}
                      onChange={(e) =>
                        handleMemberChange(index, "idNumber", e.target.value)
                      }
                      placeholder="أدخل رقم الهوية"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>تاريخ الميلاد</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={member.birthDate}
                      onChange={(e) =>
                        handleMemberChange(index, "birthDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>العمر</label>
                    <input
                      style={readOnlyInputStyle}
                      value={calculateAge(member.birthDate)}
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
                      value={member.healthStatus}
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          "healthStatus",
                          e.target.value,
                        )
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
              type="submit"
              disabled={saving}
              style={{
                ...actionButtonBase,
                background: saving ? "#9ca3af" : "#14532d",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "جاري حفظ العائلة..." : "حفظ العائلة"}
            </button>

            <Link
              href="/families"
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
      </form>
    </div>
  );
}
