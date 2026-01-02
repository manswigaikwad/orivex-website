const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');
const { google } = require('googleapis');

require('dotenv').config();

const app = express();

const PORT = Number(process.env.PORT || 3000);

const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || '');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'codemasters';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'inquiries';

const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Inquiries';

function getServiceAccountFromEnv() {
  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (filePath) {
    try {
      const rawFile = fs.readFileSync(filePath, 'utf8');
      const parsedFile = JSON.parse(rawFile);
      if (parsedFile.private_key) parsedFile.private_key = parsedFile.private_key.replace(/\\n/g, '\n');
      return parsedFile;
    } catch (e) {
      process.stderr.write(`Failed to load GOOGLE_SERVICE_ACCOUNT_FILE: ${filePath}\n`);
      process.stderr.write(`${e?.message || e}\n`);
      return null;
    }
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    return parsed;
  } catch (e) {
    process.stderr.write('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON\n');
    process.stderr.write(`${e?.message || e}\n`);
    return null;
  }
}

function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^0-9+]/g, '').slice(0, 20);
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function validateInquiry(body) {
  const errors = [];

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = normalizePhone(body.phone || '');
  const projectType = String(body.projectType || '').trim();
  const deadline = String(body.deadline || '').trim();
  const budget = String(body.budget || '').trim();
  const message = String(body.message || '').trim();
  const hp = String(body.company || '').trim();

  if (hp) errors.push('Spam detected.');
  if (name.length < 2) errors.push('Name is required.');
  if (!phone && !email) errors.push('Provide phone or email.');
  if (email && !isValidEmail(email)) errors.push('Invalid email.');
  if (projectType.length < 2) errors.push('Project type is required.');
  if (message.length < 10) errors.push('Message should be at least 10 characters.');

  return {
    ok: errors.length === 0,
    errors,
    data: {
      name,
      email,
      phone,
      projectType,
      deadline,
      budget,
      message
    }
  };
}

let mongoClient;
let mongoCollection;

async function initMongo() {
  if (!MONGODB_URI) return;
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB);
  mongoCollection = db.collection(MONGODB_COLLECTION);
}

async function writeToMongo(record) {
  if (!mongoCollection) return { ok: false, skipped: true };
  await mongoCollection.insertOne(record);
  return { ok: true };
}

async function writeToGoogleSheets(record) {
  const serviceAccount = getServiceAccountFromEnv();
  if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
    return { ok: false, skipped: true, reason: 'GOOGLE_SHEETS_SPREADSHEET_ID not set' };
  }
  if (!serviceAccount) {
    return { ok: false, skipped: true, reason: 'Service account not configured/failed to load' };
  }

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const values = [
    record.createdAt,
    record.name,
    record.phone,
    record.email,
    record.projectType,
    record.deadline,
    record.budget,
    record.message,
    record.source,
    record.location,
    record.ip
  ];

  const sheetName = String(GOOGLE_SHEETS_SHEET_NAME || 'Sheet1').trim();

  // Check if sheet exists, create if it doesn't
  let sheetExists = false;
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID
    });

    sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === sheetName
    );

    if (!sheetExists) {
      // Create the sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });

      // Add header row
      const headerRange = `${sheetName}!A1:K1`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: headerRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            'Created At',
            'Name',
            'Phone',
            'Email',
            'Project Type',
            'Deadline',
            'Budget',
            'Message',
            'Source',
            'Location',
            'IP'
          ]]
        }
      });
      sheetExists = true;
    }
  } catch (error) {
    // If sheet check/creation fails, log it but don't throw yet
    // We'll verify existence again before appending
    process.stderr.write(`Sheet check/create error: ${error?.message || error}\n`);
  }

  // Verify sheet exists one more time before appending
  if (!sheetExists) {
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID
      });
      sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === sheetName
      );
    } catch (error) {
      throw new Error(`Cannot verify sheet existence: ${error?.message || error}`);
    }
    
    if (!sheetExists) {
      throw new Error(`Sheet "${sheetName}" does not exist and could not be created. Please create it manually in the spreadsheet.`);
    }
  }

  // Format range for append - use column range format which is more reliable
  // Quote if sheet name contains spaces or special characters
  let range;
  if (sheetName.includes(' ') || sheetName.includes("'") || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(sheetName)) {
    const escapedName = sheetName.replace(/'/g, "''");
    range = `'${escapedName}'!A:A`;
  } else {
    range = `${sheetName}!A:A`;
  }

  // Append the data
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values]
    }
  });

  return { ok: true };
}

app.use(helmet());
app.use(express.json({ limit: '64kb' }));

app.use(
  '/api/inquiry',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ ok: false, message: 'ADMIN_TOKEN is not configured.' });
  }
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, message: 'Unauthorized.' });
  }
  return next();
}

function parseDateOnlyToIsoStart(dateOnly) {
  if (!dateOnly) return '';
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(String(dateOnly).trim());
  if (!m) return '';
  return `${dateOnly}T00:00:00.000Z`;
}

