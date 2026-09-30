# Deployment Guide - Render + Vercel

This guide walks you through deploying your e-commerce platform to production using Render (backend) and Vercel (frontend).

## Prerequisites

- [ ] GitHub account with your repository pushed
- [ ] MongoDB Atlas account (free tier works)
- [ ] Render account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] Payment provider credentials (Paystack, Flutterwave, etc.)

---

## Part 1: MongoDB Atlas Setup

### 1.1 Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free M0 tier is fine for starting)
3. Click **"Connect"** → **"Connect your application"**
4. Copy your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 1.2 Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Confirm

### 1.3 Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Set username and password (save these!)
3. Grant **"Read and write to any database"** privileges

---

## Part 2: Backend Deployment (Render)

### 2.1 Prepare Backend

Ensure your `apps/api/package.json` has a start script:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

### 2.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `afritrade-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/afritrade
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. Click **"Create Web Service"**
7. Copy your backend URL: `https://glotradecom.onrender.com`

---

## Part 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `yarn build`

5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://glotradecom.onrender.com
   ```

6. Click **"Deploy"**
7. Your app will be live at: `https://your-app.vercel.app`

---

## Part 4: Post-Deployment

### 4.1 Update CORS in Backend

Update backend CORS to allow your Vercel domain, then redeploy.

### 4.2 Test Deployment

```bash
# Test backend
curl https://afritrade-api.onrender.com/health

# Visit frontend
open https://your-app.vercel.app
```

---

## Troubleshooting

**Backend 502 Error**: Check Render logs, verify MongoDB connection

**CORS Errors**: Verify FRONTEND_URL matches your Vercel domain

**Build Fails**: Check logs, test build locally first

---

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | https://afritrade-api.onrender.com | API Server |
| Frontend | https://your-app.vercel.app | User Interface |
| Database | MongoDB Atlas | Data Storage |

---

**🎉 Your platform is now live!**

For detailed instructions, Docker setup, and production checklist, see:
- `DEPLOYMENT_DETAILED.md` - Comprehensive guide
- `docker-compose.yml` - Docker configuration
- `PRODUCTION_CHECKLIST.md` - Pre-launch checklist