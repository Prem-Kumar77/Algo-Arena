# Deployment Guide for Render

## Environment Variables Required

Set these environment variables in your Render dashboard:

### Required Variables:
- `MONGO_URI`: Your MongoDB connection string (use MongoDB Atlas for production)
- `PORT`: Server port (Render will set this automatically)
- `NODE_ENV`: Set to `production`

### Optional Variables:
- `REDIS_URL`: Redis connection string (if using Redis)
- `REDIS_HOST` and `REDIS_PORT`: Alternative Redis configuration
- `CLIENT_URL`: Your frontend URL for CORS
- `JWT_SECRET`: A secure random string for JWT tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For file uploads

## Render Configuration

1. **Build Command**: `docker build -t oj-backend ./Backend`
2. **Start Command**: `docker run -p $PORT:3000 oj-backend`
3. **Health Check**: The app now includes a `/health` endpoint

## Common Issues Fixed

1. **SIGTERM Error**: Fixed by adding proper error handling and graceful degradation
2. **Missing Environment Variables**: App now starts even without Redis/MongoDB configured
3. **Database Connection Failures**: App continues running and logs errors instead of crashing
4. **Security**: Added non-root user in Docker container

## Testing Locally

1. Copy `.env.example` to `.env` and fill in your values
2. Run `docker-compose up` to test locally
3. Check `http://localhost:3000/health` for health status

## Production Setup

1. Set up MongoDB Atlas (free tier available)
2. Optionally set up Redis (Redis Cloud free tier available)
3. Configure all environment variables in Render
4. Deploy and monitor the `/health` endpoint
