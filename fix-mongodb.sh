#!/bin/bash

echo "🌐 MongoDB Atlas IP Whitelisting Helper"
echo "========================================"
echo ""

# Get current public IP
echo "🔍 Detecting your current public IP address..."
CURRENT_IP=$(curl -s https://api.ipify.org)

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Could not detect your public IP address"
    echo "Please visit: https://whatismyipaddress.com/"
    exit 1
fi

echo "📍 Your current public IP: $CURRENT_IP"
echo ""

echo "🔧 TO FIX THE MONGODB CONNECTION ISSUE:"
echo "1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/"
echo "2. Select your project: HackTX2025"
echo "3. Click 'Network Access' in the left sidebar"
echo "4. Click 'Add IP Address'"
echo "5. Choose one of these options:"
echo ""
echo "   Option A (Recommended):"
echo "   - Click 'Add Current IP Address'"
echo "   - This will add: $CURRENT_IP"
echo ""
echo "   Option B (For development):"
echo "   - Enter: 0.0.0.0/0"
echo "   - This allows all IPs (less secure but easier for demos)"
echo ""
echo "6. Click 'Confirm'"
echo "7. Wait 1-2 minutes for changes to take effect"
echo "8. Restart your server: npm run dev"
echo ""

echo "🎯 Your MongoDB connection string:"
echo "mongodb+srv://vishalraamr_db_user:<db_password>@hacktx2025.ktaxvnu.mongodb.net/?retryWrites=true&w=majority&appName=HackTX2025"
echo ""
echo "⚠️  Don't forget to replace <db_password> with your actual password!"
echo ""

echo "🔄 Alternative: The app now has fallback mode!"
echo "If you can't fix MongoDB right now, the app will work with demo data."
echo "Just run: npm run dev"
