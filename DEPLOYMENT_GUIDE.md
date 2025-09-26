# 🚀 AI Photo Booth - Deployment Guide

## Production Architecture

### Database Storage
**Current**: SQLite file (`database.sqlite`) for user data
**Photo Storage**: Google Cloud Storage (GCS)

### Architecture Benefits
- **Scalable**: GCS handles unlimited photo storage
- **Cost-effective**: Pay only for storage used
- **Fast**: Global CDN for photo delivery
- **Reliable**: 99.9% uptime SLA
- **Secure**: Private bucket with signed URLs

### Environment Variables
**Development**: `.env` file
**Production**: Environment variables in hosting platform

## GCS Photo Storage Strategy

### How It Works
1. **Upload original** → Google Cloud Storage bucket
2. **Generate AI photos** → Save to GCS with optimization
3. **Store URLs** → SQLite database (not base64)
4. **Serve via signed URLs** → Secure, time-limited access

### Environment Variables for Production
```bash
# Google Cloud Storage (Required)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=ai-photo-booth-images
GOOGLE_CLOUD_KEY_FILE=path/to/your/gcs-key.json

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini API
GEMINI_API_KEY=your_production_key

# Authentication
JWT_SECRET=super-secure-production-secret
SESSION_SECRET=super-secure-session-secret
```

## Deployment Platforms

### 1. Vercel (Recommended for Frontend)
- **Frontend**: Deploy React app
- **Backend**: Use Vercel Functions or separate backend
- **Database**: External PostgreSQL
- **Storage**: AWS S3 or Vercel Blob

### 2. Railway
- **Full-stack**: Deploy both frontend and backend
- **Database**: Built-in PostgreSQL
- **Storage**: AWS S3 integration
- **Environment**: Easy env var management

### 3. Heroku
- **Backend**: Node.js app
- **Database**: Heroku Postgres
- **Storage**: AWS S3
- **Frontend**: Separate deployment (Vercel/Netlify)

### 4. AWS/GCP/Azure
- **Full control**: Custom infrastructure
- **Database**: Managed PostgreSQL
- **Storage**: Native cloud storage
- **CDN**: CloudFront/CloudFlare

## Migration Steps

### Step 1: Database Migration
1. Set up PostgreSQL database
2. Create migration scripts
3. Update database connection
4. Test data migration

### Step 2: Photo Storage Migration
1. Set up S3 bucket
2. Update photo upload logic
3. Migrate existing photos
4. Update photo retrieval

### Step 3: Environment Setup
1. Configure production environment variables
2. Set up webhook endpoints
3. Configure CORS for production domains
4. Set up monitoring/logging

### Step 4: Deployment
1. Deploy backend to chosen platform
2. Deploy frontend to CDN
3. Configure domain and SSL
4. Set up monitoring

## Cost Considerations

### Database
- **SQLite**: Free (current)
- **PostgreSQL**: $5-50/month (managed)
- **AWS RDS**: $15-100/month

### Storage
- **Current**: Database storage (expensive)
- **S3**: $0.023/GB/month
- **CloudFront**: $0.085/GB (first 10TB)

### Compute
- **Vercel**: Free tier (hobby)
- **Railway**: $5/month
- **Heroku**: $7-25/month
- **AWS**: $10-50/month

## Security Considerations

1. **Environment Variables**: Never commit to git
2. **Database**: Use connection pooling
3. **API Keys**: Rotate regularly
4. **CORS**: Restrict to production domains
5. **Rate Limiting**: Implement API limits
6. **Monitoring**: Set up error tracking

## Performance Optimizations

1. **CDN**: Serve images from global edge locations
2. **Caching**: Cache frequently accessed data
3. **Database Indexing**: Optimize queries
4. **Image Optimization**: Compress and resize
5. **Lazy Loading**: Load images on demand

## Monitoring & Maintenance

1. **Error Tracking**: Sentry or similar
2. **Analytics**: User behavior tracking
3. **Uptime Monitoring**: Pingdom or similar
4. **Database Monitoring**: Query performance
5. **Backup Strategy**: Regular database backups
