const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-maktuporia-admin";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "portfolio.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    honeypot TEXT
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const visitorCount = db.prepare("SELECT value FROM meta WHERE key = ?").get("visitor_count");
if (!visitorCount) {
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("visitor_count", "0");
}

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(ROOT, { extensions: ["html"] }));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getVisitorCount() {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get("visitor_count");
  return Number(row?.value || 0);
}

function setVisitorCount(value) {
  db.prepare("UPDATE meta SET value = ? WHERE key = ?").run(String(value), "visitor_count");
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true, name: "Dev Maktuporia Portfolio API" });
});

app.get("/api/visitor-count", (_, res) => {
  res.json({ visitors: getVisitorCount() });
});

app.post("/api/visitor-count", (_, res) => {
  const nextCount = getVisitorCount() + 1;
  setVisitorCount(nextCount);
  res.json({ visitors: nextCount });
});

app.post("/api/contact", (req, res) => {
  const startedAt = Number(req.body.formStartedAt || 0);
  const honeypot = String(req.body.company || "").trim();
  const elapsed = Date.now() - startedAt;
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim();
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (honeypot) {
    return res.status(400).json({ error: "Spam detected." });
  }

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 3000) {
    return res.status(400).json({ error: "Form submitted too quickly." });
  }

  try {
    const statement = db.prepare(`
      INSERT INTO contacts (
        full_name, email, subject, message, created_at, ip_address, user_agent, honeypot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = statement.run(
      fullName,
      email,
      subject,
      message,
      new Date().toISOString(),
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      req.get("user-agent") || "",
      honeypot
    );

    res.status(201).json({
      ok: true,
      message: "Message sent successfully.",
      id: info.lastInsertRowid
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Unable to save message right now." });
  }
});

app.get("/api/admin/messages", (req, res) => {
  const token = String(req.get("x-admin-token") || req.query.token || "");
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const messages = db
      .prepare(
        `
        SELECT id, full_name, email, subject, message, created_at, ip_address, user_agent
        FROM contacts
        ORDER BY id DESC
      `
      )
      .all();

    res.json({ messages });
  } catch (error) {
    console.error("Admin messages error:", error);
    res.status(500).json({ error: "Unable to fetch messages." });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }

  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Dev Maktuporia portfolio running on http://localhost:${PORT}`);
});
