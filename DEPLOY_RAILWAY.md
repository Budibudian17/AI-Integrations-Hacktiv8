# 🚀 Deploy ke Railway.app - Step by Step

## Method 1: Via GitHub (Paling Mudah)

### Step 1: Push ke GitHub

```bash
# Initialize git (kalau belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Hilmi Vision Chat"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy ke Railway

1. Buka **https://railway.app**
2. **Sign up** dengan GitHub account
3. Click **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Select repository kamu
6. Railway akan auto-detect Node.js project

### Step 3: Set Environment Variables

Di Railway dashboard:
1. Click project kamu
2. Go to **"Variables"** tab
3. Add variable:
   ```
   Key: GEMINI_API_KEY
   Value: [paste your API key]
   ```
4. Click **"Add"**

### Step 4: Wait Deploy

Railway akan:
- ✅ Install dependencies
- ✅ Build project
- ✅ Start server
- ✅ Generate public URL

Selesai! App kamu live di: `https://your-app.railway.app` 🎉

---

## Method 2: Via Railway CLI

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
railway init
```

### Step 4: Link Project

```bash
railway link
```

### Step 5: Set Environment Variable

```bash
railway variables set GEMINI_API_KEY=your_api_key_here
```

### Step 6: Deploy

```bash
railway up
```

---

## Troubleshooting

### Port Issue
Railway automatically sets `PORT` environment variable.
Pastikan `server.js` menggunakan:
```javascript
const PORT = process.env.PORT || 3000;
```
✅ Already configured!

### API Key Missing
Kalau ada error "API key required", cek:
1. Environment variable sudah di-set?
2. Nama variable: `GEMINI_API_KEY`
3. No typo di `.env.example`

### Build Failed
Check logs di Railway dashboard:
1. Click project
2. Go to "Deployments"
3. Click latest deployment
4. Check logs

---

## Post-Deployment

### Custom Domain (Optional)
1. Di Railway dashboard → Settings
2. Add custom domain
3. Update DNS records

### Monitor
- Railway dashboard shows:
  - CPU usage
  - Memory usage
  - Request logs
  - Error logs

### Update App
Just push to GitHub:
```bash
git add .
git commit -m "Update features"
git push
```
Railway auto-redeploys! 🚀

---

## Free Tier Limits

Railway Free Tier:
- ✅ $5 credit per month
- ✅ 500MB RAM
- ✅ Shared CPU
- ✅ 1GB disk space

**Estimated usage untuk app ini:**
- ~$2-3 per month (light usage)
- Perfect for testing & portfolio!

---

## Alternative Platforms

Kalau Railway credits habis:

### Render.com
- 750 hours/month free
- Auto-sleep after 15 min inactive

### Fly.io
- 3 shared VMs free
- 160GB bandwidth/month

### Cyclic.sh
- Unlimited apps free (serverless)

---

## Need Help?

Error? Check:
1. Railway logs
2. Environment variables
3. GitHub repo updated
4. `.gitignore` not blocking files

Happy deploying! 🚀
