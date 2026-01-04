# Environment Variables for Vercel Deployment

Based on your server.js configuration, add these environment variables in Vercel:

## Required Environment Variables

### 1. MongoDB Connection
```
NAME: MONGODB_URI
VALUE: mongodb+srv://username:password@cluster.mongodb.net/
```
**Where to find**: Your MongoDB Atlas connection string

---

### 2. MongoDB Database Name
```
NAME: MONGODB_DB
VALUE: codemasters
```
**Default**: codemasters (you can change this)

---

### 3. MongoDB Collection Name
```
NAME: MONGODB_COLLECTION
VALUE: inquiries
```
**Default**: inquiries (you can change this)

---

### 4. Google Sheets Spreadsheet ID
```
NAME: GOOGLE_SHEETS_SPREADSHEET_ID
VALUE: 1a2b3c4d5e6f7g8h9i0j
```
**Where to find**: From your Google Sheets URL
- Example URL: `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
- The ID is: `1a2b3c4d5e6f7g8h9i0j`

---

### 5. Google Sheets Sheet Name
```
NAME: GOOGLE_SHEETS_SHEET_NAME
VALUE: Sheet1
```
**Default**: Sheet1 (change if your sheet has a different name)

---

### 6. Google Service Account JSON
```
NAME: GOOGLE_SERVICE_ACCOUNT_JSON
VALUE: {"type":"service_account","project_id":"codemastersleads","private_key_id":"3d09f1c3a93e","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```
**Important**: 
- Paste the ENTIRE JSON content from your `codemastersleads-3d09f1c3a93e.json` file
- Keep it as a single line or properly formatted JSON string
- Make sure all quotes are escaped if needed

**How to get it**:
1. Open `codemastersleads-3d09f1c3a93e.json` file
2. Copy the entire content
3. Paste it as the value (you may need to minify it to one line)

---

### 7. Admin Token
```
NAME: ADMIN_TOKEN
VALUE: your-secret-token-here-make-it-strong
```
**Create a strong random token**:
- Use a password generator
- Make it at least 20 characters
- Use letters, numbers, and symbols
- Example: `Cm@st3r$2024!Adm1n#T0k3n`

---

### 8. Port (Optional)
```
NAME: PORT
VALUE: 3000
```
**Note**: Vercel sets this automatically, but you can add it if needed

---

## Quick Copy-Paste Format for Vercel

When adding in Vercel dashboard, use this format:

| Variable Name | Value |
|--------------|-------|
| `MONGODB_URI` | `your_mongodb_connection_string` |
| `MONGODB_DB` | `codemasters` |
| `MONGODB_COLLECTION` | `inquiries` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `your_sheets_id` |
| `GOOGLE_SHEETS_SHEET_NAME` | `Sheet1` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` |
| `ADMIN_TOKEN` | `your_secret_token` |

---

## Steps to Add in Vercel:

1. Go to your project → **Settings** → **Environment Variables**
2. For each variable above:
   - Click **"Add Environment Variable"**
   - Enter the **NAME** (left field)
   - Enter the **VALUE** (right field)
   - Select environments: **Production**, **Preview**, **Development** (select all)
   - Click **Save**
3. After adding all variables, go to **Deployments** tab
4. Click **⋯** (three dots) on latest deployment → **Redeploy**

---

## Important Notes:

⚠️ **GOOGLE_SERVICE_ACCOUNT_JSON**:
- This is the most important one
- Copy the entire content from `codemastersleads-3d09f1c3a93e.json`
- You can use a JSON minifier to make it one line: https://jsonformatter.org/json-minify
- Or paste it as-is if Vercel supports multi-line

⚠️ **Security**:
- Never commit `.env` file to Git (already in .gitignore)
- Never share your `ADMIN_TOKEN` publicly
- Keep your MongoDB URI private

---

## Testing After Deployment:

1. Visit your Vercel URL
2. Test contact form submission
3. Check MongoDB for saved inquiries
4. Check Google Sheets for new rows
5. Test admin panel at `/admin.html` with your `ADMIN_TOKEN`

