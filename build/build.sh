#!/bin/bash

echo "Building Typing Practice Application..."
echo ""

if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten (emcc) not found!"
    echo "Please activate Emscripten environment first:"
    echo "  source /path/to/emsdk/emsdk_env.sh"
    exit 1
fi

echo "Step 1: Compiling C++ to WebAssembly..."
cd "$(dirname "$0")"
make clean
make

if [ $? -ne 0 ]; then
    echo "Error: WebAssembly compilation failed!"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: WebAssembly compilation failed!"
    exit 1
fi

echo ""
echo "Step 2: Installing Node.js dependencies..."
cd ..
npm install

if [ $? -ne 0 ]; then
    echo "Error: npm install failed!"
    exit 1
fi

echo ""
echo "Build complete! Files are in public/ directory."
echo ""
echo "You can now run:"
echo "  npm run dev"
echo ""
echo "Or build for production:"
echo "  npm run build"

