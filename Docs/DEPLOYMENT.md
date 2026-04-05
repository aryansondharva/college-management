# College Management System - Deployment Guide

## Overview
This guide shows how to deploy the College Management System with:
- **Frontend**: React + Vite on Vercel
- **Backend**: Node.js + Express + PostgreSQL on Render

## Prerequisites
- GitHub repository with your code
- Vercel account (for frontend)
- Render account (for backend)
- PostgreSQL database (can use Render's free PostgreSQL)

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Build and Deploy Frontend
```bash
cd client
vercel --prod
```

### 3. Configure Environment Variables
In Vercel dashboard, set:
- `VITE_API_URL`: Your Render backend URL

## Backend Deployment (Render)

### 1. Install Render CLI
```bash
npm i -g render
```

### 2. Prepare for Production
```bash
cd server
# Update package.json for production
npm install --production
```

### 3. Deploy to Render
```bash
render deploy
```

### 4. Configure Environment Variables
In Render dashboard, set:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Your JWT secret
- `PORT`: `10000`

## Database Setup

### Option 1: Render PostgreSQL (Recommended)
1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Add it to your backend environment variables

### Option 2: External PostgreSQL
1. Use any PostgreSQL provider (Supabase, ElephantSQL, etc.)
2. Get connection string
3. Add to environment variables

## Environment Configuration Files

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (.env.production)
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret-key-here
PORT=10000
```

## Production Build Commands

### Frontend
```bash
cd client
npm run build
```

### Backend
```bash
cd server
npm install --production
```

## Deployment URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend-url.onrender.com`

## Important Notes

### Frontend
- Vercel automatically builds and deploys from `dist/` folder
- Environment variables must be prefixed with `VITE_`
- API calls should use the production backend URL

### Backend
- Render runs on port 10000 by default
- Use `npm start` for production (not `npm run dev`)
- Database connection must use the production database URL
- JWT secret should be secure and unique

### CORS Configuration
- Backend CORS is configured for `http://localhost:3000` in development
- Update CORS for production Vercel URL in production

## Troubleshooting

### Common Issues
1. **CORS errors**: Update backend CORS settings
2. **Database connection**: Check DATABASE_URL format
3. **Build failures**: Check Node.js version compatibility
4. **Environment variables**: Ensure all required variables are set

### Health Checks
```bash
# Frontend health
curl https://your-app.vercel.app

# Backend health
curl https://your-backend-url.onrender.com/api/health
```

## Next Steps
1. Push code to GitHub repository
2. Deploy frontend to Vercel
3. Deploy backend to Render
4. Configure environment variables
5. Test the live application
