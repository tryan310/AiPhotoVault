#!/bin/bash

# Webhook Setup Script for AI Photo Booth
echo "🚀 Setting up Stripe Webhook for Production"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    brew install ngrok/ngrok/ngrok
fi

# Start ngrok in background
echo "🌐 Starting ngrok tunnel..."
pkill -f ngrok 2>/dev/null || true
ngrok http 3001 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
echo "⏳ Waiting for ngrok to start..."
sleep 5

# Get the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Check ngrok.log for details."
    exit 1
fi

WEBHOOK_URL="${NGROK_URL}/api/webhook"
echo "✅ Ngrok tunnel active: $NGROK_URL"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""
echo "📋 Next steps:"
echo "1. Go to Stripe Dashboard → Developers → Webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Endpoint URL: $WEBHOOK_URL"
echo "4. Select event: checkout.session.completed"
echo "5. Copy the webhook secret and add to your .env file:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here"
echo ""
echo "🧪 Test your webhook:"
echo "   node test-webhook.js $WEBHOOK_URL"
echo ""
echo "Press Ctrl+C to stop ngrok when done testing"

# Keep script running
wait $NGROK_PID