function parseDateOnlyToIsoEndExclusive(dateOnly) {
  if (!dateOnly) return '';
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(String(dateOnly).trim());
  if (!m) return '';
  const d = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return '';
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

function csvEscape(v) {
  const s = String(v ?? '');
  const needs = /[\n\r\",]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}

app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
  if (!mongoCollection) {
    return res.status(503).json({ ok: false, message: 'MongoDB is not configured.' });
  }

  const search = String(req.query.search || '').trim();
  const fromIso = parseDateOnlyToIsoStart(String(req.query.from || '').trim());
  const toIsoExclusive = parseDateOnlyToIsoEndExclusive(String(req.query.to || '').trim());
  const limitRaw = Number(req.query.limit || 50);
  const limit = Math.max(1, Math.min(200, Number.isFinite(limitRaw) ? limitRaw : 50));

  const filter = {};
  if (fromIso || toIsoExclusive) {
    filter.createdAt = {};
    if (fromIso) filter.createdAt.$gte = fromIso;
    if (toIsoExclusive) filter.createdAt.$lt = toIsoExclusive;
  }

  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: rx },
      { phone: rx },
      { email: rx },
      { projectType: rx },
      { message: rx }
    ];
  }

  const items = await mongoCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .project({
      _id: 0,
      createdAt: 1,
      name: 1,
      phone: 1,
      email: 1,
      projectType: 1,
      deadline: 1,
      budget: 1,
      message: 1
    })
    .toArray();

  return res.json({ ok: true, count: items.length, items });
});

app.get('/api/admin/inquiries.csv', requireAdmin, async (req, res) => {
  if (!mongoCollection) {
    return res.status(503).send('MongoDB is not configured.');
  }

  const search = String(req.query.search || '').trim();
  const fromIso = parseDateOnlyToIsoStart(String(req.query.from || '').trim());
  const toIsoExclusive = parseDateOnlyToIsoEndExclusive(String(req.query.to || '').trim());
  const limitRaw = Number(req.query.limit || 200);
  const limit = Math.max(1, Math.min(2000, Number.isFinite(limitRaw) ? limitRaw : 200));

  const filter = {};
  if (fromIso || toIsoExclusive) {
    filter.createdAt = {};
    if (fromIso) filter.createdAt.$gte = fromIso;
    if (toIsoExclusive) filter.createdAt.$lt = toIsoExclusive;
  }
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: rx },
      { phone: rx },
      { email: rx },
      { projectType: rx },
      { message: rx }
    ];
  }

  const items = await mongoCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .project({
      _id: 0,
      createdAt: 1,
      name: 1,
      phone: 1,
      email: 1,
      projectType: 1,
      deadline: 1,
      budget: 1,
      message: 1
    })
    .toArray();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inquiries.csv"');

  const header = ['createdAt', 'name', 'phone', 'email', 'projectType', 'deadline', 'budget', 'message'];
  const lines = [header.join(',')];
  for (const r of items) {
    lines.push([
      csvEscape(r.createdAt),
      csvEscape(r.name),
      csvEscape(r.phone),
      csvEscape(r.email),
      csvEscape(r.projectType),
      csvEscape(r.deadline),
      csvEscape(r.budget),
      csvEscape(r.message)
    ].join(','));
  }

  return res.send(lines.join('\n'));
});

app.post('/api/inquiry', async (req, res) => {
  const validated = validateInquiry(req.body || {});
  if (!validated.ok) {
    return res.status(400).json({ ok: false, errors: validated.errors });
  }

  const record = {
    ...validated.data,
    createdAt: new Date().toISOString(),
    ip: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress || '',
    userAgent: String(req.headers['user-agent'] || ''),
    source: String(req.body.source || 'website'),
    location: String(req.body.location || '')
  };

  const results = {
    mongo: { ok: false },
    sheets: { ok: false }
  };

  try {
    results.mongo = await writeToMongo(record);
  } catch (e) {
    process.stderr.write('Mongo write failed\n');
    process.stderr.write(`${e?.message || e}\n`);
    results.mongo = { ok: false, error: e?.message || 'Mongo write failed' };
  }

  try {
    results.sheets = await writeToGoogleSheets(record);
  } catch (e) {
    process.stderr.write('Sheets write failed\n');
    process.stderr.write(`${e?.message || e}\n`);
    results.sheets = { ok: false, error: e?.message || 'Sheets write failed' };
  }

  const ok = Boolean(results.mongo.ok || results.sheets.ok || results.mongo.skipped || results.sheets.skipped);
  if (!ok) {
    return res.status(500).json({ ok: false, message: 'Unable to save inquiry right now.' });
  }

  return res.json({ ok: true, saved: results });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  initMongo()
    .then(() => {
      app.listen(PORT, () => {
        process.stdout.write(`Server running on http://localhost:${PORT}\n`);
      });
    })
    .catch(() => {
      app.listen(PORT, () => {
        process.stdout.write(`Server running (Mongo disabled) on http://localhost:${PORT}\n`);
      });
    });
} else {
  // Initialize MongoDB for Vercel (async, won't block)
  initMongo().catch(() => {});
}
