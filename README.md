# Typing Practice Application

A MonkeyType-style typing practice application built with C++ (OOP), Emscripten WebAssembly, and React.

## Project Structure

```
Project OOPs/
├── C++ Source Files
│   ├── WordGenerator.h/cpp    - Generates random word sequences
│   ├── TypingSession.h/cpp     - Manages typing session and statistics
│   ├── Timer.h/cpp             - Simple timer for tracking elapsed time
│   └── bindings.cpp            - Emscripten bindings to expose C++ to JS
├── React Application
│   ├── src/
│   │   ├── App.jsx             - Main React component
│   │   ├── App.css             - Styling
│   │   ├── wasmLoader.js       - WASM module loader and bridge
│   │   ├── main.jsx            - React entry point
│   │   └── index.css           - Global styles
│   ├── index.html              - HTML template
│   ├── package.json            - Node dependencies
│   └── vite.config.js          - Vite configuration
├── Makefile                    - Build script for WebAssembly
└── README.md                   - This file
```

## Prerequisites

1. **Emscripten SDK** - For compiling C++ to WebAssembly
   - Install from: https://emscripten.org/docs/getting_started/downloads.html
   - Activate: `source emsdk_env.sh`

2. **Node.js and npm** - For React development
   - Install from: https://nodejs.org/

## Building the Project

### Step 1: Compile C++ to WebAssembly

First, make sure Emscripten is activated in your terminal:

```bash
source /path/to/emsdk/emsdk_env.sh
```

Then compile the C++ code:

```bash
make
```

This will generate:
- `typing.js` - JavaScript wrapper for WebAssembly
- `typing.wasm` - WebAssembly binary

### Step 2: Install React Dependencies

```bash
npm install
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## How It Works

### C++ Classes

1. **WordGenerator**: Contains a word list and generates random word sequences
2. **TypingSession**: Tracks user input, calculates accuracy and WPM
3. **Timer**: Simple timer using C++ clock functions

### WebAssembly Bridge

The `bindings.cpp` file exposes C++ functions to JavaScript using Emscripten's `EMSCRIPTEN_KEEPALIVE` and `extern "C"`:

- `generateText(int wordCount)` - Generates random text
- `startSession(char* text)` - Starts a new typing session
- `updateInput(char* userTyped)` - Updates user input and calculates stats
- `getAccuracy()` - Returns accuracy percentage
- `getWPM(double secondsElapsed)` - Calculates words per minute
- `resetSession()` - Resets the session
- `getElapsedSeconds()` - Gets elapsed time

### React UI

The React application:
- Loads the WASM module on mount
- Displays generated text with color-coded feedback
- Shows real-time statistics (WPM, accuracy, timer)
- Handles user input and updates WASM session
- Displays results when test completes

## Features

- ✅ Real-time typing feedback (correct/incorrect characters highlighted)
- ✅ Live statistics (WPM, accuracy, timer)
- ✅ Progress tracking
- ✅ Clean, modern UI
- ✅ Responsive design

## Building for Production

```bash
# Compile WASM
make

# Build React app
npm run build
```

The production build will be in the `dist/` directory.

## Troubleshooting

### Emscripten not found
Make sure you've activated the Emscripten environment:
```bash
source /path/to/emsdk/emsdk_env.sh
```

### WASM module not loading
- Ensure `typing.js` and `typing.wasm` are in the project root
- Check browser console for errors
- Make sure you're running a local server (Vite dev server handles this)

### Build errors
- Check that all C++ header files are present
- Verify Emscripten version compatibility
- Ensure all source files are in the same directory

## License

This project is for educational purposes.

