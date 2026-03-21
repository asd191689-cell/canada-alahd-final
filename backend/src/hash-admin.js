require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "canada_alahd",
  password: process.env.DB_PASSWORD || "postgres",
  port: Number(process.env.DB_PORT || 5432),
});

async function hashAdminPassword() {
  try {
    const plainPassword = "1234";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE username = 'admin'
      RETURNING id, username, full_name
      `,
      [hashedPassword],
    );

    if (result.rows.length === 0) {
      console.log("لم يتم العثور على المستخدم admin");
    } else {
      console.log("تم تحديث password_hash للمستخدم:", result.rows[0]);
    }
  } catch (error) {
    console.error("خطأ أثناء تحديث كلمة المرور المشفرة:", error);
  } finally {
    await pool.end();
  }
}

hashAdminPassword();
