# CLARIFYX 2.0 — CYBERSECURITY PLATFORM ARCHITECTURE & DEPLOYMENT GUIDE

ClarifyX 2.0 is an enterprise-grade cybersecurity threat intelligence and multi-vector content inspection platform built with the **MERN** (MongoDB, Express, React, Node.js) and TypeScript ecosystem.

---

## 1. ARCHITECTURE OVERVIEW

```
+-------------------------------------------------------------+
|                  CLARIFYX 2.0 FRONTEND                      |
|  - React 18 / TypeScript / Vite 6                            |
|  - Security Operations Center (SOC) Cyber UI                |
|  - Universal Scanner (Link, Msg, Image, Video, Voice, News) |
|  - Realtime Telemetry, Threat Reports & Audit Trails        |
+------------------------------+------------------------------+
                               |  /api/v1 (REST / JSON)
                               v
+-------------------------------------------------------------+
|                   EXPRESS & NODE BACKEND                    |
|  - Rate Limiting, Helmet Security Headers, Input Validation  |
|  - Auth Controllers (JWT HttpOnly Cookies / bcrypt)         |
|  - Scan Orchestrator & Job Queue                            |
|  - Heuristic Engine & Detection Providers                   |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|    MONGODB / ATLAS    |             |  TEMPORARY SANDBOX    |
| - Scan Audit Logs     |             | - Isolated Uploads    |
| - Operator Profiles   |             | - Media Previews      |
| - Threat Intelligence |             | - Auto-cleanup        |
+-----------------------+             +-----------------------+
```

---

## 2. KEY FEATURES & VECTOR SCOPE

1. **Link Scanner (`URL`)**: Realtime heuristic analysis assessing credential harvesting, phishing keywords, IP literals, URL shortener redirects, and protocol encryption.
2. **Message Scanner (`MESSAGE`)**: Social engineering detection, OTP phishing, urgency baiting, and financial fraud hooks.
3. **Image Scanner (`IMAGE`)**: Manipulation artifact and synthetic image verification.
4. **Video Scanner (`VIDEO`)**: Temporal deepfake frame analysis and video upload sandbox.
5. **Voice AI Scanner (`VOICE`)**: Live microphone capture (`MediaRecorder`), audio buffer playback, and acoustic AI voice clone analysis.
6. **Fake News / Claim Checker (`FAKE_NEWS`)**: Claim syntax inspection and evidence consistency checks.
7. **Threat Reports & Telemetry**: Dynamic breakdown of risk postures, critical threats, and vector distribution from real scan telemetry.
8. **Audit Trail**: Searchable, filterable scan history with per-record deletion and SOC report clipboard export.

---

## 3. LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB (Local instance or MongoDB Atlas connection string)

### 1. Frontend Setup
```bash
# In repository root
npm install
npm run dev
# Accessible at http://localhost:5173
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI
npm run dev
# Runs on http://localhost:4000
```

---

## 4. ENVIRONMENT CONFIGURATION

### Backend `.env`
```ini
PORT=4000
NODE_ENV=development
MONGODB_URI="mongodb://localhost:27017/clarifyx"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clarifyx_dev?schema=public"
FRONTEND_URL="http://localhost:5173"
SESSION_SECRET="your-ultra-secure-jwt-secret-key"
```

---

## 5. VERCEL DEPLOYMENT STRATEGY

### Frontend on Vercel
1. Connect this repository to Vercel.
2. Set **Framework Preset**: Vite
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Configure `VITE_API_URL` or use the included `vercel.json` rewrite proxy to direct `/api/*` to your production backend host.

### Backend Hosting
- **Serverless Considerations**: For Vercel Serverless deployment of Express, export the Express app as a serverless function (`api/index.ts`).
- **Heavy Media / Voice Workloads**: As deepfake video and audio processing require significant execution time, host the Express backend process on Render, Railway, AWS ECS, or DigitalOcean where background tasks and temporary uploads can execute continuously.

---

## 6. SECURITY & DATA PRIVACY CONTROLS
- **No Secret Leakage**: All credentials, JWT secrets, and API keys remain strictly backend-side.
- **Upload Isolation**: Files are assigned random UUIDs and restricted by MIME type and size boundaries.
- **Explainable Findings**: Heuristic scores are transparently displayed alongside detection category signals and recommended operator actions.
