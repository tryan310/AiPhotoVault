# ✅ Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup
- [ ] SQLite database (included with app)
- [ ] Test database connection
- [ ] Verify user management functions

### 2. Google Cloud Storage Setup
- [ ] Create GCP project
- [ ] Create GCS bucket
- [ ] Configure bucket permissions (uniform bucket-level access)
- [ ] Set up service account with Storage Admin role
- [ ] Download service account key file
- [ ] Test image upload/retrieval

### 3. Environment Variables
- [ ] Set up production environment variables
- [ ] Configure Stripe live keys
- [ ] Set up Gemini API key
- [ ] Configure authentication secrets

### 4. Domain & SSL
- [ ] Purchase domain name
- [ ] Configure DNS records
- [ ] Set up SSL certificate
- [ ] Test domain access

## Deployment Steps

### 1. Backend Deployment
- [ ] Choose hosting platform (Railway, Heroku, AWS, etc.)
- [ ] Deploy Node.js backend
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Set up monitoring/logging

### 2. Frontend Deployment
- [ ] Deploy React app (Vercel, Netlify, etc.)
- [ ] Configure build settings
- [ ] Set up environment variables
- [ ] Test frontend functionality

### 3. GCS Configuration
- [ ] Configure GCS environment variables
- [ ] Test photo upload to GCS
- [ ] Verify signed URL generation
- [ ] Test photo retrieval from gallery

### 4. Testing
- [ ] Test user registration/login
- [ ] Test photo generation
- [ ] Test payment processing
- [ ] Test photo gallery
- [ ] Test credit system

## Post-Deployment

### 1. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Configure log aggregation

### 2. Security
- [ ] Review CORS settings
- [ ] Check API rate limiting
- [ ] Verify SSL configuration
- [ ] Test webhook security

### 3. Performance
- [ ] Test image loading speeds
- [ ] Monitor database performance
- [ ] Check CDN effectiveness
- [ ] Optimize bundle sizes

### 4. Backup & Recovery
- [ ] Set up database backups
- [ ] Configure GCS backup strategy
- [ ] Test recovery procedures
- [ ] Document rollback process

## Cost Estimation

### Monthly Costs (Approximate)
- **Database**: $0 (SQLite - included)
- **Storage**: $2-10 (GCS - pay per use)
- **Compute**: $5-25 (Railway/Heroku)
- **Domain**: $1-2 (if purchased)
- **Total**: $8-37/month

### Scaling Considerations
- **Database**: SQLite handles moderate traffic
- **Storage**: GCS scales automatically
- **Compute**: Auto-scaling available on most platforms
- **CDN**: GCS provides global CDN

## Troubleshooting

### Common Issues
1. **CORS errors**: Check allowed origins
2. **Database connection**: Verify SQLite file permissions
3. **GCS permissions**: Check bucket and service account permissions
4. **Stripe webhooks**: Verify endpoint URLs
5. **Image loading**: Check GCS URLs and signed URL generation

### Support Resources
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [GCS Setup Guide](./GCS_SETUP_GUIDE.md)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
