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
│   ├── src/
│   │   ├── App.jsx            - Main router and route definitions
│   │   ├── main.jsx           - Application entry point
│   │   ├── pages/
│   │   │   ├── TypingTest.jsx - Main typing test interface
│   │   │   ├── LeaderboardPage.jsx - Global leaderboard view
│   │   │   └── ProfilePage.jsx - User profile with stats and graphs
│   │   ├── components/
│   │   │   ├── UsernameButton.jsx - Username display and navigation
│   │   │   ├── NameInputModal.jsx - Username input modal
│   │   │   └── Leaderboard.jsx - Leaderboard component (legacy)
│   │   ├── lib/
│   │   │   └── supabase.js    - Supabase client configuration
│   │   └── wasmLoader.js       - Loads the C++ code
│   └── public/                - WebAssembly files and static assets
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

### Typing Test
- **60-second timed tests** - Tests automatically finish after 60 seconds or when you complete all text
- **Real-time statistics** - Live WPM (words per minute) and accuracy tracking
- **Visual feedback** - Color-coded characters (green for correct, red for mistakes)
- **Smart timer** - Timer only starts when you begin typing, not when you click start
- **Keyboard shortcuts**:
  - `Enter` - Start test or restart after completion
  - `Tab` - Restart test during active session
- **Auto-save scores** - All test results are automatically saved to your profile

### Profile & Progress Tracking
- **Personal profile page** - View your typing history and statistics
- **Progress graphs** - Interactive charts showing WPM and Accuracy trends over time (day/week/month views)
- **Activity heatmap** - GitHub-style contribution graph showing your daily practice activity
- **Session history** - Complete history of all your tests with filtering options (today, week, month, year, all time)
- **Best score tracking** - See your personal best and leaderboard position
- **Shareable profiles** - Each user has a unique profile URL that can be shared

### Leaderboard
- **Global rankings** - See top 100 typists ranked by WPM, accuracy, and time
- **Score comparison** - Rankings consider WPM first, then accuracy, then time
- **User profiles** - Click any username to view their profile and progress
- **Real-time updates** - Leaderboard updates automatically as new scores are submitted

### User Experience
- **Username management** - Set your username once, it's remembered across sessions
- **Multi-page navigation** - Seamless navigation between Test, Leaderboard, and Profile pages
- **Responsive design** - Works beautifully on desktop and mobile devices
- **Dark theme** - Easy on the eyes with a modern dark color scheme

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
- **React Router**: Client-side routing for multi-page navigation
- **Vite**: Build tool that makes development easier
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Recharts**: Charting library for progress graphs
- **Supabase**: Backend-as-a-Service for leaderboard and user data storage
- **React Icons**: Icon library for UI elements

## Leaderboard Setup (Optional)

To enable the leaderboard and profile features:

1. **Create a Supabase account and project** at [supabase.com](https://supabase.com)

2. **Get your credentials** from the Supabase dashboard:
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

3. **Create a `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Create the database table**:
   - Go to SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to execute the SQL

5. **Enable Row Level Security (RLS)**:
   - The schema includes RLS policies, but verify they're enabled
   - Go to Authentication → Policies to check

Once configured, the leaderboard and profile features will automatically be available! All test scores will be saved to your profile, and you can view your progress over time.

## Building for Production

When you're ready to deploy your app:

```bash
# Build the WebAssembly files
make

# Copy WASM files to public directory
cp typing.js typing.wasm public/

# Build the React app
npm run build
```

The finished app will be in the `dist/` folder, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

### Deployment Notes

- **Vercel**: The project includes a `vercel.json` file for proper SPA routing
- **Environment Variables**: Make sure to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform's environment variables
- **Public Files**: Ensure `typing.js` and `typing.wasm` are in the `public/` folder before building

## How to Use

1. **Start a Test**: Click "Start Test" or press `Enter`
2. **Type the Text**: Begin typing when ready - the timer starts with your first keystroke
3. **View Results**: After completing the text or 60 seconds, see your WPM, accuracy, and time
4. **Set Username**: If you haven't set a username, you'll be prompted after your first test
5. **View Profile**: Click your username in the header to see your progress, graphs, and history
6. **Check Leaderboard**: Click the trophy icon to see top typists
7. **Share Profile**: Your profile URL can be shared with others (e.g., `/profile/YourUsername`)

---

This project is for educational purposes - have fun learning!
