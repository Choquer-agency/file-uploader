#!/bin/bash

echo "Starting AttachFlow Demo Server..."
echo "================================="
echo ""

# Use Python's built-in HTTP server to serve the demo
cd public
echo "Server starting at http://localhost:8080/demo.html"
echo ""
echo "Note: File uploads won't work without the backend API running."
echo "This is just for testing the widget UI."
echo ""
python3 -m http.server 8080