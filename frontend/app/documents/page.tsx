"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppTopNav from "@/components/AppTopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_URL } from "@/lib/api";

type DocumentItem = {
  id: string;
  doc_type?: string;
  file_url?: string;
  uploaded_at?: string;
  file_number?: string;
  head_name?: string;
};

function DocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyFromQuery = searchParams?.get("family") || "";

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [fileNumber, setFileNumber] = useState(familyFromQuery);
  const [docType, setDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [search, setSearch] = useState(familyFromQuery);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "تعذر تحميل الوثائق");
      }

      const rows = Array.isArray(data) ? data : [];
      setDocuments(rows);
    } catch (error: any) {
      console.error("خطأ في جلب الوثائق:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء تحميل الوثائق");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return documents;

    return documents.filter((doc) => {
      const fileNumberValue = (doc.file_number || "").toLowerCase();
      const headNameValue = (doc.head_name || "").toLowerCase();
      const docTypeValue = (doc.doc_type || "").toLowerCase();

      return (
        fileNumberValue.includes(keyword) ||
        headNameValue.includes(keyword) ||
        docTypeValue.includes(keyword)
      );
    });
  }, [documents, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!fileNumber.trim()) {
      setErrorMessage("يرجى إدخال رقم الملف");
      return;
    }

    if (!docType.trim()) {
      setErrorMessage("يرجى إدخال نوع الوثيقة");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("يرجى اختيار ملف لرفعه");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("fileNumber", fileNumber.trim());
      formData.append("docType", docType.trim());
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في رفع الوثيقة");
      }

      setSuccessMessage("تم رفع الوثيقة بنجاح");
      setDocType("");
      setSelectedFile(null);

      await fetchDocuments();
      setSearch(fileNumber.trim());
    } catch (error: any) {
      console.error("خطأ في رفع الوثيقة:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء رفع الوثيقة");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الوثيقة؟");
    if (!confirmed) return;

    try {
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "فشل في حذف الوثيقة");
      }

      setSuccessMessage("تم حذف الوثيقة بنجاح");
      await fetchDocuments();
    } catch (error: any) {
      console.error("خطأ في حذف الوثيقة:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء حذف الوثيقة");
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
    padding: "32px",
    borderRadius: "24px",
    marginBottom: "24px",
    boxShadow: "0 16px 36px rgba(20,83,45,0.24)",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: "#14532d",
    fontSize: "28px",
    margin: "0 0 12px 0",
    fontWeight: "bold",
  };

  const helperStyle: React.CSSProperties = {
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

  const fileInputWrapStyle: React.CSSProperties = {
    border: "1px dashed #9ca3af",
    borderRadius: "16px",
    padding: "16px",
    background: "#f9fafb",
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    background: uploading ? "#9ca3af" : "#14532d",
    color: "white",
    border: "none",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: "bold",
    cursor: uploading ? "not-allowed" : "pointer",
    fontSize: "16px",
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

  const actionButtonStyle: React.CSSProperties = {
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div style={pageStyle}>
      <AppTopNav
        title="إدارة الوثائق"
        subtitle="رفع الوثائق ومراجعتها والبحث فيها والرجوع السريع إلى لوحة التحكم وبقية صفحات النظام."
      />

      <div style={heroStyle}>
        <h1
          style={{
            fontSize: "38px",
            margin: "0 0 10px 0",
            fontWeight: "bold",
            color: "white",
            lineHeight: "1.2",
          }}
        >
          إدارة الوثائق
        </h1>

        <p
          style={{
            color: "#ecfdf5",
            fontSize: "16px",
            margin: 0,
            fontWeight: "500",
            lineHeight: "1.9",
            maxWidth: "760px",
          }}
        >
          من هذه الصفحة يمكنك رفع الوثائق المرتبطة بالعائلات، ومراجعة جميع
          الوثائق المرفوعة، والبحث فيها بسهولة، وحذف أي وثيقة غير مطلوبة.
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
        <h2 style={sectionTitleStyle}>رفع وثيقة جديدة</h2>
        <p style={helperStyle}>
          أدخل رقم الملف المرتبط بالوثيقة، ثم اختر نوع الوثيقة والملف المراد
          رفعه. إذا دخلت لهذه الصفحة من داخل ملف عائلة فسيتم تعبئة رقم الملف
          تلقائيًا.
        </p>

        <form onSubmit={handleUpload}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={labelStyle}>رقم الملف</label>
              <input
                style={inputStyle}
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                placeholder="مثال: CA-0002"
              />
            </div>

            <div>
              <label style={labelStyle}>نوع الوثيقة</label>
              <input
                style={inputStyle}
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="مثال: هوية، شهادة ميلاد، تقرير طبي"
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>اختيار الملف</label>
            <div style={fileInputWrapStyle}>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{
                  width: "100%",
                  fontSize: "15px",
                  color: "#111827",
                  fontWeight: "600",
                }}
              />

              <div
                style={{
                  marginTop: "10px",
                  color: "#4b5563",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {selectedFile
                  ? `الملف المحدد: ${selectedFile.name}`
                  : "لم يتم اختيار ملف بعد"}
              </div>
            </div>
          </div>

          <button type="submit" disabled={uploading} style={buttonPrimaryStyle}>
            {uploading ? "جاري رفع الوثيقة..." : "رفع الوثيقة"}
          </button>
        </form>
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
            <h2 style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
              الوثائق المرفوعة
            </h2>
            <p style={{ ...helperStyle, marginBottom: 0 }}>
              يمكنك البحث باستخدام رقم الملف أو اسم رب الأسرة أو نوع الوثيقة، ثم
              فتح الوثيقة أو حذفها عند الحاجة.
            </p>
          </div>

          <div style={badgeStyle}>العدد: {filteredDocuments.length}</div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>البحث داخل الوثائق</label>
          <input
            style={inputStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الملف أو اسم رب الأسرة أو نوع الوثيقة"
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
            جاري تحميل الوثائق...
          </div>
        ) : filteredDocuments.length === 0 ? (
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
            لا توجد وثائق مطابقة للبحث الحالي
          </div>
        ) : (
          <div style={tableWrapStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                minWidth: "850px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>رقم الملف</th>
                  <th style={thStyle}>اسم رب الأسرة</th>
                  <th style={thStyle}>نوع الوثيقة</th>
                  <th style={thStyle}>تاريخ الرفع</th>
                  <th style={thStyle}>الملف</th>
                  <th style={thStyle}>العمليات</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={tdStyle}>{doc.file_number || "-"}</td>
                    <td style={tdStyle}>{doc.head_name || "-"}</td>
                    <td style={tdStyle}>{doc.doc_type || "-"}</td>
                    <td style={tdStyle}>
                      {doc.uploaded_at
                        ? new Date(doc.uploaded_at).toLocaleDateString("ar-EG")
                        : "-"}
                    </td>
                    <td style={tdStyle}>
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...actionButtonStyle,
                            background: "#14532d",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          فتح
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {doc.file_number ? (
                          <button
                            onClick={() =>
                              router.push(`/families/${doc.file_number}`)
                            }
                            style={{
                              ...actionButtonStyle,
                              background: "#2563eb",
                            }}
                          >
                            فتح الملف
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          style={{
                            ...actionButtonStyle,
                            background: "#dc2626",
                          }}
                        >
                          حذف
                        </button>
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
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              direction: "rtl",
              fontFamily: "Arial, sans-serif",
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
                border: "1px solid #e5e7eb",
                color: "#14532d",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              جاري تحميل صفحة الوثائق...
            </div>
          </div>
        }
      >
        <DocumentsPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
