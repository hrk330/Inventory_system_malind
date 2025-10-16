# 🚀 Complete Deployment Checklist

## Pre-Deployment Setup

### ✅ Backend Preparation
- [ ] Update CORS settings in `main.ts`
- [ ] Create `railway.json` configuration
- [ ] Create `nixpacks.toml` for build process
- [ ] Create `Dockerfile` for containerization
- [ ] Update environment variables for production

### ✅ Frontend Preparation
- [ ] Update `next.config.js` for production
- [ ] Create `vercel.json` configuration
- [ ] Remove experimental appDir
- [ ] Update image domains for production

## 🚀 Deployment Steps

### Phase 1: Deploy Backend to Railway
1. [ ] Create Railway account
2. [ ] Create new project from GitHub
3. [ ] Add PostgreSQL database
4. [ ] Configure environment variables
5. [ ] Deploy backend
6. [ ] Run database migrations
7. [ ] Test API endpoints

### Phase 2: Deploy Frontend to Vercel
1. [ ] Create Vercel account
2. [ ] Import project from GitHub
3. [ ] Set frontend folder as root
4. [ ] Configure environment variables
5. [ ] Deploy frontend
6. [ ] Update backend CORS with Vercel domain

### Phase 3: Final Testing
1. [ ] Test frontend deployment
2. [ ] Test API connectivity
3. [ ] Test authentication
4. [ ] Test all features
5. [ ] Test file uploads
6. [ ] Test database operations

## 🔧 Environment Variables

### Railway (Backend)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

## 🎯 Expected Results

### After Backend Deployment
- API available at: `https://your-app.railway.app/api`
- Swagger docs at: `https://your-app.railway.app/api/docs`
- Database connected and migrated

### After Frontend Deployment
- App available at: `https://your-app.vercel.app`
- API calls working
- Authentication working
- All features functional

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS_ORIGIN in Railway
2. **Database Connection**: Check DATABASE_URL format
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Debug Steps
1. Check Railway logs for backend issues
2. Check Vercel logs for frontend issues
3. Test API endpoints directly
4. Check browser console for errors
