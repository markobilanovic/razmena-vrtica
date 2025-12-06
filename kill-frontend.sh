#!/bin/bash
echo "Killing Frontend..."
pkill -f "next dev" || echo "Frontend not running"
