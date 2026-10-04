#!/bin/bash

echo "========================================================"
echo "  PLANT MANAGEMENT SYSTEM - LAUNCHER OFFLINE"
echo "========================================================"

if [ ! -d "dist" ]; then
    echo "Direktori dist belum ada, melakukan build terlebih dahulu..."
    npm run build
fi

echo ""
echo "Menjalankan local offline web server..."
echo ""

if command -v node >/dev/null 2>&1; then
    node serve-offline.js
elif command -v python3 >/dev/null 2>&1; then
    echo "Menjalankan via Python3 web server di port 3000..."
    cd dist && python3 -m http.server 3000
else
    echo "Silakan install Node.js atau jalankan dengan web server lokal apapun."
fi
