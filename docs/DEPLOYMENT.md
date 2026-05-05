# Deployment Guide

Guide for deploying to production.

## Build for Production

```bash
npm run build
```

Creates `dist/` folder with optimized build.

## Environment Variables

Create `.env.production`:
```
REACT_APP_API_URL=https://api.prod.example.com
REACT_APP_USE_MOCKS=false
```

## Deployment Options

### 1. Vercel
```bash
npm install -g vercel
vercel
```

### 2. Netlify
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

### 3. Docker
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 4. AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://my-bucket
```

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Production environment variables set
- [ ] API endpoints configured
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Analytics configured
- [ ] Error monitoring configured

## Performance Optimization

- Enable gzip compression
- Cache static assets
- CDN for images
- Code splitting enabled
- Minification enabled

## Monitoring

- Set up error tracking (Sentry)
- Set up analytics (GA)
- Set up performance monitoring
- Configure alerts

---

See [Setup Guide](./SETUP.md) for more details.
