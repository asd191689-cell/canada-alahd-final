require("dotenv").config();
const ExcelJS = require("exceljs");
const { put, del } = require("@vercel/blob");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const bcrypt = require("bcryptjs");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://canada-alahd-final.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedExact = allowedOrigins.includes(origin);
      const isAllowedVercelPreview =
        origin.endsWith(".vercel.app") && origin.includes("canada-alahd-final");

      if (isAllowedExact || isAllowedVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";

function ensureBlobToken() {
  if (!BLOB_TOKEN) {
    const error = new Error(
      "BLOB_READ_WRITE_TOKEN is missing from backend environment variables",
    );
    error.code = "BLOB_TOKEN_MISSING";
    throw error;
  }
}

function calculateAge(birthDate) {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

function calculateFamilyMembersCount(family, members) {
  const wifeCount = family?.motherName?.trim() ? 1 : 0;
  const membersCount = Array.isArray(members) ? members.length : 0;
  return 1 + wifeCount + membersCount;
}

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "اسم المستخدم وكلمة المرور مطلوبان",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, username, password_hash, full_name, role, is_active
      FROM users
      WHERE username = $1
      LIMIT 1
      `,
      [username.trim()],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "هذا الحساب غير مفعل",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password_hash || "",
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    return res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      details: error.message,
    });
  }
});

app.get("/dashboard/stats", async (req, res) => {
  try {
    const families = await pool.query(
      "SELECT COUNT(*) FROM families WHERE deleted_at IS NULL",
    );

    const members = await pool.query("SELECT COUNT(*) FROM members");
    const documents = await pool.query("SELECT COUNT(*) FROM documents");

    const avgFamilySizeResult = await pool.query(`
      SELECT AVG(family_members_count) AS avg_family_size
      FROM families
      WHERE deleted_at IS NULL
    `);

    const latestFamiliesResult = await pool.query(`
      SELECT
        file_number,
        head_name,
        phone,
        family_members_count,
        created_at
      FROM families
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      families: parseInt(families.rows[0].count, 10),
      members: parseInt(members.rows[0].count, 10),
      documents: parseInt(documents.rows[0].count, 10),
      avgFamilySize: Number(
        avgFamilySizeResult.rows[0]?.avg_family_size || 0,
      ).toFixed(1),
      latestFamilies: latestFamiliesResult.rows,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الإحصائيات",
      details: error.message,
    });
  }
});

app.get("/families", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        file_number,
        head_name,
        head_id_number,
        phone,
        age,
        family_members_count,
        created_at
      FROM families
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error loading families:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب العائلات",
      details: error.message,
    });
  }
});

app.get("/families/:fileNumber", async (req, res) => {
  const { fileNumber } = req.params;

  try {
    const familyResult = await pool.query(
      `
      SELECT *
      FROM families
      WHERE file_number = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [fileNumber],
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "العائلة غير موجودة",
      });
    }

    const family = familyResult.rows[0];

    const wifeResult = await pool.query(
      `
      SELECT *
      FROM wives
      WHERE family_id = $1
      LIMIT 1
      `,
      [family.id],
    );

    const membersResult = await pool.query(
      `
      SELECT *
      FROM members
      WHERE family_id = $1
      ORDER BY id ASC
      `,
      [family.id],
    );

    const documentsResult = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE family_id = $1
      ORDER BY uploaded_at DESC
      `,
      [family.id],
    );

    return res.json({
      success: true,
      family,
      wife: wifeResult.rows[0] || null,
      members: membersResult.rows,
      documents: documentsResult.rows,
    });
  } catch (error) {
    console.error("Family details error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب ملف العائلة",
      details: error.message,
    });
  }
});

