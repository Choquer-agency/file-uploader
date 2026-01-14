#!/bin/bash

echo "AttachFlow Development Server"
echo "============================="
echo ""
echo "Due to npm permission issues, you'll need to:"
echo ""
echo "1. Fix npm permissions by running:"
echo "   sudo chown -R $(whoami) ~/.npm"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Run the development server:"
echo "   npm run dev"
echo ""
echo "The application will be available at http://localhost:3000"
echo ""
echo "For now, you can test the widget by:"
echo "1. Opening public/widget.js in a browser"
echo "2. Or including it in any HTML page with:"
echo '   <script>window.ATTACHFLOW_SITE_KEY = "demo-key";</script>'
echo '   <script src="widget.js"></script>'