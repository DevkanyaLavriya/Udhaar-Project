# Free Hosting Guide for SmartUdhaar

Follow these steps to host your project for free and share it with your client.

## 1. Prepare for Hosting
Ensure your `src/services/api.ts` (or wherever your base URL is) uses an environment variable for the backend URL.

### Frontend Adjustment
Make sure your API service points to your production backend URL:
```typescript
// Example in src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## 2. Host the Database (MSSQL)
Since your project uses Microsoft SQL Server, you have two main options for free hosting:

### Option A: Azure SQL Database (Recommended)
1. Sign up for a free Azure account (Free for 12 months).
2. Create a "SQL Database".
3. Get the Connection String.
4. Update your Backend `.env` with the Azure credentials.
5. Set `DB_ENCRYPT=true` in your environment variables.

### Option B: Local PC with ngrok (For Quick Testing)
If you want to keep using your local SQL Server but make it accessible to the internet:
1. Install [ngrok](https://ngrok.com/).
2. Run `ngrok http 5000` (while your backend is running).
3. This will give you a public URL (e.g., `https://random-id.ngrok-free.app`).
4. Share this URL, but remember your PC must stay on.

## 3. Host the Backend (Render.com)
1. Push your code to a **GitHub** repository.
2. Go to [Render.com](https://render.com/) and create a **New Web Service**.
3. Connect your GitHub repo.
4. **Build Command**: `cd backend && npm install`
5. **Start Command**: `cd backend && node server.js`
6. **Environment Variables**: Add all variables from your `.env` (DB_USER, DB_PASSWORD, etc.).

## 4. Host the Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **Framework Preset**: Vite.
5. **Build Command**: `npm run build`
6. **Environment Variables**: Add `VITE_API_URL` and set it to your Render backend URL.
7. Click **Deploy**.

---

## 🔗 Final Link
Once deployed, Vercel will give you a link like:
`https://smart-udhaar-client-test.vercel.app`

You can send this link directly to your client!
