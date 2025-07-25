#!/bin/bash

echo "🧪 Testing Authentication Fix..."

# Set API base URL
API_BASE_URL="${API_URL:-http://localhost:3000}"

echo -e "\n1️⃣ Testing health check endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o health_response.json "$API_BASE_URL/api/health")
echo "Health Status: $HEALTH_RESPONSE"

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed:"
    cat health_response.json
    echo ""
else
    echo "❌ Health check failed"
fi

echo -e "\n2️⃣ Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    "$API_BASE_URL/api/auth/login")

echo "Login Status: $LOGIN_RESPONSE"

if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo "✅ Login successful"
    
    # Extract token from response
    TOKEN=$(cat login_response.json | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ Token received: ${TOKEN:0:20}..."
        
        echo -e "\n3️⃣ Testing protected endpoint with token..."
        PROTECTED_RESPONSE=$(curl -s -w "%{http_code}" -o protected_response.json \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE_URL/api/requests")
        
        echo "Protected endpoint status: $PROTECTED_RESPONSE"
        
        if [ "$PROTECTED_RESPONSE" = "200" ]; then
            echo "✅ Protected endpoint accessible with token"
        else
            echo "❌ Protected endpoint failed:"
            cat protected_response.json
        fi
    else
        echo "❌ No token in login response"
        cat login_response.json
    fi
else
    echo "❌ Login failed:"
    cat login_response.json
fi

# Clean up
rm -f health_response.json login_response.json protected_response.json

echo -e "\n�� Test completed!" 