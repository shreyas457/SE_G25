#!/bin/bash

# Automated Test Suite Runner
# Runs all tests across backend, frontend, and admin folders

set -e  # Exit on any error

echo "🚀 Running Automated Test Suite"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
BACKEND_EXIT=0
FRONTEND_EXIT=0
ADMIN_EXIT=0

# Backend Tests
echo "📦 Running Backend Tests..."
echo "---------------------------"
cd backend
if [ ! -d "node_modules" ]; then
  echo "⚠️  Installing backend dependencies..."
  npm install --silent
fi
if npm test 2>&1 | tee /tmp/backend-test.log; then
  echo -e "${GREEN}✅ Backend tests passed${NC}"
else
  echo -e "${RED}❌ Backend tests failed${NC}"
  BACKEND_EXIT=1
fi
cd ..
echo ""

# Frontend Tests
echo "📦 Running Frontend Tests..."
echo "---------------------------"
cd frontend
if [ ! -d "node_modules" ]; then
  echo "⚠️  Installing frontend dependencies..."
  npm install --silent
fi
if npm test -- --run 2>&1 | tee /tmp/frontend-test.log; then
  echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
  echo -e "${RED}❌ Frontend tests failed${NC}"
  FRONTEND_EXIT=1
fi
cd ..
echo ""

# Admin Tests
echo "📦 Running Admin Tests..."
echo "---------------------------"
cd admin
if [ ! -d "node_modules" ]; then
  echo "⚠️  Installing admin dependencies..."
  npm install --silent
fi
if npm test -- --run 2>&1 | tee /tmp/admin-test.log; then
  echo -e "${GREEN}✅ Admin tests passed${NC}"
else
  echo -e "${RED}❌ Admin tests failed${NC}"
  ADMIN_EXIT=1
fi
cd ..
echo ""

# Summary
echo "================================"
echo "📊 Test Results Summary:"
echo "================================"
echo -e "Backend:  $([ $BACKEND_EXIT -eq 0 ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo -e "Frontend: $([ $FRONTEND_EXIT -eq 0 ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo -e "Admin:    $([ $ADMIN_EXIT -eq 0 ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "================================"
echo ""

# Exit with appropriate code
if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ] && [ $ADMIN_EXIT -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Check the logs above for details.${NC}"
  exit 1
fi

