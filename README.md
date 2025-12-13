# Typing Practice Application - Complete Documentation

A high-performance typing speed test application built with **C++ compiled to WebAssembly** and **React**, featuring real-time statistics, progress tracking, and global leaderboards. This project demonstrates modern web development techniques by combining native code performance with web application flexibility.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Installation & Setup](#installation--setup)
6. [Project Structure](#project-structure)
7. [How It Works](#how-it-works)
8. [Core Components](#core-components)
9. [User Interface](#user-interface)
10. [Data Flow](#data-flow)
11. [Performance Optimizations](#performance-optimizations)
12. [Development Workflow](#development-workflow)
13. [Building & Deployment](#building--deployment)
14. [Configuration](#configuration)
15. [Troubleshooting](#troubleshooting)
16. [Learning Resources](#learning-resources)
17. [Contributing](#contributing)
18. [License](#license)

---

## Project Overview

### What Is This Project?

This is a **full-stack typing speed test application** that combines:

- **C++** for high-performance business logic (compiled to WebAssembly)
- **React** for modern, reactive user interface
- **Supabase** for backend data persistence and real-time features
- **WebAssembly** as the bridge between C++ and JavaScript

### Why This Architecture?

**Traditional Web Apps**: JavaScript handles everything
- ✅ Easy to develop
- ❌ Slower for heavy computations
- ❌ Limited type safety

**This Project**: C++ for logic, JavaScript for UI
- ✅ Near-native performance for calculations
- ✅ Strong type safety in C++
- ✅ Modern, reactive UI with React
- ✅ Best of both worlds

### Key Innovation

The core innovation is using **WebAssembly (WASM)** to run C++ code directly in the browser. This allows us to:

1. Write performance-critical code in C++ (typing calculations, text generation)
2. Compile it to WebAssembly using Emscripten
3. Call C++ functions from JavaScript/React
4. Achieve near-native performance while maintaining web app flexibility

### Real-World Applications

This architecture pattern is used by:
- **Figma** - Design tool with C++ rendering engine
- **AutoCAD Web** - CAD software running in browser
- **Google Earth** - 3D rendering with native code
- **Photoshop Web** - Image processing in browser
- **Video editors** - Real-time video processing

---

## Key Features

### 🎯 Typing Test Features

#### Multiple Text Types
- **Random Words**: 25 random words (5-6 letters each) for speed practice
- **Sentences**: 3 complete sentences with simple vocabulary
- **Mixed Case**: 25 words with randomized capitalization for advanced practice

#### Real-Time Statistics
- **WPM (Words Per Minute)**: Calculated using standard formula: `(correctChars / 5) / minutes`
- **Accuracy**: Percentage of correctly typed characters
- **Timer**: High-precision timer that starts on first keystroke
- **Live Updates**: Statistics update every 100ms during typing

#### Smart Test Management
- **Auto-start Timer**: Timer only begins when you type your first character
- **Auto-complete**: Test finishes automatically when all text is typed
- **60-Second Limit**: Tests automatically end after 60 seconds
- **Visual Feedback**: Color-coded characters (green = correct, red = incorrect)
- **Cursor Tracking**: Visual cursor follows your typing position

#### Keyboard Shortcuts
- `Enter` - Start test or restart after completion
- `Tab` - Restart test during active session
- `Space` - Start test (when not active)

#### Test Controls
- **Restart Button**: Restart current test (Tab key)
- **Change Text Type Button**: Return to home screen to select different text type
- **Generator Selector**: Choose between Random Words, Sentences, or Mixed Case

### 📊 Profile & Progress Tracking

#### Personal Statistics
- **Best WPM**: Your highest words-per-minute score
- **Best Accuracy**: Your highest accuracy percentage
- **Total Sessions**: Count of all completed tests
- **Leaderboard Position**: Your rank among all users

#### Progress Visualization
- **Line Charts**: Interactive graphs showing WPM and Accuracy trends
  - Day view: Hourly breakdown
  - Week view: Daily averages
  - Month view: Daily averages over 30 days
- **Activity Heatmap**: GitHub-style contribution graph
  - Shows daily practice activity
  - Color intensity indicates session count
  - Year selector for historical data
  - 53-week grid layout

#### Session History
- **Complete History**: All tests with date, time, WPM, accuracy, and duration
- **Filtering Options**:
  - Today
  - Yesterday
  - Week (last 7 days)
  - Month (last 30 days)
  - Year (last 365 days)
  - All Time
- **Sortable Table**: Click headers to sort by different metrics

#### Shareable Profiles
- Each user has a unique profile URL: `/profile/YourUsername`
- Profiles can be shared with others
- View any user's progress and statistics

### 🏆 Leaderboard Features

#### Global Rankings
- **Top 100 Users**: Ranked by best score
- **Score Comparison**: 
  - Primary: WPM (higher is better)
  - Secondary: Accuracy (higher is better)
  - Tertiary: Time (lower is better)
- **Medal System**: 🥇 Gold, 🥈 Silver, 🥉 Bronze for top 3
- **User Links**: Click any username to view their profile

#### Real-Time Updates
- Leaderboard updates automatically as new scores are submitted
- Best score per user (only your best score counts for ranking)
- Fair comparison system

### 🎨 User Experience Features

#### Responsive Design
- **Desktop**: Full-featured interface with all controls visible
- **Tablet**: Optimized layout with collapsible elements
- **Mobile**: Touch-friendly interface with simplified controls
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

#### Dark Theme
- Modern dark color scheme
- Easy on the eyes for extended use
- Custom color palette:
  - Background: `#323437` (primary), `#2c2e31` (secondary), `#262729` (tertiary)
  - Text: `#d1d0c5` (primary), `#646669` (secondary), `#72757e` (tertiary)
  - Accent: `#e2b714` (gold/yellow)
  - Correct: `#e2b714` (green/gold)
  - Incorrect: `#ca4754` (red)

#### Username Management
- **Persistent Storage**: Username saved in localStorage
- **Auto-remember**: Username persists across sessions
- **Editable**: Change username anytime from profile
- **Validation**: 50 character limit, trimmed whitespace

#### Multi-Page Navigation
- **React Router**: Client-side routing for instant navigation
- **Routes**:
  - `/` - Typing test interface
  - `/leaderboard` - Global rankings
  - `/profile` - Your profile
  - `/profile/:username` - Any user's profile
- **Navigation Bar**: Header with links to all pages

---

## Technology Stack

### Frontend Technologies

#### React 18.2.0
- **Purpose**: UI framework for building interactive interfaces
- **Why React**: 
  - Component-based architecture
  - Efficient re-rendering with virtual DOM
  - Large ecosystem and community
  - Excellent developer experience
- **Key Features Used**:
  - Hooks (useState, useEffect, useRef)
  - Context API (implicit through props)
  - Component composition

#### React Router 7.10.0
- **Purpose**: Client-side routing
- **Why React Router**: 
  - Declarative routing
  - Browser history API integration
  - Nested routes support
  - URL parameter handling

#### Vite 5.0.8
- **Purpose**: Build tool and development server
- **Why Vite**: 
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules
  - Plugin ecosystem
- **Configuration**: See `vite.config.js`

#### Tailwind CSS 3.4.18
- **Purpose**: Utility-first CSS framework
- **Why Tailwind**: 
  - Rapid UI development
  - Consistent design system
  - Small production bundle (unused styles removed)
  - Customizable theme
- **Configuration**: See `tailwind.config.js`

#### Recharts 3.5.1
- **Purpose**: Charting library for progress graphs
- **Why Recharts**: 
  - React-native components
  - Responsive by default
  - Customizable styling
  - Active development

#### React Icons 5.5.0
- **Purpose**: Icon library
- **Icons Used**: 
  - Feather Icons (Fi*)
  - Font Awesome 6 (Fa*)

### Backend Technologies

#### Supabase 2.86.0
- **Purpose**: Backend-as-a-Service (BaaS)
- **Why Supabase**: 
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - RESTful API
  - Free tier available
- **Features Used**:
  - Database storage (leaderboard table)
  - Row Level Security policies
  - REST API for queries

### Build & Compilation

#### Emscripten
- **Purpose**: Compiles C++ to WebAssembly
- **Version**: Latest stable (check with `emcc --version`)
- **Why Emscripten**: 
  - Mature toolchain
  - Excellent C++ support
  - JavaScript interop
  - Active development
- **Output**: 
  - `typing.js` - JavaScript loader (~16KB)
  - `typing.wasm` - WebAssembly binary (~152KB)

#### WebAssembly (WASM)
- **Purpose**: Binary format for running code in browsers
- **Why WebAssembly**: 
  - Near-native performance
  - Language agnostic (C++, Rust, Go, etc.)
  - Secure sandboxed execution
  - Standardized by W3C
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Development Tools

#### Node.js
- **Purpose**: JavaScript runtime
- **Version**: 18+ recommended
- **Package Manager**: npm (comes with Node.js)

#### Git
- **Purpose**: Version control
- **Repository**: Track all changes

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   React UI Layer     │◄────►│  WebAssembly Module   │    │
│  │   (JavaScript)       │Bridge│  (C++ Compiled)       │    │
│  │                      │      │                      │    │
│  │  - TypingTest        │      │  - TextGenerator     │    │
│  │  - LeaderboardPage   │      │  - TypingSession     │    │
│  │  - ProfilePage       │      │  - Timer             │    │
│  │  - Components        │      │  - Bindings          │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           │                              │                   │
│           │                              │                   │
│           └──────────────┬───────────────┘                   │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  Supabase │                             │
│                    │ (Database)│                             │
│                    │           │                             │
│                    │ - Scores  │                             │
│                    │ - Users   │                             │
│                    │ - History │                             │
│                    └───────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.jsx (Router)
│
├── TypingTest.jsx
│   ├── UsernameButton.jsx
│   ├── NameInputModal.jsx
│   └── wasmLoader.js (WASM bridge)
│
├── LeaderboardPage.jsx
│   └── UsernameButton.jsx
│
└── ProfilePage.jsx
    └── UsernameButton.jsx
```

### Data Flow

1. **User Input** → React Component
2. **React Component** → WASM Bridge (`wasmLoader.js`)
3. **WASM Bridge** → WebAssembly Module (C++ code)
4. **C++ Calculation** → Results returned
5. **Results** → React State Update
6. **State Update** → UI Re-render
7. **Score Save** → Supabase Database

---

## Installation & Setup

### Prerequisites

#### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`
   - Includes npm (Node Package Manager)

2. **Emscripten SDK**
   - Download from [emscripten.org](https://emscripten.org/docs/getting_started/downloads.html)
   - Or clone: `git clone https://github.com/emscripten-core/emsdk.git`
   - Install: `./emsdk install latest && ./emsdk activate latest`
   - Verify: `emcc --version`

3. **Git** (optional, for version control)
   - Download from [git-scm.com](https://git-scm.com/)

#### Optional Software

- **VS Code** or your preferred code editor
- **Browser DevTools** for debugging

### Step-by-Step Installation

#### 1. Clone or Download Project

```bash
# If using Git
git clone <repository-url>
cd cpp-react-wasm-typing-tutor

# Or download and extract ZIP file
```

#### 2. Install Emscripten

```bash
# Navigate to emsdk directory
cd ~/emsdk  # or wherever you installed it

# Activate Emscripten
source ./emsdk_env.sh

# Verify installation
emcc --version
# Should output: emcc (Emscripten gcc/clang-like replacement) X.X.X
```

**Note**: You need to run `source ./emsdk_env.sh` in each new terminal session, or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.)

#### 3. Install Node.js Dependencies

```bash
# Navigate to project root
cd /path/to/cpp-react-wasm-typing-tutor

# Install all npm packages
npm install

# This installs:
# - react, react-dom
# - react-router-dom
# - @supabase/supabase-js
# - recharts
# - react-icons
# - vite
# - tailwindcss
# - And all their dependencies
```

#### 4. Build WebAssembly Module

```bash
# Navigate to build directory
cd build

# Clean previous builds (optional)
make clean

# Build C++ to WebAssembly
make

# Output:
# - ../public/typing.js (JavaScript loader)
# - ../public/typing.wasm (WebAssembly binary)
```

**Alternative**: Use the build script

```bash
# From project root
./build/build.sh

# This script:
# 1. Checks for Emscripten
# 2. Cleans old builds
# 3. Compiles C++ to WebAssembly
# 4. Installs npm dependencies
```

#### 5. Configure Supabase (Optional)

If you want leaderboard and profile features:

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create new project

2. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - Anon/Public Key (long string)

3. **Create Environment File**
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env file
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Create Database Table**
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"
   - Copy contents of `supabase-schema.sql`
   - Paste and click "Run"
   - Table `leaderboard` will be created with RLS policies

#### 6. Start Development Server

```bash
# From project root
npm run dev

# Output:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser!

### Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Emscripten installed (`emcc --version`)
- [ ] npm packages installed (`node_modules/` exists)
- [ ] WebAssembly built (`public/typing.js` and `typing.wasm` exist)
- [ ] Development server runs (`npm run dev`)
- [ ] Browser loads app (no console errors)
- [ ] Supabase configured (if using leaderboard)

---

## Project Structure

### Complete Directory Tree

```
cpp-react-wasm-typing-tutor/
│
├── cpp/                          # C++ Source Files
│   ├── bindings.cpp             # C++ to JavaScript bridge
│   ├── TextGenerator.cpp        # Abstract base class
│   ├── RandomWordGenerator.cpp  # Random word generator
│   ├── SentenceGenerator.cpp    # Sentence generator
│   ├── MixedCaseGenerator.cpp  # Mixed case generator
│   ├── TypingSession.cpp       # Typing accuracy tracking
│   └── Timer.cpp                # High-precision timer
│
├── build/                        # Build Scripts
│   ├── Makefile                 # Emscripten build configuration
│   └── build.sh                 # Automated build script
│
├── src/                          # React Source Files
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Router configuration
│   ├── wasmLoader.js            # WebAssembly loader & bridge
│   ├── index.css                # Global styles
│   │
│   ├── pages/                   # Page Components
│   │   ├── TypingTest.jsx       # Main typing interface
│   │   ├── LeaderboardPage.jsx  # Global leaderboard
│   │   └── ProfilePage.jsx      # User profile with graphs
│   │
│   ├── components/              # Reusable Components
│   │   ├── UsernameButton.jsx   # Username display & navigation
│   │   ├── NameInputModal.jsx   # Results & username input modal
│   │   ├── Leaderboard.jsx      # Leaderboard component (legacy)
│   │   └── Profile.jsx          # Profile component (legacy)
│   │
│   └── lib/                     # Utility Libraries
│       └── supabase.js         # Supabase client configuration
│
├── public/                       # Static Assets
│   ├── favicon.png              # Site favicon
│   ├── typing.js                # Compiled WASM JS (generated)
│   └── typing.wasm              # Compiled WASM binary (generated)
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore patterns
├── index.html                   # HTML entry point
├── package.json                 # Node.js dependencies
├── package-lock.json            # Locked dependency versions
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── vercel.json                  # Vercel deployment config
├── supabase-schema.sql          # Database schema
├── README.md                    # This file
├── ARCHITECTURE.md              # Detailed architecture docs
└── QUICKSTART.md                # Quick start guide
```

### File Descriptions

#### C++ Files (`cpp/`)

| File | Lines | Purpose | Key Classes/Functions |
|------|-------|---------|----------------------|
| `bindings.cpp` | 112 | C++ to JavaScript bridge | `generateText()`, `startSession()`, `updateInput()`, etc. |
| `TextGenerator.cpp` | 16 | Abstract base class | `TextGenerator` (virtual) |
| `RandomWordGenerator.cpp` | 77 | Random word generation | `RandomWordGenerator` |
| `SentenceGenerator.cpp` | 74 | Sentence generation | `SentenceGenerator` |
| `MixedCaseGenerator.cpp` | 97 | Mixed case generation | `MixedCaseGenerator` |
| `TypingSession.cpp` | 72 | Typing tracking | `TypingSession` |
| `Timer.cpp` | 44 | Time measurement | `Timer` |

#### React Files (`src/`)

| File | Lines | Purpose | Key Features |
|------|-------|---------|-------------|
| `main.jsx` | 14 | App entry | React root, router setup |
| `App.jsx` | 24 | Router | Route definitions |
| `wasmLoader.js` | 59 | WASM bridge | Load module, wrap functions |
| `pages/TypingTest.jsx` | 776 | Main interface | Typing test, real-time stats |
| `pages/LeaderboardPage.jsx` | 188 | Leaderboard | Top 100 rankings |
| `pages/ProfilePage.jsx` | 816 | User profile | Graphs, heatmap, history |
| `components/UsernameButton.jsx` | 54 | Username display | Navigation, localStorage |
| `components/NameInputModal.jsx` | 163 | Results modal | Score display, username input |

#### Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `package.json` | Dependencies | React, Vite, Supabase, etc. |
| `vite.config.js` | Build config | React plugin, server settings |
| `tailwind.config.js` | CSS theme | Colors, fonts, animations |
| `vercel.json` | Deployment | SPA routing rewrite |
| `supabase-schema.sql` | Database | Table schema, RLS policies |

---

## How It Works

### Complete User Journey

#### 1. Application Load

```
Browser loads index.html
    │
    ▼
React app initializes (main.jsx)
    │
    ├─> Router setup (App.jsx)
    │   └─> Defines routes: /, /leaderboard, /profile
    │
    └─> WASM module loads (wasmLoader.js)
        │
        ├─> Loads /typing.js (Emscripten loader)
        ├─> Downloads /typing.wasm (WebAssembly binary)
        ├─> Initializes WebAssembly module
        └─> Creates JavaScript function wrappers
```

#### 2. Starting a Test

```
User clicks "Start Test" or presses Enter
    │
    ▼
TypingTest.jsx: startTest()
    │
    ├─> wasm.setGeneratorType(RANDOM_WORDS)
    │   └─> C++: Creates RandomWordGenerator instance
    │
    ├─> wasm.generateText(25)
    │   │
    │   ├─> JavaScript: wasmLoader.js
    │   │   └─> Calls C++ function via cwrap
    │   │
    │   └─> C++: RandomWordGenerator::generateText(25)
    │       ├─> Selects 25 random words
    │       ├─> Joins with spaces
    │       └─> Returns: "apple green river monkey..."
    │
    └─> setTargetText("apple green river...")
        └─> React: Renders text on screen
```

#### 3. Typing Process

```
User types first character: "a"
    │
    ▼
TypingTest.jsx: handleInputChange("a")
    │
    ├─> if (!hasStartedTyping) {
    │   │   wasm.startSession(targetText)
    │   │   │
    │   │   ├─> C++: TypingSession::startSession(text)
    │   │   │   └─> Stores target text
    │   │   │
    │   │   └─> C++: Timer::start()
    │   │       └─> Records start time
    │   │
    │   └─> setHasStartedTyping(true)
    │
    ├─> wasm.updateInput("a")
    │   │
    │   └─> C++: TypingSession::updateInput("a")
    │       ├─> Compares "a" with target[0]
    │       ├─> correctChars = 1 (match)
    │       └─> totalChars = 1
    │
    ├─> wasm.getAccuracy()
    │   └─> C++: Returns 100.0 (1/1 * 100)
    │
    └─> setAccuracy(100)
        └─> React: Updates UI
```

#### 4. Real-Time Updates

```
setInterval (every 100ms)
    │
    ├─> wasm.getElapsedSeconds()
    │   └─> C++: Timer::elapsedSeconds()
    │       └─> Returns: 2.5 seconds
    │
    ├─> wasm.getWPM(2.5)
    │   └─> C++: TypingSession::wpm(2.5)
    │       ├─> correctChars = 15
    │       ├─> minutes = 2.5 / 60 = 0.0417
    │       ├─> wpm = (15 / 5) / 0.0417 = 72
    │       └─> Returns: 72
    │
    └─> setWpm(72), setTimer(2.5)
        └─> React: Updates display
```

#### 5. Completing Test

```
User finishes typing OR 60 seconds pass
    │
    ▼
TypingTest.jsx: finishTest()
    │
    ├─> Calculate final stats
    │   ├─> finalWpm = wasm.getWPM(elapsed)
    │   ├─> finalAccuracy = wasm.getAccuracy()
    │   └─> finalTime = wasm.getElapsedSeconds()
    │
    ├─> Save to Supabase (if username set)
    │   │
    │   └─> supabase.from('leaderboard').insert([{
    │       username: "John",
    │       wpm: 72,
    │       accuracy: 96.5,
    │       time: 45.2
    │   }])
    │
    └─> setShowNameModal(true)
        └─> React: Shows results modal
```

### Memory Management Flow

#### C++ Memory Allocation

```cpp
// In bindings.cpp
char* generateText(int wordCount) {
    std::string text = textGen->generateText(wordCount);
    
    // Allocate memory on heap (must be freed by JavaScript)
    char* result = (char*)malloc(text.length() + 1);
    strcpy(result, text.c_str());
    
    return result;  // JavaScript receives pointer
}
```

#### JavaScript Memory Management

```javascript
// In wasmLoader.js
const generateText = (wordCount) => {
    // 1. Call C++ function (returns pointer)
    const ptr = generateTextPtr(wordCount);
    
    // 2. Convert pointer to JavaScript string
    const str = wasmModule.UTF8ToString(ptr);
    
    // 3. CRITICAL: Free C++ memory immediately
    wasmModule._free(ptr);
    
    // 4. Return JavaScript string (garbage collected)
    return str;
};
```

**Why This Matters**:
- C++ memory is NOT garbage collected
- Must manually free allocated memory
- Memory leaks occur if not freed
- Best practice: Convert and free immediately

---

## Core Components

### C++ Components

#### 1. TextGenerator (Abstract Base Class)

**Purpose**: Polymorphic interface for text generation

**Design Pattern**: Strategy Pattern + Inheritance

```cpp
class TextGenerator {
public:
    virtual string generateText(int count) = 0;
    virtual ~TextGenerator() {}
};
```

**Implementations**:
- `RandomWordGenerator`: Random words (5-6 letters)
- `SentenceGenerator`: Complete sentences
- `MixedCaseGenerator`: Words with random capitalization

**Benefits**:
- Easy to add new generator types
- Polymorphic behavior
- Clean separation of concerns

#### 2. TypingSession

**Purpose**: Tracks typing accuracy and calculates statistics

**Key Data**:
- `targetText`: What user should type
- `userInput`: What user actually typed
- `correctChars`: Count of correct characters
- `totalChars`: Total characters typed

**Key Methods**:

```cpp
void updateInput(string typed) {
    userInput = typed;
    totalChars = typed.length();
    correctChars = 0;
    
    // Character-by-character comparison
    int minLength = min(targetText.length(), typed.length());
    for (int i = 0; i < minLength; i++) {
        if (targetText[i] == typed[i]) {
            correctChars++;
        }
    }
}

double accuracy() {
    if (totalChars == 0) return 100.0;
    return (correctChars / totalChars) * 100.0;
}

int wpm(double secondsElapsed) {
    if (secondsElapsed <= 0) return 0;
    double wordSize = 5.0;  // Standard: 5 chars per word
    double minutes = secondsElapsed / 60.0;
    double wpmValue = (correctChars / wordSize) / minutes;
    return static_cast<int>(round(wpmValue));
}
```

**Algorithm**:
1. Compare character-by-character
2. Count matches
3. Calculate percentage
4. Use standard WPM formula: `(chars / 5) / minutes`

#### 3. Timer

**Purpose**: High-precision time measurement

**Implementation**:

```cpp
void start() {
    startTime = clock();  // High-precision clock
    isRunning = true;
}

double elapsedSeconds() {
    if (isRunning) {
        clock_t current = clock();
        return static_cast<double>(current - startTime) / CLOCKS_PER_SEC;
    }
    return 0.0;
}
```

**Precision**: Uses `std::clock()` for millisecond precision

#### 4. Bindings (C++ Bridge)

**Purpose**: Expose C++ functions to JavaScript

**Key Functions**:

| Function | C++ Implementation | Returns | Purpose |
|----------|-------------------|---------|---------|
| `setGeneratorType(int)` | Creates generator instance | `void` | Switch text type |
| `generateText(int)` | `TextGenerator::generateText()` | `char*` | Generate text |
| `startSession(char*)` | `TypingSession::startSession()` + `Timer::start()` | `void` | Start test |
| `updateInput(char*)` | `TypingSession::updateInput()` | `void` | Update input |
| `getAccuracy()` | `TypingSession::accuracy()` | `double` | Get accuracy % |
| `getWPM(double)` | `TypingSession::wpm()` | `int` | Get WPM |
| `resetSession()` | Reset all state | `void` | Reset test |
| `getElapsedSeconds()` | `Timer::elapsedSeconds()` | `double` | Get time |

**Memory Management**:
- `generateText()` allocates with `malloc()` - must be freed
- Other functions use stack allocation or no return

### React Components

#### 1. TypingTest.jsx

**Purpose**: Main typing interface

**State Management**:

```javascript
const [wasm, setWasm] = useState(null);              // WASM functions
const [targetText, setTargetText] = useState('');    // Text to type
const [userInput, setUserInput] = useState('');       // User input
const [isTestActive, setIsTestActive] = useState(false);
const [hasStartedTyping, setHasStartedTyping] = useState(false);
const [timer, setTimer] = useState(0);                // Elapsed time
const [accuracy, setAccuracy] = useState(100);        // Accuracy %
const [wpm, setWpm] = useState(0);                   // Words per minute
const [generatorType, setGeneratorType] = useState(RANDOM_WORDS);
```

**Key Functions**:

- `startTest()`: Initialize test, generate text
- `handleInputChange()`: Process user input, update stats
- `finishTest()`: Calculate final stats, save to database
- `restartTest()`: Reset and start new test
- `goToHomeScreen()`: Return to text type selection

**Real-Time Updates**:

```javascript
useEffect(() => {
    if (isTestActive && hasStartedTyping && !isTestComplete) {
        intervalRef.current = setInterval(() => {
            const elapsed = wasm.getElapsedSeconds();
            setTimer(elapsed);
            const currentWpm = wasm.getWPM(elapsed);
            setWpm(currentWpm);
            
            if (elapsed >= 60) {
                finishTest();
            }
        }, 100);  // Update every 100ms
    }
    
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
}, [isTestActive, hasStartedTyping, isTestComplete, wasm]);
```

#### 2. ProfilePage.jsx

**Purpose**: User statistics and progress visualization

**Features**:
- **Stats Summary**: Best WPM, accuracy, total sessions
- **Progress Graph**: Line chart with Recharts
- **Activity Heatmap**: GitHub-style contribution graph
- **Session History**: Filterable table

**Graph Data Processing**:

```javascript
const getGraphData = () => {
    const filtered = getFilteredSessions();
    const dataByDate = {};
    
    // Group sessions by date
    filtered.forEach(session => {
        const dateKey = new Date(session.created_at).toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
            dataByDate[dateKey] = { wpm: [], accuracy: [] };
        }
        dataByDate[dateKey].wpm.push(session.wpm);
        dataByDate[dateKey].accuracy.push(session.accuracy);
    });
    
    // Calculate daily averages
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        if (dataByDate[dateKey]) {
            const avgWpm = dataByDate[dateKey].wpm.reduce((a, b) => a + b, 0) / dataByDate[dateKey].wpm.length;
            const avgAcc = dataByDate[dateKey].accuracy.reduce((a, b) => a + b, 0) / dataByDate[dateKey].accuracy.length;
            chartData.push({ date: dateKey, wpm: Math.round(avgWpm), accuracy: parseFloat(avgAcc.toFixed(1)) });
        }
    }
    
    return chartData;
};
```

#### 3. LeaderboardPage.jsx

**Purpose**: Global rankings

**Score Comparison Logic**:

```javascript
const isBetterScore = (newScore, existingScore) => {
    // Primary: WPM (higher is better)
    if (newScore.wpm > existingScore.wpm) return true;
    if (newScore.wpm < existingScore.wpm) return false;
    
    // Secondary: Accuracy (higher is better)
    if (newScore.accuracy > existingScore.accuracy) return true;
    if (newScore.accuracy < existingScore.accuracy) return false;
    
    // Tertiary: Time (lower is better)
    return newScore.time < existingScore.time;
};

// Group by username, keep best score
const userMap = new Map();
data.forEach(entry => {
    const existing = userMap.get(entry.username);
    if (!existing || isBetterScore(entry, existing)) {
        userMap.set(entry.username, entry);
    }
});

// Sort and get top 100
const topUsers = Array.from(userMap.values())
    .sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.time - b.time;
    })
    .slice(0, 100);
```

---

## User Interface

### Design System

#### Color Palette

```javascript
// From tailwind.config.js
colors: {
  bg: {
    primary: '#323437',    // Main background
    secondary: '#2c2e31',  // Card backgrounds
    tertiary: '#262729',   // Hover states
  },
  text: {
    primary: '#d1d0c5',    // Main text
    secondary: '#646669',  // Secondary text
    tertiary: '#72757e',  // Muted text
  },
  accent: '#e2b714',       // Gold/yellow accent
  correct: '#e2b714',      // Correct characters
  incorrect: '#ca4754',    // Incorrect characters
}
```

#### Typography

- **Font Family**: JetBrains Mono, Fira Code, Courier New, monospace
- **Font Sizes**: Responsive (text-sm to text-3xl)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

#### Animations

```javascript
animations: {
  'fade-in': 'fadeIn 0.4s ease-in',
  'slide-down': 'slideDown 0.3s ease-out',
  'fade-in-up': 'fadeInUp 0.4s ease-out',
  'blink': 'blink 1s infinite',
  'correct-pulse': 'correctPulse 0.3s ease-out',
  'incorrect-shake': 'incorrectShake 0.4s ease-out',
}
```

### Responsive Breakpoints

- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md, lg)
- **Desktop**: `> 1024px` (xl, 2xl)

### Component Layouts

#### TypingTest Page

```
┌─────────────────────────────────────────┐
│  Header (Username | Logo | Leaderboard) │
├─────────────────────────────────────────┤
│  Stats Bar (Time | WPM | Accuracy)      │
├─────────────────────────────────────────┤
│  Generator Selector (Words/Sentences/   │
│  Mixed Case)                             │
├─────────────────────────────────────────┤
│  Language Label                          │
├─────────────────────────────────────────┤
│  Text Display Area                      │
│  (Target text with color coding)        │
├─────────────────────────────────────────┤
│  Controls (Start/Restart/Change Type)   │
├─────────────────────────────────────────┤
│  Footer (Keyboard shortcuts)            │
└─────────────────────────────────────────┘
```

#### Profile Page

```
┌─────────────────────────────────────────┐
│  Header (Back | Logo | Leaderboard)     │
├─────────────────────────────────────────┤
│  Profile Header (Username | Rank)       │
├─────────────────────────────────────────┤
│  Stats Cards (Best WPM | Accuracy |     │
│  Total Sessions)                         │
├─────────────────────────────────────────┤
│  Progress Graph (WPM & Accuracy over    │
│  time)                                   │
├─────────────────────────────────────────┤
│  Activity Heatmap (GitHub-style)        │
├─────────────────────────────────────────┤
│  Session History Table (Filterable)     │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Complete Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Types "a"
       ▼
┌─────────────────┐
│  TypingTest.jsx │
│  handleInputChange() │
└──────┬──────────┘
       │ wasm.updateInput("a")
       ▼
┌─────────────────┐
│  wasmLoader.js  │
│  updateInput()  │
└──────┬──────────┘
       │ cwrap("updateInput", ...)
       ▼
┌─────────────────┐
│  typing.js      │
│  (Emscripten)   │
└──────┬──────────┘
       │ WebAssembly Call
       ▼
┌─────────────────┐
│  bindings.cpp   │
│  updateInput()  │
└──────┬──────────┘
       │ TypingSession::updateInput()
       ▼
┌─────────────────┐
│ TypingSession   │
│ - Compares chars│
│ - Updates stats │
└──────┬──────────┘
       │ Return (void)
       ▼
┌─────────────────┐
│  wasmLoader.js  │
│  (no return)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  TypingTest.jsx │
│  wasm.getAccuracy() │
└──────┬──────────┘
       │
       ▼ (same path back)
┌─────────────────┐
│ TypingSession   │
│ accuracy()      │
│ Returns: 100.0  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  TypingTest.jsx │
│  setAccuracy(100) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  React Render   │
│  UI Updates     │
└─────────────────┘
```

### Database Flow

```
User completes test
    │
    ▼
TypingTest.jsx: finishTest()
    │
    ├─> Calculate final stats
    │   ├─> finalWpm = 72
    │   ├─> finalAccuracy = 96.5
    │   └─> finalTime = 45.2
    │
    └─> Save to Supabase
        │
        ├─> Check if username exists
        │   └─> localStorage.getItem('typingTutor_username')
        │
        ├─> Check if score is better
        │   └─> Query existing scores
        │       └─> Compare with best score
        │
        └─> Insert into database
            │
            └─> supabase.from('leaderboard').insert([{
                username: "John",
                wpm: 72,
                accuracy: 96.5,
                time: 45.2,
                created_at: "2024-12-13T16:30:00Z"
            }])
                │
                ▼
            Supabase Database
                │
                ├─> Row Level Security check
                ├─> Insert into leaderboard table
                └─> Return success/error
```

---

## Performance Optimizations

### C++ Optimizations

1. **Character-by-Character Comparison**
   - Uses `std::min()` to avoid out-of-bounds
   - Single pass through strings
   - O(n) time complexity

2. **Efficient String Building**
   - Uses `std::ostringstream` for concatenation
   - Avoids multiple string copies
   - Pre-allocates capacity when possible

3. **Memory Management**
   - Stack allocation for temporary strings
   - Heap allocation only for returns to JavaScript
   - Immediate freeing in JavaScript

### React Optimizations

1. **State Updates**
   - Batched updates where possible
   - Minimal re-renders
   - useRef for non-reactive values

2. **Real-Time Updates**
   - 100ms interval (balance of responsiveness and performance)
   - Cleans up intervals properly
   - Conditional updates (only when active)

3. **Component Optimization**
   - Memoization where beneficial
   - Conditional rendering
   - Lazy loading (future improvement)

### WebAssembly Optimizations

1. **Compilation Flags**
   - `-O2`: Optimized for size and speed
   - `MODULARIZE=1`: Module pattern
   - `ALLOW_MEMORY_GROWTH=1`: Dynamic memory

2. **Function Wrapping**
   - `cwrap()` for efficient calls
   - Type conversions handled by Emscripten
   - Minimal overhead

### Database Optimizations

1. **Indexing**
   - Index on `username` for fast lookups
   - Index on `wpm DESC` for sorting
   - Composite indexes (future improvement)

2. **Query Optimization**
   - Only fetch needed columns
   - Order by indexed columns
   - Limit results (top 100)

3. **Caching**
   - Client-side caching of user data
   - localStorage for username
   - React state for session data

---

## Development Workflow

### Daily Development

1. **Make Changes**
   ```bash
   # Edit C++ files
   vim cpp/RandomWordGenerator.cpp
   
   # Edit React files
   vim src/pages/TypingTest.jsx
   ```

2. **Rebuild if C++ Changed**
   ```bash
   cd build
   make
   cd ..
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

4. **Test in Browser**
   - Open http://localhost:5173
   - Hot reload for React changes
   - Refresh for WASM changes

### Debugging

#### C++ Debugging

```bash
# Compile with debug symbols
emcc -g -O0 cpp/bindings.cpp -o public/typing.js

# Use browser DevTools
# - Sources tab → typing.wasm
# - Set breakpoints
# - Step through code
```

#### React Debugging

```javascript
// Use React DevTools browser extension
// - Component tree
// - Props/state inspection
// - Performance profiling

// Console logging
console.log('WASM:', wasm);
console.log('State:', { wpm, accuracy, timer });
```

#### WebAssembly Debugging

```javascript
// In browser console
Module._generateText(25);  // Direct WASM call
Module.UTF8ToString(ptr);  // Convert pointer
```

### Testing Strategy

#### Manual Testing Checklist

- [ ] Start test works
- [ ] Timer starts on first keystroke
- [ ] Accuracy updates correctly
- [ ] WPM calculates correctly
- [ ] Test finishes on completion
- [ ] Test finishes after 60 seconds
- [ ] Restart works
- [ ] Change text type works
- [ ] Scores save to database
- [ ] Leaderboard displays correctly
- [ ] Profile graphs render
- [ ] Mobile responsive

#### Performance Testing

```javascript
// Measure WASM call performance
console.time('generateText');
const text = wasm.generateText(25);
console.timeEnd('generateText');

// Measure render performance
// Use React DevTools Profiler
```

---

## Building & Deployment

### Development Build

```bash
# 1. Build WebAssembly
cd build
make
cd ..

# 2. Start dev server
npm run dev
```

### Production Build

```bash
# 1. Build WebAssembly (optimized)
cd build
make clean
make
cd ..

# 2. Build React app
npm run build

# Output: dist/ folder
```

### Deployment Options

#### Vercel (Recommended)

1. **Connect Repository**
   - Push to GitHub
   - Import in Vercel
   - Connect repository

2. **Configure Environment Variables**
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```

3. **Build Settings**
   - Build Command: `cd build && make && cd .. && npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel auto-deploys on push
   - Or manually trigger deployment

#### Netlify

1. **Connect Repository**
2. **Build Settings**:
   - Build command: `cd build && make && cd .. && npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Same as Vercel
4. **Deploy**

#### GitHub Pages

1. **Build locally**
2. **Push dist/ to gh-pages branch**
3. **Enable GitHub Pages in repo settings**

### Build Optimization

#### WebAssembly

```makefile
# In Makefile, use -O3 for maximum optimization
EMCC_FLAGS = -O3 \
    -s EXPORTED_FUNCTIONS='[...]' \
    ...
```

#### React

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
      },
    },
  },
});
```

---

## Configuration

### Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Vite Configuration

`vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']  // Allow serving files from parent directory
    }
  },
  optimizeDeps: {
    exclude: ['../typing.js']  // Don't optimize WASM loader
  },
  build: {
    commonjsOptions: {
      include: [/typing\.js$/, /node_modules/],
      transformMixedEsModules: true
    }
  }
});
```

### Tailwind Configuration

`tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { /* custom colors */ },
      fontFamily: { /* custom fonts */ },
      animations: { /* custom animations */ },
    },
  },
  plugins: [],
}
```

---

## Troubleshooting

### Common Issues

#### 1. Emscripten Not Found

**Error**: `emcc: command not found`

**Solution**:
```bash
# Activate Emscripten
source ~/emsdk/emsdk_env.sh

# Or add to ~/.bashrc or ~/.zshrc
echo 'source ~/emsdk/emsdk_env.sh' >> ~/.bashrc
```

#### 2. WebAssembly Not Loading

**Error**: `Failed to load C++ WebAssembly module`

**Solutions**:
- Check `public/typing.js` and `typing.wasm` exist
- Check browser console for errors
- Verify file paths in `wasmLoader.js`
- Check CORS if serving from different domain

#### 3. Memory Errors

**Error**: `Cannot enlarge memory arrays`

**Solution**:
- Already handled with `ALLOW_MEMORY_GROWTH=1`
- If persists, increase `INITIAL_MEMORY` in Makefile

#### 4. Supabase Connection Issues

**Error**: `Leaderboard is not configured`

**Solutions**:
- Check `.env` file exists
- Verify environment variables are set
- Check Supabase project is active
- Verify table exists in database

#### 5. Build Failures

**Error**: `make: *** [target] Error 1`

**Solutions**:
- Check Emscripten is activated
- Verify C++ syntax is correct
- Check file paths in Makefile
- Clean and rebuild: `make clean && make`

### Debugging Tips

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network tab for failed requests
   - Inspect WebAssembly module loading

2. **Check React DevTools**
   - Component tree
   - State values
   - Props flow

3. **Check Network Tab**
   - Verify `typing.js` and `typing.wasm` load
   - Check Supabase API calls
   - Look for 404 errors

4. **Use Console Logging**
   ```javascript
   console.log('WASM:', wasm);
   console.log('State:', { wpm, accuracy });
   ```

---

## Learning Resources

### WebAssembly

- [WebAssembly.org](https://webassembly.org/) - Official site
- [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly) - Comprehensive guide
- [WebAssembly by Example](https://wasmbyexample.dev/) - Code examples

### Emscripten

- [Emscripten Documentation](https://emscripten.org/docs/) - Official docs
- [Emscripten Tutorial](https://emscripten.org/docs/getting_started/Tutorial.html) - Getting started
- [Emscripten API Reference](https://emscripten.org/docs/api_reference/index.html) - API docs

### React

- [React Documentation](https://react.dev/) - Official docs
- [React Router](https://reactrouter.com/) - Routing library
- [React Hooks](https://react.dev/reference/react) - Hooks reference

### C++

- [cppreference.com](https://en.cppreference.com/) - C++ reference
- [Learn C++](https://www.learncpp.com/) - Tutorial site
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) - Best practices

### Supabase

- [Supabase Documentation](https://supabase.com/docs) - Official docs
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction) - JS client

---

## Contributing

### How to Contribute

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**
4. **Test Thoroughly**
5. **Commit Changes**: `git commit -m 'Add amazing feature'`
6. **Push to Branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Code Style

- **C++**: Follow Google C++ Style Guide
- **JavaScript**: Use ESLint/Prettier
- **Comments**: Keep code self-documenting, minimal comments

### Testing

- Test all features before submitting
- Test on multiple browsers
- Test responsive design

---

## License

This project is for educational purposes. Feel free to use, modify, and learn from it!

---

## Acknowledgments

- **Emscripten Team** - For the amazing C++ to WebAssembly compiler
- **React Team** - For the excellent UI framework
- **Supabase Team** - For the backend-as-a-service platform
- **Tailwind CSS Team** - For the utility-first CSS framework

---

## Contact & Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Happy Typing! 🚀**

*Last Updated: December 2024*
