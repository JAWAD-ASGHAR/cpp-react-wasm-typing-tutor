# Quick Start Guide

## Prerequisites Setup

1. **Install Emscripten:**
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. **Install Node.js:**
   - Download from https://nodejs.org/
   - Verify: `node --version` and `npm --version`

## Build & Run

### Option 1: Using the build script
```bash
./build.sh
npm run dev
```

### Option 2: Manual steps

1. **Compile WebAssembly:**
   ```bash
   source /path/to/emsdk/emsdk_env.sh  # Activate Emscripten
   make
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Navigate to the URL shown in terminal (usually http://localhost:5173)

## Usage

1. Click **"Start Test"** to begin
2. Type the displayed text as accurately as possible
3. Watch real-time stats (WPM, accuracy, timer)
4. Test completes automatically when you finish typing
5. Click **"Retry"** to start a new test

## Project Files Overview

- **C++ Classes:** `WordGenerator.*`, `TypingSession.*`, `Timer.*`
- **WASM Bindings:** `bindings.cpp`
- **React App:** `src/App.jsx`, `src/wasmLoader.js`
- **Build Config:** `Makefile`, `package.json`, `vite.config.js`

## Troubleshooting

- **"emcc: command not found"** → Activate Emscripten environment
- **WASM not loading** → Ensure `typing.js` and `typing.wasm` are in project root
- **Module errors** → Check browser console for detailed error messages

