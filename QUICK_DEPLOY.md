# 🚀 Quick Deploy to Railway - 5 Minutes!

## ⚡ Fastest Way (No CLI, No Terminal)

### Step 1: Push to GitHub

1. Buka **GitHub.com** → Create **New Repository**
   - Name: `hilmi-vision-chat` (atau apa aja)
   - Public or Private
   - **DON'T** initialize with README (sudah ada)

2. Copy the commands shown, paste di terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Buka:** https://railway.app
2. Click **"Login with GitHub"**
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: `hilmi-vision-chat`
6. Click **"Deploy Now"**

### Step 3: Add Environment Variable

Railway akan auto-detect Node.js dan mulai build.

1. Saat build, click project name
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   ```
   GEMINI_API_KEY = your_actual_api_key_here
   ```
5. Click **"Add"**

Railway akan auto-redeploy dengan environment variable.

### Step 4: Get Your URL

Tunggu deploy selesai (~2-3 minutes):

✅ Building...  
✅ Deploying...  
✅ **Live!**

Click **"View Logs"** → Copy URL yang muncul:
```
https://hilmi-vision-chat-production.up.railway.app
```

**DONE!** 🎉 App live di internet!

---

## 🔧 Update App

Tinggal push ke GitHub:

```bash
git add .
git commit -m "Add new features"
git push
```

Railway **auto-deploys** setiap push! 🚀

---

## 💰 Cost

**Free Tier:**
- $5 credit/month
- Usage: ~$0.05/hour runtime
- Perfect untuk portfolio & demo!

**Estimated:**
- Light usage: $2-3/month
- Medium usage: $4-5/month

---

## ❓ Troubleshooting

**Build failed?**
- Check Railway logs
- Verify `package.json` has `"start": "node server.js"`

**App crashes?**
- Check environment variable `GEMINI_API_KEY` set correctly
- View runtime logs in Railway dashboard

**Can't access URL?**
- Wait 2-3 minutes for deployment
- Check if deployment shows "Active"

---

## 🎯 Alternative: Deploy via CLI

**Too lazy for GitHub?** Use CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init & Deploy
railway init
railway up

# Set API key
railway variables set GEMINI_API_KEY=your_key_here
```

Done! 🚀

---

**Need help?** Check full guide: `DEPLOY_RAILWAY.md`
