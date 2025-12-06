#!/bin/bash
echo "Killing Backend on port 3001..."
PIDS=$(lsof -ti:3001)
if [ -z "$PIDS" ]; then
  echo "Backend not running on port 3001"
else
  kill -9 $PIDS
fi
