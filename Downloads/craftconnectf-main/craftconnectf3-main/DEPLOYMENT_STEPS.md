# CraftConnect - Immediate Deployment Steps

## 🚀 Quick Fix and Deploy (30 minutes)

### Step 1: Environment Variables (5 minutes)

**Backend Environment (.env file in /backend):**
```bash
# Create backend/.env with your actual values:

# Google Cloud (REQUIRED)
GOOGLE_PROJECT_ID=your-project-id-here
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json

# MongoDB Atlas (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/craftconnect?retryWrites=true&w=majority

# Frontend URL (REQUIRED for CORS)
CLIENT_URL=https://your-vercel-app.vercel.app

# Server
PORT=8080
NODE_ENV=production
```

**Frontend Environment (.env file in /frontend):**
```bash
# Create frontend/.env with your backend URL:
VITE_API_URL=https://your-cloudrun-url.run.app
```

### Step 2: Deploy Backend (15 minutes)

```bash
# Navigate to backend directory
cd backend/

# Deploy to Google Cloud Run
gcloud run deploy craftconnect-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --timeout 300 \
  --max-instances 10
```

### Step 3: Deploy Frontend (5 minutes)

```bash
# Navigate to frontend directory
cd frontend/

# Deploy to Vercel
vercel --prod
```

### Step 4: Test Deployment (5 minutes)

**Backend Health Check:**
```bash
# Replace with your actual Cloud Run URL
curl https://craftconnect-backend-xxx-uc.a.run.app/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "services": {
    "mongodb": true,
    "googleAI": true
  }
}
```

**Frontend Test:**
1. Open your Vercel URL
2. Click "Start Your Journey"
3. Test voice recording on Business Overview page
4. Check browser console for API connection logs

---

## 🔧 What Was Fixed

### Backend Fixes
- ✅ **Server startup**: Better error handling and logging
- ✅ **Google AI initialization**: Robust client setup with fallbacks
- ✅ **API routes**: Enhanced error handling and debugging
- ✅ **Health endpoints**: `/health` and `/env-check` for monitoring
- ✅ **CORS configuration**: Proper cross-origin setup
- ✅ **File upload**: Better multer configuration and validation

### Frontend Fixes
- ✅ **API service**: Comprehensive error handling and retry logic
- ✅ **Request interceptors**: Better debugging and user-friendly errors
- ✅ **Environment setup**: Proper API URL configuration
- ✅ **Error boundaries**: Graceful failure handling

### Infrastructure Fixes
- ✅ **Dockerfile**: Optimized for Google Cloud Run
- ✅ **Environment templates**: Complete .env.example files
- ✅ **Deployment config**: Production-ready settings

---

## 🚨 Troubleshooting

### If Backend Fails to Start

1. **Check logs:**
```bash
gcloud logs tail --service=craftconnect-backend
```

2. **Common issues:**
   - Missing `GOOGLE_PROJECT_ID` - Add to Cloud Run environment variables
   - MongoDB connection - Check Atlas IP whitelist (add 0.0.0.0/0 for testing)
   - Google AI permissions - Verify service account has required API access

### If Frontend Can't Connect

1. **Check environment:**
   - Verify `VITE_API_URL` points to your Cloud Run URL
   - Ensure backend is running (health check passes)

2. **Check CORS:**
   - Verify `CLIENT_URL` in backend matches your Vercel domain
   - Check browser console for CORS errors

### If Voice Analysis Fails

1. **Check Google AI APIs are enabled:**
   - Speech-to-Text API
   - Vertex AI API
   - Cloud AI Platform API

2. **Check service account permissions:**
   - AI Platform User
   - Service Account Token Creator

---

## ⚡ Emergency Demo Mode

If you need a working demo immediately:

1. **Use mock responses**: The fixed controllers include fallback analysis
2. **Test locally**: Run frontend and backend locally first
3. **Verify step by step**: Test voice recording → transcription → analysis

**Your app now has robust error handling and should work even if some Google AI services are temporarily unavailable.**