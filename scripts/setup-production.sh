#!/bin/bash

# Production Setup Script for Phase 2
# This script configures the production environment for Firebase deployment

set -e

echo "🔧 Setting up production environment for Phase 2..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "Please login to Firebase:"
    firebase login
fi

# Initialize Firebase project (if not already done)
if [ ! -f "firebase.json" ]; then
    echo "📁 Initializing Firebase project..."
    firebase init hosting --project YOUR_PROJECT_ID
else
    echo "✅ Firebase project already initialized"
fi

# Create production environment variables file
if [ ! -f ".env.production" ]; then
    echo "📝 Creating production environment variables..."
    cat > .env.production << EOL
# Production Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Production EIA API
EIA_API_KEY=your_production_eia_api_key
UTILITY_API_KEY=your_production_eia_api_key

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
EOL

    echo "⚠️  Please update .env.production with your actual Firebase credentials"
    echo "   You can find these in the Firebase Console > Project Settings > General > Your apps"
else
    echo "✅ Production environment variables already exist"
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci

# Build the application to check for any issues
echo "🏗️  Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed. Please fix the errors."
    exit 1
fi

# Deploy Firestore rules and indexes
echo "📋 Deploying Firestore configuration..."
firebase deploy --only firestore:rules

# Set up monitoring
echo "📊 Setting up production monitoring..."

# Create a simple monitoring script
cat > scripts/monitor-production.sh << 'EOL'
#!/bin/bash

echo "📊 Production Monitoring Report"
echo "================================"

# Check Firebase usage
echo "🔥 Firebase Usage (last 30 days):"
firebase functions:list 2>/dev/null || echo "No functions deployed yet"
firebase firestore:indexes 2>/dev/null || echo "No custom indexes"

# Check hosting status
echo ""
echo "🌐 Hosting Status:"
firebase hosting:sites:list 2>/dev/null || echo "Unable to check hosting status"

echo ""
echo "💡 Next Steps:"
echo "1. Monitor Firebase Console for usage and errors"
echo "2. Set up alerts for billing and performance"
echo "3. Test all Phase 2 features in production"
echo "4. Monitor user adoption and feedback"

echo ""
echo "🚨 Stay within $20/month Firebase budget:"
echo "- Monitor Firestore reads/writes daily"
echo "- Watch for unusual spikes in usage"
echo "- Optimize queries if approaching limits"
EOL

chmod +x scripts/monitor-production.sh

echo ""
echo "🎯 Production setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.production with your Firebase credentials"
echo "2. Run: ./scripts/deploy-firebase.sh"
echo "3. Monitor with: ./scripts/monitor-production.sh"
echo ""
echo "🔗 Useful links:"
echo "- Firebase Console: https://console.firebase.google.com"
echo "- Hosting URL: Will be shown after deployment"
echo "- Billing: https://console.firebase.google.com/project/YOUR_PROJECT_ID/usage"
