const path = require("path");
const dotenv = require("dotenv");

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
  throw new Error(`Refuse to run tests against non-test database: ${process.env.DB_NAME}`);
}
