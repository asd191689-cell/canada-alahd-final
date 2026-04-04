import { handleUpload } from "@vercel/blob/client";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload =
          typeof clientPayload === "string"
            ? JSON.parse(clientPayload || "{}")
            : clientPayload || {};

        const fileNumber = String(payload.fileNumber || "").trim();
        const docType = String(payload.docType || "").trim();

        if (!fileNumber) {
          throw new Error("رقم الملف مطلوب");
        }

        // أنواع الوثائق المسموحة (مهم عشان ما يرجع خطأ enum)
        const allowedDocTypes = ["هوية", "صورة شخصية", "وثيقة_أخرى"];

        const safeDocType = allowedDocTypes.includes(docType)
          ? docType
          : "وثيقة_أخرى";

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ],

          // 👇 هنا تقدر ترفع حتى 20MB بدون مشكلة
          maximumSizeInBytes: 20 * 1024 * 1024,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            fileNumber,
            docType: safeDocType,
          }),
        };
      },

      onUploadCompleted: async () => {
        // هنا فقط تأكيد
        return { success: true };
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload token error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "فشل إنشاء توكن الرفع",
      },
      { status: 400 },
    );
  }
}
