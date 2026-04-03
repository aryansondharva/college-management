# Manual Deployment to Render

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Setup production deployment"
git push origin main
```

## Step 2: Setup on Render Dashboard
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: college-management-backend
   - Root Directory: server
   - Build Command: npm install
   - Start Command: npm start
   - Instance Type: Free

## Step 3: Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:1046402103As@db.ibcggdhomcyoswtotygc.supabase.co:6543/postgres
JWT_SECRET=your-jwt-secret-key-here
PORT=10000
```

## Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Your backend will be live at: https://your-service-name.onrender.com

## Step 5: Update Frontend
Update client/.env.production:
```
VITE_API_URL=https://your-service-name.onrender.com/api
```

## Step 6: Deploy Frontend to Vercel
```bash
cd client
vercel --prod
```

## Your Live URLs
- Frontend: https://your-app.vercel.app
- Backend: https://your-service-name.onrender.com
```
