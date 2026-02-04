# FRCR 2A Platform - Deployment Guide

## Pre-Deployment Checklist

### Stripe Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Create a product and price in Stripe Dashboard
- [ ] Get your API keys (Publishable key and Secret key)
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Note down your Price ID for the subscription

### Domain Registration
- [ ] Register domain (e.g., frcrforum.co.uk)
- [ ] Verify ownership

## Deployment to Render.com

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Database
1. Click "New" > "PostgreSQL"
2. Name: `frcr-db`
3. Region: Frankfurt (closest to UK)
4. Plan: Starter ($7/month)
5. Click "Create Database"
6. Wait for database to be ready
7. Copy the "Internal Database URL"

### Step 3: Deploy Backend
1. Click "New" > "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `frcr-api`
   - Region: Frankfurt
   - Branch: `main`
   - Root Directory: (leave empty)
   - Runtime: Node
   - Build Command: `npm install && npm run build:backend && npx prisma generate`
   - Start Command: `npm run start --workspace=backend`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=(paste Internal Database URL from step 2)
   JWT_SECRET=(generate a secure random string)
   JWT_REFRESH_SECRET=(generate another secure random string)
   FRONTEND_URL=(set after frontend deploys)
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRICE_ID=price_xxx
   ```
5. Click "Create Web Service"

### Step 4: Run Database Migration
1. Go to your backend service in Render
2. Click "Shell" tab
3. Run: `npx prisma migrate deploy`
4. Run: `npm run db:import` (to import questions)

### Step 5: Deploy Frontend
1. Click "New" > "Static Site"
2. Connect the same repository
3. Configure:
   - Name: `frcr-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://frcr-api.onrender.com/api/v1
   ```
   (Replace with your actual backend URL)
5. Click "Create Static Site"

### Step 6: Update Backend FRONTEND_URL
1. Go to your backend service
2. Update the `FRONTEND_URL` environment variable to your frontend URL
3. The service will auto-redeploy

### Step 7: Configure Stripe Webhook
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://frcr-api.onrender.com/api/v1/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in Render

### Step 8: Configure Custom Domain
1. In Render, go to your frontend service
2. Click "Settings" > "Custom Domains"
3. Add your domain
4. Update DNS records at your registrar:
   - For root domain: A record pointing to Render IP
   - For www: CNAME record pointing to your Render URL
5. Wait for SSL certificate to be provisioned

## Post-Deployment Verification

### Functional Tests
- [ ] Visit homepage - loads correctly
- [ ] Register new account
- [ ] Login with new account
- [ ] Navigate to pricing page
- [ ] Complete Stripe checkout (use test card 4242 4242 4242 4242)
- [ ] Verify subscription activated
- [ ] Start an exam
- [ ] Answer questions
- [ ] Submit exam
- [ ] View results
- [ ] Admin login (promote a user first)
- [ ] Admin dashboard accessible

### Security Tests
- [ ] Try to copy question text - should be blocked
- [ ] Try right-click on questions - should be blocked
- [ ] Try Ctrl+C on questions - should be blocked
- [ ] Try multiple failed logins - should get rate limited

## Monitoring Setup

### UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Create free account
3. Add monitors:
   - HTTP(s) monitor for `https://your-domain.com`
   - HTTP(s) monitor for `https://frcr-api.onrender.com/api/v1/health`
4. Configure alerts (email/SMS)

### Sentry (Error Tracking)
1. Go to https://sentry.io
2. Create free account
3. Create new project (React)
4. Install Sentry SDK (optional, for production error tracking)

## Maintenance

### Database Backups
Render automatically backs up PostgreSQL databases daily (on paid plans).

### Scaling
If you need to handle more traffic:
1. Upgrade backend to Standard plan ($25/month)
2. Upgrade database to Standard plan ($25/month)

### Costs Summary
| Service | Monthly Cost |
|---------|-------------|
| Render Backend (Starter) | $7 |
| Render Database (Starter) | $7 |
| Render Frontend (Static) | Free |
| Domain (.co.uk) | ~£1 |
| **Total** | ~£15/month |

## Troubleshooting

### Common Issues

**Backend not starting:**
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

**Stripe webhooks failing:**
- Verify webhook secret is correct
- Check Stripe Dashboard for webhook logs
- Ensure webhook URL is correct

**Frontend API calls failing:**
- Check VITE_API_URL is correct
- Verify CORS settings allow frontend origin
- Check backend logs for errors

**Database connection issues:**
- Verify DATABASE_URL format
- Check database is running in Render
- Try redeploying backend

## Support
For issues, check:
- Render status: https://status.render.com
- Stripe status: https://status.stripe.com
