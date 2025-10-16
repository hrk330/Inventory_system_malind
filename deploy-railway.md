# Railway Deployment Guide

## 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

## 2. Create New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your repository
4. Choose "Deploy Now"

## 3. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for database to be created
4. Copy the DATABASE_URL from the database service

## 4. Configure Environment Variables
In your Railway project settings, add these environment variables:

```
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:xxxx/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## 5. Deploy
1. Railway will automatically deploy when you push to your main branch
2. Wait for deployment to complete
3. Copy the generated domain (e.g., https://your-app.railway.app)

## 6. Run Database Migrations
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Go to "Logs" tab
6. Run: `npx prisma migrate deploy`
7. Run: `npx prisma db seed` (optional)

## 7. Test Your API
Visit: `https://your-app.railway.app/api/docs` to see your Swagger documentation
