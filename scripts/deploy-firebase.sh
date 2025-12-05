#!/bin/bash

# Firebase Deployment Script for Phase 2
# This script handles the complete deployment process to Firebase Hosting

set -e

echo "🚀 Starting Firebase deployment for Phase 2..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🌐 Your application is now live at:"
    firebase hosting:channel:list | grep -A 5 "Hosting URL"
    echo ""
    echo "📊 Monitor your application at:"
    echo "https://console.firebase.google.com/project/YOUR_PROJECT_ID/overview"
    echo ""
    echo "🧪 Test the live application to ensure everything works correctly."
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
