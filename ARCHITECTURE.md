# Architecture Documentation

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [System Architecture](#system-architecture)
3. [The C++ Side (Business Logic)](#the-c-side-business-logic)
4. [The JavaScript/React Side (UI)](#the-javascriptreact-side-ui)
5. [The Bridge (C++ ↔ JavaScript)](#the-bridge-c--javascript)
6. [Build Process](#build-process)
7. [Complete Data Flow](#complete-data-flow)
8. [File-by-File Breakdown](#file-by-file-breakdown)
9. [Why This Architecture?](#why-this-architecture)
10. [Memory Management](#memory-management)
11. [Deployment Flow](#deployment-flow)

---

## High-Level Overview

This typing tutor application is a **hybrid web application** that combines:
- **C++** for high-performance business logic (compiled to WebAssembly)
- **React** for the user interface and interactions
- **Supabase** for data persistence (leaderboard and user profiles)

The core innovation is using **WebAssembly (WASM)** to run C++ code directly in the browser, achieving near-native performance for typing calculations while maintaining the flexibility of a web application.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │   React UI       │◄────────►│  WebAssembly     │      │
│  │   (JavaScript)   │  Bridge │  (C++ compiled)  │      │
│  │                  │          │                  │      │
│  │ - TypingTest     │          │ - WordGenerator  │      │
│  │ - Leaderboard    │          │ - TypingSession  │      │
│  │ - Profile        │          │ - Timer          │      │
│  └──────────────────┘         └──────────────────┘      │
│         │                              │                  │
│         │                              │                  │
│         └──────────────┬──────────────┘                 │
│                        │                                  │
│                  ┌─────▼─────┐                            │
│                  │  Supabase │                            │
│                  │ (Database)│                            │
│                  │           │                            │
│                  │ - Scores  │                            │
│                  │ - Users   │                            │
│                  │ - History │                            │
│                  └───────────┘                            │
└─────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend (React)**: Handles all user interactions, UI rendering, and state management
2. **WebAssembly Module**: Contains compiled C++ code for typing logic
3. **Bridge Layer**: Connects JavaScript and C++ through Emscripten bindings
4. **Backend (Supabase)**: Stores user scores, profiles, and leaderboard data

---

## The C++ Side (Business Logic)

### Purpose
All core typing calculations run in C++ compiled to WebAssembly. This includes:
- Text generation
- Accuracy calculation
- WPM (Words Per Minute) calculation
- Time tracking

### Directory: `cpp/`

#### 1. WordGenerator (`WordGenerator.h` / `WordGenerator.cpp`)

**Purpose**: Generates random text for typing tests

**What it does**:
- Maintains a hardcoded list of common English words (~100 words)
- Randomly selects words to create sentences
- Returns a string of words separated by spaces

**Key Methods**:
```cpp
WordGenerator()                    // Constructor - initializes word list
std::string generateText(int count) // Generates random text with 'count' words
```

**Example**:
```cpp
WordGenerator gen;
std::string text = gen.generateText(25);
// Returns: "apple green river monkey blue fast car laptop computer..."
```

**Implementation Details**:
- Uses `std::random_device` and `std::mt19937` for random number generation
- Uses `std::uniform_int_distribution` to randomly select words
- Builds result using `std::ostringstream` for efficient string concatenation

#### 2. TypingSession (`TypingSession.h` / `TypingSession.cpp`)

**Purpose**: Tracks typing accuracy and calculates statistics

**What it stores**:
- `targetText`: The text the user should type
- `userInput`: What the user has actually typed
- `correctChars`: Number of correctly typed characters
- `totalChars`: Total number of characters typed

**Key Methods**:
```cpp
void startSession(std::string text)  // Initialize with target text
void updateInput(std::string typed) // Update user input and recalculate
double accuracy()                    // Returns accuracy percentage
int wpm(double seconds)             // Returns words per minute
void reset()                         // Reset all values
```

**Accuracy Calculation**:
```cpp
accuracy = (correctChars / totalChars) * 100.0
```

**WPM Calculation**:
```cpp
// Standard WPM formula: (characters / 5) / minutes
wpm = (correctChars / 5.0) / (seconds / 60.0)
```

**Implementation Details**:
- Character-by-character comparison using `std::min()` to handle different lengths
- Uses `static_cast<double>()` for precise floating-point calculations
- Returns 100% accuracy if no characters typed yet (prevents division by zero)

#### 3. Timer (`Timer.h` / `Timer.cpp`)

**Purpose**: Measures elapsed time during typing sessions

**What it stores**:
- `startTime`: When the timer started (using `std::clock_t`)
- `endTime`: When the timer stopped
- `isRunning`: Whether the timer is currently active

**Key Methods**:
```cpp
void start()              // Start the timer
void stop()               // Stop the timer
double elapsedSeconds()   // Get elapsed time in seconds
```

**Implementation Details**:
- Uses `std::clock()` for high-precision timing
- Calculates elapsed time: `(endTime - startTime) / CLOCKS_PER_SEC`
- Returns 0.0 if timer hasn't started

#### 4. Bindings (`bindings.cpp`) - The C++ Bridge

**Purpose**: Exposes C++ functions to JavaScript through Emscripten

**How it works**:
- Uses `EMSCRIPTEN_KEEPALIVE` macro to mark functions as callable from JavaScript
- Wraps C++ class methods in C-style functions
- Manages global instances of classes (singleton pattern)
- Handles memory management for string returns

**Exposed Functions**:

| Function | C++ Implementation | Returns | Purpose |
|----------|-------------------|---------|---------|
| `generateText(int)` | `WordGenerator::generateText()` | `char*` | Generate random text |
| `startSession(char*)` | `TypingSession::startSession()` + `Timer::start()` | `void` | Start typing session |
| `updateInput(char*)` | `TypingSession::updateInput()` | `void` | Update user input |
| `getAccuracy()` | `TypingSession::accuracy()` | `double` | Get accuracy % |
| `getWPM(double)` | `TypingSession::wpm()` | `int` | Get words per minute |
| `resetSession()` | `TypingSession::reset()` + `Timer::stop()` | `void` | Reset everything |
| `getElapsedSeconds()` | `Timer::elapsedSeconds()` | `double` | Get elapsed time |

**Memory Management**:
- `generateText()` allocates memory with `malloc()` - JavaScript must free it
- Other functions use stack-allocated strings or don't return strings

**Example**:
```cpp
EMSCRIPTEN_KEEPALIVE
char* generateText(int wordCount) {
    if (!wordGen) {
        wordGen = new WordGenerator();  // Lazy initialization
    }
    std::string text = wordGen->generateText(wordCount);
    char* result = (char*)malloc(text.length() + 1);
    strcpy(result, text.c_str());
    return result;  // JavaScript must free this!
}
```

---

## The JavaScript/React Side (UI)

### Purpose
Handles all user interface, user interactions, state management, and data display.

### Directory: `src/`

#### 1. `main.jsx` - Application Entry Point

**Purpose**: Initializes the React application

**What it does**:
```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

- Creates React root and renders the app
- Wraps app in `BrowserRouter` for client-side routing
- Loads global CSS styles

#### 2. `App.jsx` - Router Configuration

**Purpose**: Defines all application routes

**Routes**:
- `/` → `TypingTest` component (main typing interface)
- `/leaderboard` → `LeaderboardPage` component (global rankings)
- `/profile` → `ProfilePage` component (user's own profile)
- `/profile/:username` → `ProfilePage` component (any user's profile)

**Implementation**:
```javascript
<Routes>
  <Route path="/" element={<TypingTest />} />
  <Route path="/leaderboard" element={<LeaderboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/profile/:username" element={<ProfilePage />} />
</Routes>
```

#### 3. `wasmLoader.js` - The JavaScript Bridge

**Purpose**: Loads WebAssembly module and creates JavaScript wrappers for C++ functions

**How it works**:

1. **Load Emscripten Module**:
   ```javascript
   // Loads /typing.js (Emscripten-generated loader)
   script.src = '/typing.js';
   script.onload = () => {
     window.Module({ locateFile: (path) => '/typing.wasm' })
   }
   ```

2. **Create Function Wrappers**:
   ```javascript
   // Uses Emscripten's cwrap to create JS functions
   wasmModule.cwrap("generateText", "number", ["number"])
   //                    ↑            ↑         ↑
   //              C++ function   return   parameters
   //                            type     types
   ```

3. **Handle Memory Management**:
   ```javascript
   const generateText = (wordCount) => {
     const ptr = generateTextPtr(wordCount);  // Get pointer
     const str = wasmModule.UTF8ToString(ptr);  // Convert to string
     wasmModule._free(ptr);  // Free C++ memory!
     return str;
   };
   ```

**Returned Object**:
```javascript
{
  generateText: (count) => string,
  startSession: (text) => void,
  updateInput: (text) => void,
  getAccuracy: () => number,
  getWPM: (seconds) => number,
  resetSession: () => void,
  getElapsedSeconds: () => number
}
```

#### 4. `pages/TypingTest.jsx` - Main Typing Interface

**Purpose**: The primary typing test interface

**State Management**:
- `wasm`: WebAssembly functions object
- `targetText`: Text to type (from C++)
- `userInput`: What user has typed
- `isTestActive`: Whether test is running
- `hasStartedTyping`: Whether user has started (timer starts here)
- `timer`, `wpm`, `accuracy`: Real-time statistics
- `showNameModal`: Whether to show results modal

**Key Functions**:

**`startTest()`**:
```javascript
const generatedText = wasm.generateText(25);  // Get text from C++
setTargetText(generatedText);
setIsTestActive(true);
```

**`handleInputChange()`**:
```javascript
// First keystroke starts the session
if (!hasStartedTyping && typed.length > 0) {
  wasm.startSession(targetText);  // Initialize C++ session
  setHasStartedTyping(true);
}

// Update C++ with current input
wasm.updateInput(typed);

// Get updated stats from C++
const acc = wasm.getAccuracy();
setAccuracy(acc);
```

**`finishTest()`**:
```javascript
const elapsed = wasm.getElapsedSeconds();
const finalWpm = wasm.getWPM(elapsed);
const finalAccuracy = wasm.getAccuracy();

// Save to Supabase
await supabase.from('leaderboard').insert([...]);
```

**Real-time Updates**:
- Uses `setInterval` to poll C++ for updates every 100ms
- Updates WPM and timer display in real-time

#### 5. `pages/LeaderboardPage.jsx` - Global Leaderboard

**Purpose**: Displays top 100 typists

**What it does**:
- Fetches all scores from Supabase
- Groups by username, keeping best score per user
- Sorts by WPM → Accuracy → Time
- Displays in a table with rankings
- Links to individual user profiles

**Score Comparison Logic**:
```javascript
// Better score = higher WPM, or same WPM with higher accuracy, or same WPM/accuracy with lower time
if (a.wpm > b.wpm) return -1;
if (a.wpm < b.wpm) return 1;
if (a.accuracy > b.accuracy) return -1;
if (a.accuracy < b.accuracy) return 1;
return a.time - b.time;
```

#### 6. `pages/ProfilePage.jsx` - User Profiles

**Purpose**: Shows individual user statistics and progress

**Features**:
- **Stats Summary**: Best WPM, accuracy, leaderboard position
- **Progress Graph**: WPM and Accuracy over time (using Recharts)
- **Activity Heatmap**: GitHub-style contribution graph
- **Session History**: Table of all tests with filtering

**Data Fetching**:
```javascript
// Get all sessions for user
const { data } = await supabase
  .from('leaderboard')
  .select('*')
  .eq('username', username)
  .order('created_at', { ascending: false });

// Calculate leaderboard position
// (fetches all users, sorts, finds position)
```

**Graph Data Processing**:
- Groups sessions by date
- Calculates daily averages for WPM and Accuracy
- Formats dates based on selected period (day/week/month)

---

## The Bridge (C++ ↔ JavaScript)

### How They Connect

```
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Side                       │
│                                                           │
│  TypingTest.jsx                                          │
│    │                                                      │
│    │ wasm.generateText(25)                                │
│    ▼                                                      │
│  wasmLoader.js                                           │
│    │                                                      │
│    │ wasmModule.cwrap("generateText", ...)               │
│    │ wasmModule.UTF8ToString(ptr)                        │
│    ▼                                                      │
│  typing.js (Emscripten Loader)                          │
│    │                                                      │
│    │ Module._generateText(25)                            │
│    ▼                                                      │
└─────────────────────────────────────────────────────────┘
                    │
                    │ WebAssembly Call
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    C++ Side (WASM)                       │
│                                                           │
│  bindings.cpp                                            │
│    │                                                      │
│    │ EMSCRIPTEN_KEEPALIVE generateText(int)              │
│    ▼                                                      │
│  WordGenerator.cpp                                       │
│    │                                                      │
│    │ WordGenerator::generateText(25)                     │
│    │ Returns: "apple green river..."                      │
│    ▼                                                      │
│  Returns pointer to string                               │
│    │                                                      │
│    │ malloc() allocated memory                           │
│    ▼                                                      │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Return pointer
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Side                       │
│                                                           │
│  wasmLoader.js                                           │
│    │                                                      │
│    │ UTF8ToString(ptr) → "apple green river..."         │
│    │ _free(ptr) → Free memory                            │
│    ▼                                                      │
│  TypingTest.jsx                                          │
│    │                                                      │
│    │ setTargetText("apple green river...")               │
│    │ UI updates                                           │
└─────────────────────────────────────────────────────────┘
```

### Data Type Conversions

| C++ Type | JavaScript Type | Conversion Method |
|----------|----------------|-------------------|
| `char*` | `string` | `UTF8ToString(ptr)` then `_free(ptr)` |
| `int` | `number` | Direct (no conversion needed) |
| `double` | `number` | Direct (no conversion needed) |
| `void` | `undefined` | Direct (no return value) |
| `string` (parameter) | `string` | `stringToUTF8()` (handled by cwrap) |

### Function Call Flow Example

**JavaScript calls C++**:
```javascript
// In TypingTest.jsx
const text = wasm.generateText(25);
```

**What happens**:
1. `wasm.generateText(25)` calls wrapper in `wasmLoader.js`
2. Wrapper calls `wasmModule.cwrap("generateText", "number", ["number"])`
3. Emscripten converts JavaScript number to C++ int
4. Calls C++ function `generateText(25)` in WebAssembly
5. C++ allocates memory and returns pointer
6. Emscripten returns pointer as JavaScript number
7. Wrapper converts pointer to string using `UTF8ToString()`
8. Wrapper frees memory using `_free()`
9. Returns string to React component

---

## Build Process

### Overview

The build process converts C++ source code into WebAssembly that can run in the browser.

### Step-by-Step Build Flow

```
1. Source Files (C++)
   │
   │ cpp/bindings.cpp
   │ cpp/WordGenerator.cpp
   │ cpp/TypingSession.cpp
   │ cpp/Timer.cpp
   │
   ▼
2. Emscripten Compiler (emcc)
   │
   │ Compiles C++ → LLVM IR
   │ Converts LLVM IR → WebAssembly
   │ Generates JavaScript glue code
   │
   ▼
3. Output Files
   │
   │ public/typing.js  (JavaScript loader, ~16KB)
   │ public/typing.wasm (WebAssembly binary, ~131KB)
   │
   ▼
4. Vite Dev Server / Build
   │
   │ Serves files at:
   │ /typing.js
   │ /typing.wasm
   │
   ▼
5. Browser
   │
   │ Loads typing.js
   │ Downloads typing.wasm
   │ Initializes WebAssembly module
   │ Ready to use!
```

### Makefile Breakdown

**Location**: `build/Makefile`

**Key Variables**:
```makefile
CPP_DIR = ../cpp                    # Source directory
OUTPUT_DIR = ../public              # Output directory
CPP_SOURCES = bindings.cpp ...      # All .cpp files
OUTPUT_JS = ../public/typing.js     # JavaScript output
OUTPUT_WASM = ../public/typing.wasm # WebAssembly output
```

**Compiler Flags Explained**:

| Flag | Purpose |
|------|---------|
| `-O2` | Optimization level 2 (balance of size and speed) |
| `-s EXPORTED_FUNCTIONS` | List of C++ functions to expose to JavaScript |
| `-s EXPORTED_RUNTIME_METHODS` | JavaScript helper functions (cwrap, UTF8ToString, etc.) |
| `-s WASM=1` | Generate WebAssembly (not asm.js) |
| `-s MODULARIZE=1` | Make it a module (not global) |
| `-s EXPORT_NAME="'Module'"` | Name of the module |
| `-s ALLOW_MEMORY_GROWTH=1` | Allow memory to grow dynamically |
| `-s INITIAL_MEMORY=16777216` | Initial memory: 16MB |
| `-I$(CPP_DIR)` | Include directory for headers |
| `--no-entry` | No main() function (library mode) |

**Build Command**:
```bash
emcc [all cpp files] -o public/typing.js [all flags]
```

### Build Script (`build/build.sh`)

**Purpose**: Automates the entire build process

**Steps**:
1. Check if Emscripten is available (`emcc --version`)
2. Navigate to build directory
3. Run `make clean` (remove old files)
4. Run `make` (compile C++ to WebAssembly)
5. Navigate back to project root
6. Run `npm install` (install JavaScript dependencies)
7. Provide instructions for running the app

---

## Complete Data Flow

### Scenario: User Completes a Typing Test

#### Step 1: User Clicks "Start Test"

```
User Action: Click "Start Test" button
    │
    ▼
TypingTest.jsx: startTest()
    │
    │ const generatedText = wasm.generateText(25);
    │
    ▼
wasmLoader.js: generateText(25)
    │
    │ const ptr = generateTextPtr(25);
    │ const str = UTF8ToString(ptr);
    │ _free(ptr);
    │
    ▼
WebAssembly: generateText(25)
    │
    │ WordGenerator::generateText(25)
    │ Returns: "apple green river monkey blue..."
    │
    ▼
TypingTest.jsx: setTargetText("apple green river...")
    │
    ▼
React: Re-renders UI with target text
```

#### Step 2: User Types First Character

```
User Action: Type "a"
    │
    ▼
TypingTest.jsx: handleInputChange("a")
    │
    │ if (!hasStartedTyping) {
    │   wasm.startSession(targetText);
    │   setHasStartedTyping(true);
    │ }
    │
    ▼
WebAssembly: startSession("apple green river...")
    │
    │ TypingSession::startSession("apple green river...")
    │ Timer::start()
    │
    ▼
TypingTest.jsx: wasm.updateInput("a")
    │
    ▼
WebAssembly: updateInput("a")
    │
    │ TypingSession::updateInput("a")
    │ Compares "a" with "a" → correctChars = 1
    │
    ▼
TypingTest.jsx: wasm.getAccuracy()
    │
    ▼
WebAssembly: accuracy()
    │
    │ Returns: 100.0 (1/1 * 100)
    │
    ▼
TypingTest.jsx: setAccuracy(100)
    │
    ▼
React: Updates UI to show 100% accuracy
```

#### Step 3: User Continues Typing

```
User Action: Type "apple green riv"
    │
    ▼
TypingTest.jsx: handleInputChange("apple green riv")
    │
    │ wasm.updateInput("apple green riv")
    │ const acc = wasm.getAccuracy();
    │ setAccuracy(acc);
    │
    ▼
WebAssembly: updateInput("apple green riv")
    │
    │ Compares character by character:
    │ "apple green riv" vs "apple green river"
    │ correctChars = 15 (all correct so far)
    │ totalChars = 15
    │
    ▼
WebAssembly: accuracy()
    │
    │ Returns: 100.0
    │
    ▼
React: Updates UI
```

#### Step 4: Real-time Updates (Every 100ms)

```
setInterval (every 100ms)
    │
    │ const elapsed = wasm.getElapsedSeconds();
    │ const wpm = wasm.getWPM(elapsed);
    │
    ▼
WebAssembly: getElapsedSeconds()
    │
    │ Timer::elapsedSeconds()
    │ Returns: 2.5 (seconds)
    │
    ▼
WebAssembly: getWPM(2.5)
    │
    │ TypingSession::wpm(2.5)
    │ correctChars = 15
    │ minutes = 2.5 / 60 = 0.0417
    │ wpm = (15 / 5) / 0.0417 = 72
    │ Returns: 72
    │
    ▼
TypingTest.jsx: setWpm(72), setTimer(2.5)
    │
    ▼
React: Updates WPM and timer display
```

#### Step 5: User Makes a Mistake

```
User Action: Type "apple green rivx" (typo)
    │
    ▼
WebAssembly: updateInput("apple green rivx")
    │
    │ Compares:
    │ "apple green rivx" vs "apple green river"
    │ Position 15: 'x' != 'e' → incorrect
    │ correctChars = 14
    │ totalChars = 16
    │
    ▼
WebAssembly: accuracy()
    │
    │ Returns: (14 / 16) * 100 = 87.5
    │
    ▼
React: Updates UI
    │ - Shows "rivx" in red (incorrect)
    │ - Shows accuracy: 87.5%
```

#### Step 6: User Finishes Test

```
User Action: Complete all text OR 60 seconds pass
    │
    ▼
TypingTest.jsx: finishTest()
    │
    │ const elapsed = wasm.getElapsedSeconds();
    │ const finalWpm = wasm.getWPM(elapsed);
    │ const finalAccuracy = wasm.getAccuracy();
    │
    ▼
WebAssembly: Final calculations
    │
    │ elapsed = 45.2 seconds
    │ correctChars = 120
    │ finalWpm = (120 / 5) / (45.2 / 60) = 32
    │ finalAccuracy = (120 / 125) * 100 = 96.0
    │
    ▼
TypingTest.jsx: Save to Supabase
    │
    │ await supabase.from('leaderboard').insert([{
    │   username: "John",
    │   wpm: 32,
    │   accuracy: 96.0,
    │   time: 45.2
    │ }]);
    │
    ▼
Supabase: Stores in database
    │
    ▼
TypingTest.jsx: setShowNameModal(true)
    │
    ▼
React: Shows results modal with stats
```

---

## File-by-File Breakdown

### C++ Files (`cpp/`)

| File | Lines | Purpose | Key Functions |
|------|-------|---------|---------------|
| `WordGenerator.h` | ~17 | Header for text generation | `generateText(int)` |
| `WordGenerator.cpp` | ~46 | Generates random text | `generateText(int)` |
| `TypingSession.h` | ~23 | Header for typing tracking | `updateInput()`, `accuracy()`, `wpm()` |
| `TypingSession.cpp` | ~56 | Tracks typing & calculates stats | `updateInput()`, `accuracy()`, `wpm()` |
| `Timer.h` | ~21 | Header for time tracking | `start()`, `elapsedSeconds()` |
| `Timer.cpp` | ~30 | Measures elapsed time | `start()`, `elapsedSeconds()` |
| `bindings.cpp` | ~79 | Bridge C++ to JavaScript | 7 exported functions |

### JavaScript/React Files (`src/`)

| File | Lines | Purpose | Key Responsibilities |
|------|-------|---------|---------------------|
| `main.jsx` | ~15 | App entry point | Initialize React, setup router |
| `App.jsx` | ~24 | Router config | Define routes |
| `wasmLoader.js` | ~66 | WASM bridge | Load & wrap C++ functions |
| `pages/TypingTest.jsx` | ~660 | Main typing interface | Typing test UI & logic |
| `pages/LeaderboardPage.jsx` | ~190 | Leaderboard | Display rankings |
| `pages/ProfilePage.jsx` | ~810 | User profiles | Stats, graphs, history |
| `components/UsernameButton.jsx` | ~56 | Username display | Show username, navigate |
| `components/NameInputModal.jsx` | ~163 | Results modal | Show results, collect username |
| `lib/supabase.js` | ~26 | Supabase client | Database connection |

### Build Files (`build/`)

| File | Lines | Purpose |
|------|-------|---------|
| `Makefile` | ~50 | Compile C++ to WebAssembly |
| `build.sh` | ~50 | Automated build script |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `vercel.json` | Vercel deployment configuration |
| `index.html` | HTML entry point |
| `.gitignore` | Git ignore patterns |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup |
| `QUICKSTART.md` | Quick start guide |
| `ARCHITECTURE.md` | This file - detailed architecture |
| `supabase-schema.sql` | Database schema |

---

## Why This Architecture?

### Why C++ for Business Logic?

**Performance**:
- C++ compiles to highly optimized machine code
- WebAssembly runs at near-native speed
- Critical for real-time calculations (WPM, accuracy)

**Type Safety**:
- Strong typing prevents many runtime errors
- Compile-time checks catch bugs early

**Reusability**:
- Same C++ code could be used in native apps
- Not tied to JavaScript ecosystem

### Why WebAssembly?

**Browser Compatibility**:
- Runs in all modern browsers
- No plugins required
- Standardized by W3C

**Performance**:
- Near-native execution speed
- Much faster than JavaScript for heavy computations
- Predictable performance

**Language Flexibility**:
- Can use C++, Rust, Go, etc.
- Not limited to JavaScript

### Why React for UI?

**Component-Based**:
- Reusable components
- Easy to maintain and test
- Clear separation of concerns

**Reactive Updates**:
- Automatic UI updates when state changes
- Efficient re-rendering
- Great developer experience

**Ecosystem**:
- Huge library ecosystem
- Great tooling (Vite, React Router, etc.)
- Large community

### Why This Bridge Pattern?

**Separation of Concerns**:
- Business logic in C++ (fast, type-safe)
- UI logic in JavaScript (flexible, reactive)
- Clear boundaries

**Performance**:
- Heavy calculations in C++
- UI updates in JavaScript
- Best of both worlds

**Maintainability**:
- Each part can be developed/tested independently
- Clear interfaces between layers
- Easy to understand

---

## Memory Management

### C++ Memory Allocation

**String Returns**:
```cpp
// In bindings.cpp
char* generateText(int wordCount) {
    std::string text = wordGen->generateText(wordCount);
    char* result = (char*)malloc(text.length() + 1);  // Allocate
    strcpy(result, text.c_str());
    return result;  // JavaScript must free this!
}
```

**Why malloc?**:
- Stack-allocated strings are destroyed when function returns
- Must use heap allocation for strings returned to JavaScript
- JavaScript receives a pointer, not the string itself

### JavaScript Memory Management

**Freeing Memory**:
```javascript
// In wasmLoader.js
const generateText = (wordCount) => {
  const ptr = generateTextPtr(wordCount);  // Get pointer
  const str = wasmModule.UTF8ToString(ptr);  // Convert to string
  wasmModule._free(ptr);  // MUST free memory!
  return str;
};
```

**Why free?**:
- C++ memory is not garbage collected
- Must manually free allocated memory
- Memory leaks occur if not freed

**Best Practices**:
- Always free memory immediately after use
- Don't store pointers in JavaScript
- Convert to JavaScript strings immediately

### Memory Leaks Prevention

**Common Mistakes**:
```javascript
// ❌ BAD: Storing pointer
const ptr = generateTextPtr(25);
// ... later ...
const str = UTF8ToString(ptr);  // Memory leak if ptr is lost!

// ✅ GOOD: Convert immediately
const ptr = generateTextPtr(25);
const str = UTF8ToString(ptr);
_free(ptr);  // Free immediately
```

---

## Deployment Flow

### Development

```
1. Developer makes changes
   │
   ├─> C++ changes → Rebuild with `make`
   │   └─> Generates new typing.js/wasm
   │
   └─> React changes → Hot reload (Vite)
       └─> Instant UI updates
```

### Production Build

```
1. Build WebAssembly
   cd build && make
   └─> Creates public/typing.js and typing.wasm

2. Build React App
   npm run build
   └─> Creates dist/ folder with optimized bundle

3. Deploy
   └─> Upload dist/ to hosting (Vercel, Netlify, etc.)
```

### Vercel Deployment

**`vercel.json`**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Purpose**: 
- SPA routing support
- All routes serve index.html
- React Router handles client-side routing

### File Serving

**Development (Vite)**:
- Serves files from `public/` at root path
- `/typing.js` → `public/typing.js`
- `/typing.wasm` → `public/typing.wasm`

**Production**:
- Files in `dist/` are served statically
- Same path structure maintained
- WebAssembly files included in bundle

---

## Summary

This typing tutor application demonstrates a modern approach to web development:

1. **C++ handles core logic** - Fast, type-safe calculations
2. **WebAssembly bridges languages** - C++ runs in browser
3. **React provides UI** - Modern, reactive interface
4. **Emscripten enables compilation** - C++ → WebAssembly
5. **Bridge pattern connects layers** - Clean separation
6. **Supabase stores data** - Backend-as-a-Service

The result is a **high-performance web application** that combines the speed of native code with the flexibility of web technologies.

---

## Additional Resources

- [Emscripten Documentation](https://emscripten.org/docs/getting_started/index.html)
- [WebAssembly Specification](https://webassembly.org/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

*Last Updated: 2024*

