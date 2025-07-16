#!/bin/bash

# Manual API testing script for the authentication system
# Run this after deploying the worker

BASE_URL="http://localhost:8787"  # Change this to your worker URL

echo "🧪 Testing Pterodactyl Panel Authentication API"
echo "=============================================="

echo ""
echo "📋 Testing Health Check..."
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "🔐 Testing User Login..."
LOGIN_RESPONSE=$(curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!",
    "remember": false
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s)

echo "$LOGIN_RESPONSE"

# Extract access token for subsequent requests
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo ""
  echo "✅ Login successful! Access token: ${ACCESS_TOKEN:0:20}..."
  
  echo ""
  echo "👤 Testing Get Current User..."
  curl -X GET "$BASE_URL/api/auth/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\nStatus: %{http_code}\n\n"

  echo ""
  echo "🔄 Testing Token Refresh..."
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$REFRESH_TOKEN" ]; then
    curl -X POST "$BASE_URL/api/auth/refresh" \
      -H "Content-Type: application/json" \
      -d "{
        \"refresh_token\": \"$REFRESH_TOKEN\"
      }" \
      -w "\nStatus: %{http_code}\n\n"
  fi

  echo ""
  echo "🚪 Testing Logout..."
  curl -X POST "$BASE_URL/api/auth/logout" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -w "\nStatus: %{http_code}\n\n"

else
  echo "❌ Login failed - no access token received"
fi

echo ""
echo "📝 Testing User Registration..."
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "NewUserPassword123!",
    "password_confirmation": "NewUserPassword123!",
    "first_name": "New",
    "last_name": "User"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "🚫 Testing Invalid Login..."
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "⚡ Testing Rate Limiting (5 rapid requests)..."
for i in {1..5}; do
  echo "Request $i:"
  curl -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "password": "wrongpassword"
    }' \
    -w "Status: %{http_code}\n" \
    -s | head -1
done

echo ""
echo "🔒 Testing Protected Endpoint Without Auth..."
curl -X GET "$BASE_URL/api/auth/me" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "🌐 Testing CORS (OPTIONS request)..."
curl -X OPTIONS "$BASE_URL/api/auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ API testing complete!"