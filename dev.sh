#!/bin/bash

# Function to kill all child processes when script exits
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    docker compose -f docker-compose.dev.yml stop
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "Starting Database..."
docker compose -f docker-compose.dev.yml up -d

echo "Starting Backend..."
cd backend
PORT=3001 npm run start:dev &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
PORT=3000 npm run dev &
FRONTEND_PID=$!
cd ..

echo "Services started! Press Ctrl+C to stop."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for all background processes
wait
