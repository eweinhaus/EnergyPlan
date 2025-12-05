# Deployment Guide - AI Energy Plan Recommendation Agent MVP

## Overview

This document outlines the deployment process for the Energy Plan Recommendation Agent MVP to Render.

## Prerequisites

### Required Accounts
- [ ] Render account (https://render.com)
- [ ] GitHub repository with this codebase
- [ ] UtilityAPI account (for supplier data)
- [ ] Arcadia API account (for plan catalog)

### Environment Setup
- [ ] Node.js 18.17+ installed locally
- [ ] npm dependencies installed (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Environment variables configured

## Environment Variables

Create the following environment variables in Render:

### Required Variables
```bash
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
UTILITY_API_KEY=your_utility_api_key_here
ARCADIA_API_KEY=your_arcadia_api_key_here
NODE_ENV=production
```

### Getting API Keys

1. **UtilityAPI**: Sign up at https://utilityapi.com
   - Get your API key from the dashboard
   - Ensure you have access to Texas utility data

2. **Arcadia API**: Contact Arcadia for API access
   - Request access to their plan catalog API
   - Get your API credentials

## Render Deployment Steps

### Step 1: Connect Repository
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the correct branch (main)

### Step 2: Configure Service
- **Name**: `energy-plan-mvp` (or your preferred name)
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` (free tier should work for MVP)
- **Region**: `Oregon` (or closest to your users)

### Step 3: Environment Variables
Add the environment variables listed above in the "Environment" section.

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for initial deployment (may take 5-10 minutes)
3. Check deployment logs for any errors
4. Once deployed, access your app at `https://your-app-name.onrender.com`

## Post-Deployment Verification

### Functional Tests
- [ ] App loads without errors
- [ ] Form navigation works (all 5 steps)
- [ ] File upload accepts XML files
- [ ] Form validation works
- [ ] Recommendations are generated
- [ ] Error handling works

### Performance Tests
- [ ] Initial page load < 3 seconds
- [ ] Processing time < 10 seconds
- [ ] No console errors
- [ ] Mobile responsive

### API Integration Tests
- [ ] Supplier data loads (may use mock data if APIs unavailable)
- [ ] Plan recommendations generate correctly
- [ ] Error handling for API failures

## Monitoring & Maintenance

### Basic Monitoring
- Check Render dashboard for uptime
- Monitor error logs in Render
- Test user flows periodically

### Updates
- Push changes to main branch for auto-deployment
- Test thoroughly before pushing production changes
- Monitor performance after updates

## Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

**Runtime Errors**
- Verify environment variables are set correctly
- Check API keys are valid and have proper permissions
- Review server logs for detailed error messages

**API Issues**
- Verify API keys are correct
- Check API rate limits
- Ensure API endpoints are accessible

### Support
- Render support: https://docs.render.com/
- Check application logs in Render dashboard
- Use browser developer tools for client-side debugging

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use Render's secret management for sensitive data
- Rotate API keys regularly

### Data Privacy
- User data is processed in-memory only
- No persistent storage of personal information
- Clear localStorage on session end

## Rollback Plan

If deployment fails:
1. Check Render logs for specific errors
2. Revert to previous working commit
3. Test locally before re-deploying
4. Contact Render support if needed

## Next Steps (Future Enhancements)

- Database integration for caching
- User authentication and data persistence
- Advanced monitoring and analytics
- Multi-region deployment
- CDN integration for static assets

---

## Deployment Checklist

- [ ] GitHub repository connected to Render
- [ ] Environment variables configured
- [ ] Build and start commands set
- [ ] Service plan selected
- [ ] Initial deployment successful
- [ ] Functional testing completed
- [ ] Performance testing passed
- [ ] API integrations working
- [ ] Monitoring set up
- [ ] Documentation updated

**Status**: ⏳ Ready for deployment

