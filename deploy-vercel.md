# Vercel Deployment Guide

## 1. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

## 2. Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Choose the `frontend` folder as the root directory
4. Framework: Next.js (auto-detected)

## 3. Configure Environment Variables
In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
```

## 4. Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at: `https://your-app.vercel.app`

## 5. Update Backend CORS
After getting your Vercel domain, update your Railway backend environment variables:

```
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## 6. Test Your Application
1. Visit your Vercel domain
2. Test login/registration
3. Test all features
4. Check that API calls are working
