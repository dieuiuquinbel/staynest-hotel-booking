const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

function loadTestEnv() {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true });

  process.env.NODE_ENV = "test";
  const configuredDbName = process.env.DB_NAME || "hotel_booking_db";
  process.env.DB_NAME = configuredDbName.endsWith("_test")
    ? configuredDbName
    : `${configuredDbName}_test`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_change_me";
  process.env.ALLOW_DEV_OTP_HINT = "true";
  process.env.DEFAULT_ADMIN_ENABLED = process.env.DEFAULT_ADMIN_ENABLED || "false";
  process.env.INVOICE_DIR = process.env.INVOICE_DIR || "storage/test-invoices";
  process.env.SMTP_HOST = "";
  process.env.SMTP_USER = "";
  process.env.SMTP_PASS = "";

  if (!process.env.DB_NAME.endsWith("_test")) {
    throw new Error(`Refuse to setup non-test database: ${process.env.DB_NAME}`);
  }
}

module.exports = async function globalSetup() {
  loadTestEnv();

  const sqlPath = path.resolve(__dirname, "../../database/final_database.sql");
  const schemaSql = fs
    .readFileSync(sqlPath, "utf8")
    .replace(/hotel_booking_db/g, process.env.DB_NAME);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    await connection.query(schemaSql);
  } finally {
    await connection.end();
  }
};
