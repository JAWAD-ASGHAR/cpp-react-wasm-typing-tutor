#!/bin/bash

# Build script for Typing Practice Application

echo "Building Typing Practice Application..."
echo ""

# Check if Emscripten is available
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten (emcc) not found!"
    echo "Please activate Emscripten environment first:"
    echo "  source /path/to/emsdk/emsdk_env.sh"
    exit 1
fi

echo "Step 1: Compiling C++ to WebAssembly..."
make clean
make

if [ $? -ne 0 ]; then
    echo "Error: WebAssembly compilation failed!"
    exit 1
fi

echo ""
echo "Step 2: Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: npm install failed!"
    exit 1
fi

echo ""
echo "Build complete! You can now run:"
echo "  npm run dev"
echo ""
echo "Or build for production:"
echo "  npm run build"