app.post("/families", async (req, res) => {
  const { family, members } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fatherName = family?.fatherName?.trim() || "";
    const fatherId = family?.fatherId?.trim() || "";
    const fatherBirth = family?.fatherBirth || null;
    const phone = family?.phone?.trim() || "";
    const fatherHealthStatus = family?.fatherHealthStatus?.trim() || "سليم";
    const notes = family?.notes?.trim() || "";

    if (!fatherName) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "اسم رب الأسرة مطلوب",
      });
    }

    if (!fatherId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "رقم هوية رب الأسرة مطلوب",
      });
    }

    const fatherAge = calculateAge(fatherBirth);
    const familyMembersCount = calculateFamilyMembersCount(family, members);

    const counterResult = await client.query(`
      UPDATE counters
      SET value = value + 1
      WHERE name = 'family_file'
      RETURNING value
    `);

    const counterValue = counterResult.rows[0].value;
    const fileNumber = `CA-${String(counterValue).padStart(4, "0")}`;

    const familyInsert = await client.query(
      `
      INSERT INTO families (
        file_number,
        head_name,
        head_id_number,
        age,
        family_members_count,
        head_gender,
        head_birth_date,
        phone,
        head_health_status,
        has_chronic_disease,
        has_disability,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, file_number
      `,
      [
        fileNumber,
        fatherName,
        fatherId,
        fatherAge,
        familyMembersCount,
        "ذكر",
        fatherBirth,
        phone,
        fatherHealthStatus,
        family?.fatherChronicDisease === "نعم",
        family?.fatherDisability === "نعم",
        notes,
      ],
    );

    const familyId = familyInsert.rows[0].id;

    const motherBirth = family?.motherBirth || null;
    const motherAge = calculateAge(motherBirth);

    await client.query(
      `
      INSERT INTO wives (
        family_id,
        name,
        id_number,
        age,
        birth_date,
        health_status
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        familyId,
        family?.motherName?.trim() || null,
        family?.motherId?.trim() || null,
        motherAge,
        motherBirth,
        family?.motherHealthStatus?.trim() || "سليم",
      ],
    );

    for (const member of members || []) {
      const memberBirthDate = member?.birthDate || member?.birth_date || null;
      const memberAge = calculateAge(memberBirthDate);

      await client.query(
        `
        INSERT INTO members (
          family_id,
          full_name,
          age,
          gender,
          health_status,
          id_number,
          birth_date
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          familyId,
          member?.fullName?.trim() || member?.full_name?.trim() || "",
          memberAge,
          member?.gender || "ذكر",
          member?.healthStatus?.trim() ||
            member?.health_status?.trim() ||
            "سليم",
          member?.idNumber?.trim() || member?.id_number?.trim() || "",
          memberBirthDate,
        ],
      );
    }

    await client.query(
      `
      INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        meta
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        "إضافة عائلة جديدة",
        "family",
        familyId,
        JSON.stringify({
          file_number: fileNumber,
          head_name: fatherName,
        }),
      ],
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "تم حفظ العائلة بنجاح في قاعدة البيانات",
      fileNumber: familyInsert.rows[0].file_number,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("DB Save Error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ البيانات",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.put("/families/:fileNumber", async (req, res) => {
  const { fileNumber } = req.params;
  const { family, wife, members } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const familyResult = await client.query(
      `
      SELECT id, head_name, head_id_number, phone, age, family_members_count,
             head_birth_date, head_health_status, has_chronic_disease,
             has_disability, notes
      FROM families
      WHERE file_number = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [fileNumber],
    );

    if (familyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "العائلة غير موجودة",
      });
    }

    const existingFamily = familyResult.rows[0];
    const familyId = existingFamily.id;

    const headName = family?.head_name?.trim() || existingFamily.head_name;
    const headIdNumber =
      family?.head_id_number?.trim() || existingFamily.head_id_number;
    const phone =
      family?.phone !== undefined
        ? family.phone?.trim() || ""
        : existingFamily.phone;
    const headBirthDate =
      family?.head_birth_date !== undefined
        ? family.head_birth_date || null
        : existingFamily.head_birth_date;
    const headHealthStatus =
      family?.head_health_status?.trim() ||
      existingFamily.head_health_status ||
      "سليم";
    const hasChronicDisease =
      family?.has_chronic_disease !== undefined
        ? !!family.has_chronic_disease
        : existingFamily.has_chronic_disease;
    const hasDisability =
      family?.has_disability !== undefined
        ? !!family.has_disability
        : existingFamily.has_disability;
    const notes =
      family?.notes !== undefined
        ? family.notes?.trim() || ""
        : existingFamily.notes || "";

    const headAge = calculateAge(headBirthDate);

    const wifeName = wife?.name !== undefined ? wife.name?.trim() || "" : "";
    const updatedFamilyMembersCount =
      1 + (wifeName ? 1 : 0) + (Array.isArray(members) ? members.length : 0);

    await client.query(
      `
      UPDATE families
      SET
        head_name = $1,
        head_id_number = $2,
        phone = $3,
        age = $4,
        family_members_count = $5,
        head_birth_date = $6,
        head_health_status = $7,
        has_chronic_disease = $8,
        has_disability = $9,
        notes = $10,
        updated_at = NOW()
      WHERE id = $11
      `,
      [
        headName,
        headIdNumber,
        phone,
        headAge,
        updatedFamilyMembersCount,
        headBirthDate,
        headHealthStatus,
        hasChronicDisease,
        hasDisability,
        notes,
        familyId,
      ],
    );

    const wifeCheck = await client.query(
      `
      SELECT id
      FROM wives
      WHERE family_id = $1
      LIMIT 1
      `,
      [familyId],
    );

    const wifeBirthDate = wife?.birth_date || null;
    const wifeAge = calculateAge(wifeBirthDate);

    if (wifeCheck.rows.length > 0) {
      await client.query(
        `
        UPDATE wives
        SET
          name = $1,
          id_number = $2,
          age = $3,
          birth_date = $4,
          health_status = $5
        WHERE family_id = $6
        `,
        [
          wife?.name?.trim() || null,
          wife?.id_number?.trim() || null,
          wifeAge,
          wifeBirthDate,
          wife?.health_status?.trim() || "سليم",
          familyId,
        ],
      );
    } else {
      await client.query(
        `
        INSERT INTO wives (
          family_id,
          name,
          id_number,
          age,
          birth_date,
          health_status
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          familyId,
          wife?.name?.trim() || null,
          wife?.id_number?.trim() || null,
          wifeAge,
          wifeBirthDate,
          wife?.health_status?.trim() || "سليم",
        ],
      );
    }

    await client.query(
      `
      DELETE FROM members
      WHERE family_id = $1
      `,
      [familyId],
    );

    for (const member of members || []) {
      const memberBirthDate = member?.birth_date || member?.birthDate || null;
      const memberAge = calculateAge(memberBirthDate);

      await client.query(
        `
        INSERT INTO members (
          family_id,
          full_name,
          age,
          gender,
          health_status,
          id_number,
          birth_date
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          familyId,
          member?.full_name?.trim() || member?.fullName?.trim() || "",
          memberAge,
          member?.gender || "ذكر",
          member?.health_status?.trim() ||
            member?.healthStatus?.trim() ||
            "سليم",
          member?.id_number?.trim() || member?.idNumber?.trim() || "",
          memberBirthDate,
        ],
      );
    }

    await client.query(
      `
      INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        meta
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        "تعديل ملف عائلة",
        "family",
        familyId,
        JSON.stringify({
          file_number: fileNumber,
          head_name: headName,
        }),
      ],
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "تم تحديث ملف العائلة بنجاح",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Family update error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث ملف العائلة",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.delete("/families/:fileNumber", async (req, res) => {
  const { fileNumber } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const familyResult = await client.query(
      `
      SELECT id
      FROM families
      WHERE file_number = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [fileNumber],
    );

    if (familyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "العائلة غير موجودة",
      });
    }

    const familyId = familyResult.rows[0].id;

    const docsResult = await client.query(
      `
      SELECT file_url
      FROM documents
      WHERE family_id = $1
      `,
      [familyId],
    );

    for (const doc of docsResult.rows) {
      if (doc.file_url) {
        try {
          ensureBlobToken();
          await del(doc.file_url, {
            token: BLOB_TOKEN,
          });
        } catch (blobError) {
          console.error(
            "Blob delete error while deleting family files:",
            blobError,
          );
        }
      }
    }

    await client.query(`DELETE FROM documents WHERE family_id = $1`, [
      familyId,
    ]);
    await client.query(`DELETE FROM members WHERE family_id = $1`, [familyId]);
    await client.query(`DELETE FROM wives WHERE family_id = $1`, [familyId]);
    await client.query(`DELETE FROM families WHERE id = $1`, [familyId]);

    await client.query(
      `
      INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        meta
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        "حذف ملف عائلة",
        "family",
        familyId,
        JSON.stringify({
          file_number: fileNumber,
        }),
      ],
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "تم حذف العائلة بنجاح",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete family error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف العائلة",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.post("/documents/upload", upload.single("file"), async (req, res) => {
  try {
    const { fileNumber, docType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "يرجى اختيار ملف",
      });
    }

    if (!fileNumber) {
      return res.status(400).json({
        success: false,
        message: "رقم الملف مطلوب",
      });
    }

    ensureBlobToken();

    const familyResult = await pool.query(
      `
      SELECT id
      FROM families
      WHERE file_number = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [fileNumber],
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "العائلة غير موجودة",
      });
    }

    const familyId = familyResult.rows[0].id;
    const safeFileName = req.file.originalname.replace(/\s+/g, "-");

    const blob = await put(
      `documents/${fileNumber}/${Date.now()}-${safeFileName}`,
      req.file.buffer,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: req.file.mimetype || "application/octet-stream",
        token: BLOB_TOKEN,
      },
    );

    const fileUrl = blob.url;

    await pool.query(
      `
      INSERT INTO documents (
        family_id,
        doc_type,
        file_url,
        uploaded_at
      )
      VALUES ($1, $2, $3, NOW())
      `,
      [familyId, docType || "وثيقة_أخرى", fileUrl],
    );

    return res.json({
      success: true,
      message: "تم رفع الوثيقة بنجاح",
      fileUrl,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    if (error?.code === "BLOB_TOKEN_MISSING") {
      return res.status(500).json({
        success: false,
        message: "متغير BLOB_READ_WRITE_TOKEN غير موجود في إعدادات الباك إند",
        details: error.message,
      });
    }

    if (
      error?.message?.includes("Access denied") ||
      error?.name === "BlobAccessError"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "توكن Vercel Blob غير صحيح أو غير مربوط بنفس Blob Store الخاصة بمشروع الباك إند",
        details: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الوثيقة",
      details: error.message,
    });
  }
});

