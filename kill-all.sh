#!/bin/bash
echo "Stopping everything..."
./kill-frontend.sh
./kill-backend.sh
./kill-db.sh
echo "Done."
