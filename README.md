# Code Masters Website (Dark Theme)

Multi-page dark theme website + contact form that saves inquiries to **Google Sheets** and **MongoDB**.

## Pages

- `/index.html` (Home)
- `/services.html`
- `/portfolio.html`
- `/pricing.html`
- `/contact.html` (Contact form)

## Quick Start (Local)

### Prerequisite: Install Node.js (Windows)

If you see: `"node" is not recognized as an internal or external command`, install Node.js LTS:

- https://nodejs.org/en/download

During installation ensure **Add to PATH** is enabled, then restart your terminal.

Verify:

```bash
node -v
npm -v
```

1) Install dependencies

```bash
npm install
```

2) Create `.env`

Copy `.env.example` to `.env` and fill values.

3) Run

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## MongoDB Setup

- Create a MongoDB Atlas cluster (or local MongoDB).
- Put connection string in `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=codemasters
MONGODB_COLLECTION=inquiries
```

If `MONGODB_URI` is empty, MongoDB saving is skipped.

## Google Sheets Setup (Recommended)

### 1) Create a Sheet

Create a Google Sheet and add a tab named `Inquiries` (or change `GOOGLE_SHEETS_SHEET_NAME`).

Recommended header row (Row 1):

A: createdAt
B: name
C: phone
D: email
E: projectType
F: deadline
G: budget
H: message
I: source
J: location
K: ip

### 2) Create a Service Account

- Google Cloud Console → Create Project
- Enable **Google Sheets API**
- Create **Service Account**
- Create a **JSON key** and download it

### 3) Share sheet with service account

Share your Google Sheet with the service account email (example: `xxxx@xxxx.iam.gserviceaccount.com`) as **Editor**.

### 4) Add env vars (choose one option)

#### Option A (Easiest on Windows): use a JSON file path

Put your downloaded JSON somewhere safe (example: `C:\keys\codemasters-sa.json`) and set:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Inquiries
GOOGLE_SERVICE_ACCOUNT_FILE=C:\\keys\\codemasters-sa.json
```

#### Option B: store JSON inside `.env`

Paste the entire JSON into one line:

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

If Sheets env vars are empty, Google Sheets saving is skipped.

## Inquiry API

- Endpoint: `POST /api/inquiry`
- Used by: `/contact.html`
- Spam protection:
  - Honeypot field (`company`)
  - Rate limiting (15 requests / 15 minutes per IP)

## Admin Panel (Inquiries Dashboard)

The Admin Panel lets you securely view inquiries saved in MongoDB with search, date filter, and CSV export.

### 1) Configure `.env`

You must have MongoDB enabled (set `MONGODB_URI`) and also set an admin token:

```env
ADMIN_TOKEN=choose_a_strong_random_token
```

### 2) Open Admin Panel

- `http://localhost:3000/admin.html`

Login using the same `ADMIN_TOKEN` value.

### 3) Admin APIs

- `GET /api/admin/inquiries` (JSON)
- `GET /api/admin/inquiries.csv` (CSV export)

Both require header:

`Authorization: Bearer <ADMIN_TOKEN>`

## Notes

- This setup is perfect for early-stage business: Google Sheets is easy to manage, and MongoDB is good for long-term records/analytics.
- If you want, I can add an **Admin dashboard** page to view inquiries from MongoDB securely.