app.put("/documents/:id", async (req, res) => {
  const { id } = req.params;
  const { docType } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE documents
      SET doc_type = $1
      WHERE id = $2
      RETURNING id
      `,
      [docType || "وثيقة_أخرى", id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "الوثيقة غير موجودة",
      });
    }

    return res.json({
      success: true,
      message: "تم تحديث الوثيقة بنجاح",
    });
  } catch (error) {
    console.error("Update document error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الوثيقة",
      details: error.message,
    });
  }
});

app.delete("/documents/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docResult = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "الوثيقة غير موجودة",
      });
    }

    const document = docResult.rows[0];

    if (document.file_url) {
      try {
        ensureBlobToken();
        await del(document.file_url, {
          token: BLOB_TOKEN,
        });
      } catch (blobError) {
        console.error("Blob delete error:", blobError);
      }
    }

    await pool.query(
      `
      DELETE FROM documents
      WHERE id = $1
      `,
      [id],
    );

    return res.json({
      success: true,
      message: "تم حذف الوثيقة بنجاح",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الوثيقة",
      details: error.message,
    });
  }
});

app.get("/documents", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.doc_type,
        d.file_url,
        d.uploaded_at,
        f.file_number,
        f.head_name
      FROM documents d
      JOIN families f ON f.id = d.family_id
      ORDER BY d.uploaded_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Documents error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الوثائق",
      details: error.message,
    });
  }
});

app.get("/audit", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        action,
        entity_type,
        entity_id,
        created_at,
        meta
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const rows = result.rows.map((row) => {
      let parsedMeta = row.meta;

      if (typeof row.meta === "string") {
        try {
          parsedMeta = JSON.parse(row.meta);
        } catch {
          parsedMeta = row.meta;
        }
      }

      return {
        ...row,
        meta: parsedMeta,
      };
    });

    res.json(rows);
  } catch (error) {
    console.error("Audit error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب سجل التعديلات",
      details: error.message,
    });
  }
});

app.get("/export", async (req, res) => {
  try {
    const familiesResult = await pool.query(`
      SELECT
        f.id,
        f.file_number,
        f.head_name,
        f.head_id_number,
        f.age AS head_age,
        f.head_birth_date,
        f.phone,
        f.head_health_status::text AS head_health_status,
        f.has_chronic_disease,
        f.has_disability,
        f.family_members_count,
        f.notes,
        f.created_at,

        w.name AS wife_name,
        w.id_number AS wife_id_number,
        w.age AS wife_age,
        w.birth_date AS wife_birth_date,
        w.health_status::text AS wife_health_status

      FROM families f
      LEFT JOIN wives w ON w.family_id = f.id
      WHERE f.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `);

    const membersResult = await pool.query(`
      SELECT
        family_id,
        full_name,
        id_number,
        age,
        birth_date,
        gender::text AS gender,
        health_status::text AS health_status
      FROM members
      ORDER BY family_id, id ASC
    `);

    const membersByFamily = new Map();

    for (const member of membersResult.rows) {
      if (!membersByFamily.has(member.family_id)) {
        membersByFamily.set(member.family_id, []);
      }
      membersByFamily.get(member.family_id).push(member);
    }

    let maxMembers = 0;
    for (const family of familiesResult.rows) {
      const familyMembers = membersByFamily.get(family.id) || [];
      if (familyMembers.length > maxMembers) {
        maxMembers = familyMembers.length;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("العائلات");

    const baseColumns = [
      { header: "رقم الملف", key: "file_number", width: 15 },
      { header: "اسم رب الأسرة", key: "head_name", width: 22 },
      { header: "رقم هوية رب الأسرة", key: "head_id_number", width: 22 },
      { header: "عمر رب الأسرة", key: "head_age", width: 14 },
      { header: "تاريخ ميلاد رب الأسرة", key: "head_birth_date", width: 18 },
      { header: "رقم الهاتف", key: "phone", width: 20 },
      {
        header: "الحالة الصحية لرب الأسرة",
        key: "head_health_status",
        width: 22,
      },
      { header: "مرض مزمن", key: "has_chronic_disease", width: 12 },
      { header: "إعاقة", key: "has_disability", width: 12 },
      { header: "عدد أفراد الأسرة", key: "family_members_count", width: 16 },

      { header: "اسم الزوجة", key: "wife_name", width: 20 },
      { header: "رقم هوية الزوجة", key: "wife_id_number", width: 20 },
      { header: "عمر الزوجة", key: "wife_age", width: 12 },
      { header: "تاريخ ميلاد الزوجة", key: "wife_birth_date", width: 18 },
      { header: "الحالة الصحية للزوجة", key: "wife_health_status", width: 22 },

      { header: "عدد الأفراد", key: "members_count", width: 12 },
      { header: "ملاحظات", key: "notes", width: 28 },
      { header: "تاريخ إنشاء الملف", key: "created_at", width: 22 },
    ];

    const memberColumns = [];

    for (let i = 1; i <= maxMembers; i++) {
      memberColumns.push(
        { header: `اسم الفرد ${i}`, key: `member_${i}_full_name`, width: 20 },
        {
          header: `رقم هوية الفرد ${i}`,
          key: `member_${i}_id_number`,
          width: 22,
        },
        { header: `عمر الفرد ${i}`, key: `member_${i}_age`, width: 12 },
        {
          header: `تاريخ ميلاد الفرد ${i}`,
          key: `member_${i}_birth_date`,
          width: 18,
        },
        { header: `جنس الفرد ${i}`, key: `member_${i}_gender`, width: 14 },
        {
          header: `الحالة الصحية للفرد ${i}`,
          key: `member_${i}_health_status`,
          width: 22,
        },
      );
    }

    worksheet.columns = [...baseColumns, ...memberColumns];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 24;

    for (const cell of headerRow._cells) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "14532D" },
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "D1D5DB" } },
        left: { style: "thin", color: { argb: "D1D5DB" } },
        bottom: { style: "thin", color: { argb: "D1D5DB" } },
        right: { style: "thin", color: { argb: "D1D5DB" } },
      };
    }

    for (const family of familiesResult.rows) {
      const familyMembers = membersByFamily.get(family.id) || [];

      const rowData = {
        file_number: family.file_number || "",
        head_name: family.head_name || "",
        head_id_number: family.head_id_number
          ? String(family.head_id_number)
          : "",
        head_age: family.head_age ?? "",
        head_birth_date: family.head_birth_date
          ? String(family.head_birth_date).split("T")[0]
          : "",
        phone: family.phone ? String(family.phone) : "",
        head_health_status: family.head_health_status || "",
        has_chronic_disease: family.has_chronic_disease ? "نعم" : "لا",
        has_disability: family.has_disability ? "نعم" : "لا",
        family_members_count: family.family_members_count ?? "",

        wife_name: family.wife_name || "",
        wife_id_number: family.wife_id_number
          ? String(family.wife_id_number)
          : "",
        wife_age: family.wife_age ?? "",
        wife_birth_date: family.wife_birth_date
          ? String(family.wife_birth_date).split("T")[0]
          : "",
        wife_health_status: family.wife_health_status || "",

        members_count: familyMembers.length,
        notes: family.notes || "",
        created_at: family.created_at
          ? new Date(family.created_at).toLocaleString("ar-EG")
          : "",
      };

      for (let i = 0; i < maxMembers; i++) {
        const member = familyMembers[i];

        rowData[`member_${i + 1}_full_name`] = member?.full_name || "";
        rowData[`member_${i + 1}_id_number`] = member?.id_number
          ? String(member.id_number)
          : "";
        rowData[`member_${i + 1}_age`] = member?.age ?? "";
        rowData[`member_${i + 1}_birth_date`] = member?.birth_date
          ? String(member.birth_date).split("T")[0]
          : "";
        rowData[`member_${i + 1}_gender`] = member?.gender || "";
        rowData[`member_${i + 1}_health_status`] = member?.health_status || "";
      }

      const row = worksheet.addRow(rowData);

      row.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "E5E7EB" } },
          left: { style: "thin", color: { argb: "E5E7EB" } },
          bottom: { style: "thin", color: { argb: "E5E7EB" } },
          right: { style: "thin", color: { argb: "E5E7EB" } },
        };
      });

      row.getCell("head_id_number").numFmt = "@";
      row.getCell("phone").numFmt = "@";
      row.getCell("wife_id_number").numFmt = "@";

      for (let i = 0; i < maxMembers; i++) {
        row.getCell(`member_${i + 1}_id_number`).numFmt = "@";
      }
    }

    worksheet.views = [{ rightToLeft: true }];
    worksheet.autoFilter = {
      from: "A1",
      to: worksheet.getRow(1).lastCell.address,
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="families_full_export.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تصدير البيانات",
      details: error.message,
    });
  }
});

module.exports = app;
