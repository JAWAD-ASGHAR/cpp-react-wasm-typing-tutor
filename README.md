# Typing Practice Application

A typing speed test app similar to MonkeyType, built with C++ and React. Practice typing and see how fast you can go!

## What is This?

This is a web application where you can practice typing and measure your typing speed. The interesting part is that the core logic (generating words, tracking your accuracy, calculating your speed) runs in **C++** code that's been compiled to **WebAssembly** so it can run in your browser. The visual interface is built with **React**.

Think of it like this:
- **C++**: The "brain" that does all the calculations (fast!)
- **WebAssembly**: The translation layer that lets C++ run in browsers
- **React**: The "face" that shows you a nice interface

## Why C++ in a Browser?

Normally, C++ runs on your computer as a regular program. But with WebAssembly, we can compile C++ code so it runs inside your web browser instead of JavaScript. This means:
- We can use C++ concepts like classes, objects, and memory management
- The code runs very fast (nearly as fast as regular C++)
- We still get the convenience of a web app (works on any computer with a browser)

## How It Works (Simple Version)

1. **WordGenerator** - Creates random sentences for you to type
2. **TypingSession** - Keeps track of what you type and calculates your score
3. **Timer** - Measures how long you've been typing
4. **React Interface** - Shows everything on screen and lets you interact with it

When you type, the React app sends your input to the C++ code running in WebAssembly. The C++ code calculates your accuracy and words-per-minute, then sends the results back to React to display on screen.

## Project Structure

```
cpp-react-wasm-typing-tutor/
├── C++ Files (the "brain")
│   ├── WordGenerator.cpp/h    - Creates random text
│   ├── TypingSession.cpp/h    - Tracks typing and calculates stats
│   ├── Timer.cpp/h            - Measures time
│   └── bindings.cpp           - Connects C++ to JavaScript
│
├── React Files (the "face")
│   ├── src/App.jsx            - Main screen
│   ├── src/wasmLoader.js      - Loads the C++ code
│   └── public/                - WebAssembly files go here
│
└── Build Files
    ├── Makefile               - Builds the C++ code
    └── package.json           - JavaScript dependencies
```

## Getting Started

See [QUICKSTART.md](QUICKSTART.md) for step-by-step setup instructions.

Quick version:
1. Install Emscripten (compiles C++ to WebAssembly)
2. Install Node.js
3. Run `make` to build
4. Copy files to `public/`
5. Run `npm install`
6. Run `npm run dev`

## Features

- Real-time typing speed (WPM - words per minute)
- Accuracy tracking (% of correct characters)
- Visual feedback (green for correct, red for mistakes)
- Progress tracking
- Clean, simple interface
- **Leaderboard system** - Compete with others and see top scores (optional, requires Supabase setup)

## What You Can Learn From This Project

**For Beginners:**
- How web applications work
- What WebAssembly is
- Basic C++ concepts (classes, functions)
- Basic React concepts (components, state)

**For More Advanced:**
- How to compile C++ to WebAssembly using Emscripten
- Connecting C++ code to JavaScript/React
- Object-oriented programming in C++
- Memory management in C++
- Building full-stack web applications

## Technologies Used

- **C++**: Programming language for the core logic
- **Emscripten**: Tool that compiles C++ to WebAssembly
- **WebAssembly (WASM)**: Binary format that runs in browsers
- **React**: JavaScript library for building user interfaces
- **Vite**: Build tool that makes development easier
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Supabase**: Backend-as-a-Service for leaderboard (optional)

## Leaderboard Setup (Optional)

To enable the leaderboard feature:

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the Supabase dashboard
3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor (go to SQL Editor → New Query → paste the SQL → Run)

The leaderboard will automatically appear once configured!

## Building for Production

When you're ready to share your app:

```bash
make
cp typing.js typing.wasm public/
npm run build
```

The finished app will be in the `dist/` folder.

---

This project is for educational purposes - have fun learning!
