# CraftConnect Debugging and Deployment Guide

## Critical Issues Fixed

### 1. Backend Issues Fixed
- ✅ **Server startup**: Enhanced error handling and health checks
- ✅ **Environment variables**: Added .env.example template
- ✅ **Google AI initialization**: Robust client setup with fallbacks
- ✅ **API routes**: Comprehensive error handling and debugging
- ✅ **MongoDB connection**: Better connection handling and logging
- ✅ **CORS configuration**: Proper cross-origin setup

### 2. Frontend Issues Fixed
- ✅ **API communication**: Enhanced error handling and debugging
- ✅ **Environment setup**: Added .env.example for API URL
- ✅ **Request interceptors**: Better logging and error messages
- ✅ **User feedback**: Friendly error messages for failed requests

## Immediate Steps to Deploy

### Step 1: Environment Variables Setup

**Backend (.env):**
```bash
# Copy the .env.example and fill in your values
cp backend/.env.example backend/.env

# Required variables:
GOOGLE_PROJECT_ID=your-google-cloud-project-id
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/craftconnect
CLIENT_URL=https://your-frontend-domain.vercel.app
```

**Frontend (.env):**
```bash
# Copy the .env.example and set your backend URL
cp frontend/.env.example frontend/.env

# Set your backend URL:
VITE_API_URL=https://your-backend-cloudrun-url.com
```

### Step 2: Deploy Backend to Google Cloud Run

```bash
# Build and deploy
cd backend
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/craftconnect-backend
gcloud run deploy craftconnect-backend \
  --image gcr.io/YOUR-PROJECT-ID/craftconnect-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Step 3: Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

## Testing Your Deployment

### Backend Health Checks
1. **Basic health**: `GET https://your-backend-url.com/health`
2. **Environment check**: `GET https://your-backend-url.com/env-check`
3. **API test**: `GET https://your-backend-url.com/api/test`

### Expected Health Check Response:
```json
{
  "status": "OK",
  "services": {
    "mongodb": true,
    "googleAI": true,
    "apis": {
      "speechToText": true,
      "vertexAI": true
    }
  }
}
```

### Frontend Testing
1. **Home page loads**: Check console for API URL logging
2. **Voice recording**: Test microphone access and recording
3. **Backend connection**: Check Network tab for successful API calls

## Common Issues and Solutions

### Backend Not Starting
**Symptoms**: Cloud Run deployment fails or times out
**Check**: 
```bash
gcloud logs tail --service=craftconnect-backend
```
**Solutions**:
- Verify all environment variables are set
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
- Verify Google Cloud credentials and permissions

### Google AI APIs Failing
**Symptoms**: Voice analysis returns fallback responses
**Check**: `/health` endpoint shows `googleAI: false`
**Solutions**:
- Enable Speech-to-Text API in Google Cloud Console
- Enable Vertex AI API in Google Cloud Console
- Verify service account has proper permissions
- Check quota limits in Google Cloud Console

### Frontend-Backend Communication
**Symptoms**: Network errors in browser console
**Check**: Network tab shows failed requests to backend
**Solutions**:
- Verify VITE_API_URL is correct in frontend .env
- Check CORS settings in backend (CLIENT_URL)
- Ensure backend is accessible from frontend domain

### MongoDB Connection Issues
**Symptoms**: Database connection errors in backend logs
**Solutions**:
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (add Cloud Run IPs)
- Verify database user permissions
- Test connection string locally first

## Monitoring and Logs

### Backend Logs (Google Cloud Run)
```bash
# View real-time logs
gcloud logs tail --service=craftconnect-backend --project=YOUR-PROJECT-ID

# View specific time range
gcloud logs read "resource.type=cloud_run_revision" --project=YOUR-PROJECT-ID --limit=50
```

### Frontend Logs (Vercel)
- Check Vercel dashboard for build and runtime logs
- Use browser DevTools Console for client-side errors
- Check Network tab for API request failures

## Performance Optimization

### Backend
- MongoDB Atlas connection pooling (maxPoolSize: 10)
- Request timeout handling (30-60 seconds)
- File size limits for uploads (10MB)
- Graceful error responses

### Frontend
- API request timeouts (60 seconds)
- Loading states for long AI operations
- Error boundaries for component crashes
- Retry logic for failed requests

## Security Checklist

- ✅ Environment variables properly configured
- ✅ CORS restricted to specific domains (production)
- ✅ File upload limits and type validation
- ✅ Input sanitization for AI prompts
- ✅ No sensitive data in frontend code
- ✅ HTTPS only in production

## Next Steps After Deployment

1. **Test complete workflow**: Voice → AI analysis → Results display
2. **Monitor performance**: Check response times and error rates
3. **User testing**: Get feedback from 2-3 test users
4. **Optimize based on logs**: Address any recurring issues
5. **Scale preparation**: Monitor usage and plan for increased load

---

**Quick Deploy Command Summary:**
```bash
# Backend
cd backend && gcloud run deploy

# Frontend  
cd frontend && vercel --prod

# Test
curl https://your-backend-url.com/health
```

**All major issues have been addressed. Your app should now work end-to-end once environment variables are properly configured and deployed.**