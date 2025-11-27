# Quick Start Guide

Follow these steps to get the Typing Practice app running on your computer.

## Step 1: Install Emscripten

Emscripten compiles C++ code so it can run in a web browser.

1. Open terminal and go to your home directory:
   ```bash
   cd ~
   ```

2. Download and install Emscripten:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

3. Check it worked:
   ```bash
   emcc --version
   ```
   (You should see a version number)

## Step 2: Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/). Version 16 or higher.

Check it worked:
```bash
node --version
npm --version
```

## Step 3: Build the Project

1. Go to your project folder:
   ```bash
   cd /path/to/cpp-react-wasm-typing-tutor
   ```

2. Activate Emscripten (needed every time you open a new terminal):
   ```bash
   source ~/emsdk/emsdk_env.sh
   ```

3. Build the WebAssembly files:
   ```bash
   make
   ```

4. Copy the files to the public folder:
   ```bash
   cp typing.js typing.wasm public/
   ```

5. Install JavaScript packages:
   ```bash
   npm install
   ```

6. Start the app:
   ```bash
   npm run dev
   ```

7. Open your browser and go to the URL shown in terminal (usually `http://localhost:5173`)

## How to Use

- Click **"Start Test"** to begin
- Type the text that appears
- Watch your WPM and accuracy in real-time
- Click **"Retry"** to start a new test

Done! The app should now be running in your browser.
