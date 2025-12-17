# Typing Practice Application - C++ WebAssembly Implementation

This project implements a typing practice application with core logic written in C++ and compiled to WebAssembly using Emscripten. The C++ code handles text generation, typing session management, accuracy calculation, and WPM (Words Per Minute) computation.

## Table of Contents

- [C++ Architecture](#cpp-architecture)
- [Build System](#build-system)
- [WebAssembly Compilation](#webassembly-compilation)
- [JavaScript Bindings](#javascript-bindings)
- [Memory Management](#memory-management)
- [Building the Project](#building-the-project)

---

## C++ Architecture

The C++ codebase is located in the `cpp/` directory and consists of several interconnected components:

### Core Components

#### 1. `Word.cpp`
A simple data class representing a word or sentence in the typing practice system.

**Purpose:**
- Stores word text, length, and category
- Validates word/sentence length based on category
- Provides getter methods for accessing word properties

**Key Features:**
- Default constructor initializes empty word
- Parameterized constructor sets text and category
- `isValid()` method enforces length constraints:
  - General words: 1-6 characters
  - Sentences: 1-200 characters

#### 2. `TextGenerator.cpp`
Abstract base class defining the interface for text generation strategies.

**Purpose:**
- Defines the contract that all text generators must implement
- Pure virtual method `generateText(int count)` must be implemented by subclasses

**Design Pattern:**
Uses the Strategy pattern, allowing different text generation algorithms to be swapped at runtime.

#### 3. `RandomWordGenerator.cpp`
Generates random sequences of words from a predefined word list.

**Purpose:**
- Implements `TextGenerator` interface
- Maintains a vector of 200+ common English words
- Randomly selects words to create practice text

**Implementation Details:**
- Uses `rand()` with `srand(time(0))` for randomization
- Validates word count input (must be positive)
- Returns space-separated words as a single string
- Includes comprehensive error handling for edge cases

#### 4. `SentenceGenerator.cpp`
Generates random sentences from a predefined sentence list.

**Purpose:**
- Implements `TextGenerator` interface
- Maintains a collection of 30 complete sentences
- Provides more realistic typing practice with punctuation

**Implementation Details:**
- Similar structure to `RandomWordGenerator` but uses full sentences
- Sentences are categorized as "sentence" type in Word objects
- Allows practicing typing with punctuation and capitalization

#### 5. `MixedCaseGenerator.cpp`
Generates words with randomized capitalization (mixed case).

**Purpose:**
- Implements `TextGenerator` interface
- Provides challenging practice with varying letter cases
- Helps users practice typing with capital letters

**Implementation Details:**
- Uses the same word list as `RandomWordGenerator`
- `randomizeCase()` method randomly uppercases or lowercases each character
- Each character has a 50% chance of being uppercase or lowercase

#### 6. `Timer.cpp`
Tracks elapsed time for typing sessions.

**Purpose:**
- Measures time elapsed during typing practice
- Provides accurate timing for WPM calculations

**Implementation Details:**
- Uses `clock()` from `<ctime>` for timing
- Tracks start time, end time, and running state
- `elapsedSeconds()` returns time in seconds as a double
- Handles both running and stopped states

#### 7. `TypingSession.cpp`
Core class managing typing session state and statistics.

**Purpose:**
- Tracks target text and user input
- Calculates accuracy percentage
- Computes Words Per Minute (WPM)

**Key Methods:**
- `startSession(string generatedText)`: Initializes a new session with target text
- `updateInput(string typed)`: Updates user input and recalculates correct characters
- `accuracy()`: Returns accuracy as a percentage (0-100)
- `wpm(double secondsElapsed)`: Calculates WPM using standard formula (5 characters = 1 word)

**WPM Calculation:**
```
WPM = (correct_characters / 5) / (seconds_elapsed / 60)
```

**Accuracy Calculation:**
```
Accuracy = (correct_characters / total_characters) * 100
```

#### 8. `bindings.cpp`
JavaScript interface layer using Emscripten.

**Purpose:**
- Exposes C++ functionality to JavaScript
- Manages global state (generators, sessions, timers)
- Handles memory allocation for string returns

**Exported Functions:**
All functions are marked with `EMSCRIPTEN_KEEPALIVE` to prevent dead code elimination:

1. `setGeneratorType(int type)`: Sets the active text generator
   - 0 = RandomWordGenerator
   - 1 = SentenceGenerator
   - 2 = MixedCaseGenerator

2. `generateText(int wordCount)`: Generates text and returns as C string
   - Allocates memory using `malloc()`
   - Returns pointer to null-terminated string
   - JavaScript must free the memory

3. `startSession(char* text)`: Initializes a typing session
   - Creates TypingSession and Timer if needed
   - Starts the timer

4. `updateInput(char* userTyped)`: Updates user input in session
   - Recalculates correct characters

5. `getAccuracy()`: Returns current accuracy as double

6. `getWPM(double secondsElapsed)`: Returns WPM as integer

7. `resetSession()`: Resets session and stops timer

8. `getElapsedSeconds()`: Returns elapsed time in seconds

**Memory Management:**
- `generateText()` allocates memory that must be freed by JavaScript
- Uses `malloc()` for string allocation
- Includes comprehensive error handling and null checks

---

## Build System

The build system uses **Emscripten** to compile C++ code to WebAssembly.

### Build Tools

#### `build/Makefile`
Defines the compilation process using `emcc` (Emscripten Compiler).

**Key Variables:**
- `EMCC`: Emscripten compiler command
- `CPP_DIR`: Source directory (`../cpp`)
- `OUTPUT_DIR`: Output directory (`../public`)
- `CPP_SOURCES`: Main source file (`bindings.cpp`)

**Output Files:**
- `typing.js`: JavaScript glue code and module loader
- `typing.wasm`: Compiled WebAssembly binary

#### `build/build.sh`
Bash script that orchestrates the build process.

**Steps:**
1. Checks for Emscripten installation
2. Cleans previous build artifacts
3. Compiles C++ to WebAssembly using Makefile
4. Installs Node.js dependencies

---

## WebAssembly Compilation

### Emscripten Compiler Flags

The Makefile uses several important Emscripten flags:

#### Essential Flags

**`-O2`**
- Optimization level 2
- Balances code size and performance
- Removes dead code and optimizes execution

**`-s WASM=1`**
- Generates WebAssembly binary instead of asm.js
- Modern, efficient binary format

**`-s MODULARIZE=1`**
- Creates a module factory function
- Allows async loading: `Module().then(...)`
- Prevents global namespace pollution

**`-s EXPORT_NAME="'Module'"`**
- Sets the module name to `Module`
- JavaScript accesses it as `window.Module`

**`-s ALLOW_MEMORY_GROWTH=1`**
- Allows WebAssembly memory to grow dynamically
- Prevents out-of-memory errors
- Memory can expand beyond initial size

**`-s INITIAL_MEMORY=16777216`**
- Sets initial memory to 16 MB (16 * 1024 * 1024 bytes)
- Provides sufficient memory for string operations
- Can grow if needed due to `ALLOW_MEMORY_GROWTH`

**`--no-entry`**
- No `main()` function required
- Exports only the functions we explicitly mark
- Suitable for library-style modules

#### Exported Functions

**`-s EXPORTED_FUNCTIONS`**
Lists C++ functions exposed to JavaScript:
```json
[
  "_setGeneratorType",
  "_generateText",
  "_startSession",
  "_updateInput",
  "_getAccuracy",
  "_getWPM",
  "_resetSession",
  "_getElapsedSeconds",
  "_malloc",
  "_free"
]
```

Note: Function names are prefixed with `_` in the export list, but JavaScript calls them without the underscore.

#### Exported Runtime Methods

**`-s EXPORTED_RUNTIME_METHODS`**
Exposes Emscripten runtime utilities:
- `cwrap`: Wraps C functions for easy JavaScript calling
- `UTF8ToString`: Converts C string pointers to JavaScript strings
- `stringToUTF8`: Converts JavaScript strings to C strings (not used in this project)

**`-I$(CPP_DIR)`**
- Include directory for header files
- Allows `#include` directives to find files

### Compilation Process

1. **Preprocessing**: Emscripten processes `#include` directives
2. **Compilation**: C++ code compiled to LLVM IR
3. **Optimization**: LLVM optimizes the intermediate representation
4. **WebAssembly Generation**: LLVM backend generates `.wasm` binary
5. **JavaScript Glue Code**: Emscripten generates `typing.js` with:
   - Module loader
   - Memory management utilities
   - Function wrappers
   - WebAssembly instantiation code

### Output Files

**`typing.js`**
- ~100KB+ JavaScript file
- Contains Emscripten runtime
- Module factory function
- Memory management code
- WebAssembly loader

**`typing.wasm`**
- Binary WebAssembly module
- Compiled C++ code
- Typically 50-200KB depending on optimization
- Loaded asynchronously by `typing.js`

---

## JavaScript Bindings

### `src/wasmLoader.js`

This module provides a clean JavaScript interface to the WebAssembly module.

#### Module Loading

**`loadEmscriptenModule()`**
- Dynamically loads `typing.js` script
- Returns a Promise that resolves to the Module instance
- Handles both cases: script already loaded or needs loading
- Configures `locateFile` to find `typing.wasm` in `/public` directory

#### Function Wrapping

**`cwrap()` Usage**
Emscripten's `cwrap` creates JavaScript functions from C++ functions:

```javascript
wasmModule.cwrap("functionName", "returnType", ["paramType1", "paramType2"])
```

**Return Types:**
- `"void"`: No return value
- `"number"`: Integer or double
- `"string"`: String (but we handle strings manually)

**Parameter Types:**
- `"number"`: Integer or double
- `"string"`: String (converted automatically)

#### Wrapped Functions

**Simple Wrappers:**
- `setGeneratorType`: Sets generator type (0, 1, or 2)
- `startSession`: Starts typing session with target text
- `updateInput`: Updates user input
- `getAccuracy`: Returns accuracy percentage
- `getWPM`: Returns words per minute
- `resetSession`: Resets session state
- `getElapsedSeconds`: Returns elapsed time

**Custom Wrapper - `generateText`:**
Special handling required due to memory management:

1. Calls C++ function which returns a pointer
2. Validates pointer (not null, not zero, reasonable address)
3. Converts pointer to JavaScript string using `UTF8ToString`
4. **Frees memory** using `_free()` to prevent leaks
5. Returns empty string on any error

**Memory Safety:**
- Always validates pointers before use
- Always frees allocated memory
- Handles errors gracefully
- Logs errors for debugging

#### Module Initialization

**`loadWasm()`**
- Singleton pattern: loads module once, caches result
- Returns object with all wrapped functions
- Can be called multiple times safely

**Usage Example:**
```javascript
import { loadWasm } from './wasmLoader.js';

const wasm = await loadWasm();
wasm.setGeneratorType(0); // Random words
const text = wasm.generateText(50);
wasm.startSession(text);
wasm.updateInput("user typed text");
const accuracy = wasm.getAccuracy();
const wpm = wasm.getWPM(wasm.getElapsedSeconds());
```

---

## Memory Management

### C++ Side

**Allocation:**
- `generateText()` uses `malloc()` to allocate memory for strings
- Memory persists until explicitly freed
- Must be freed by JavaScript to prevent leaks

**String Handling:**
- C++ strings converted to C-style null-terminated strings
- `memcpy()` used for safe copying
- Explicit null termination ensures safety

### JavaScript Side

**Memory Lifecycle:**
1. C++ function allocates memory → returns pointer
2. JavaScript receives pointer (number)
3. JavaScript converts pointer to string
4. **JavaScript must free memory** using `_free(pointer)`

**Best Practices:**
- Always free memory after use
- Validate pointers before use
- Handle errors and free memory in error cases
- Use try-catch to ensure cleanup

**Memory Growth:**
- WebAssembly memory can grow if needed
- Initial 16MB is usually sufficient
- Growing memory is expensive but automatic

---

## Building the Project

### Prerequisites

1. **Emscripten SDK**
   - Download from: https://emscripten.org/docs/getting_started/downloads.html
   - Activate: `source ~/emsdk/emsdk_env.sh`
   - Verify: `emcc --version`

2. **Node.js and npm**
   - Required for React frontend
   - Install from: https://nodejs.org/

### Build Steps

#### Option 1: Using the Build Script

```bash
cd build
./build.sh
```

This script:
1. Checks for Emscripten
2. Cleans previous builds
3. Compiles C++ to WebAssembly
4. Installs npm dependencies

#### Option 2: Manual Build

**Step 1: Activate Emscripten**
```bash
source ~/emsdk/emsdk_env.sh
```

**Step 2: Compile to WebAssembly**
```bash
cd build
make clean
make
```

**Step 3: Install Dependencies**
```bash
cd ..
npm install
```

### Build Output

After successful build:
- `public/typing.js` - JavaScript module loader
- `public/typing.wasm` - WebAssembly binary

### Development

```bash
npm run dev
```

Starts Vite development server. The WebAssembly module is loaded from `/public/typing.wasm`.

### Production Build

```bash
npm run build
```

Builds optimized React app. WebAssembly files are copied to `dist/` directory.

### Troubleshooting

**Emscripten not found:**
- Ensure Emscripten is installed and activated
- Check `emcc --version` works
- Verify `EMSDK` environment variable is set

**Memory errors:**
- Increase `INITIAL_MEMORY` in Makefile if needed
- Ensure `ALLOW_MEMORY_GROWTH=1` is set

**Function not found:**
- Verify function is in `EXPORTED_FUNCTIONS` list
- Check function is marked with `EMSCRIPTEN_KEEPALIVE`
- Ensure function name matches (with/without underscore)

**String conversion errors:**
- Validate pointer before `UTF8ToString`
- Ensure memory is not freed before conversion
- Check for null/zero pointers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Layer                      │
│  (React Components, wasmLoader.js)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Function Calls (cwrap)
                     │ Memory Management
                     │
┌────────────────────▼────────────────────────────────────┐
│              WebAssembly Module                          │
│  (typing.wasm + typing.js glue code)                    │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │         bindings.cpp                          │      │
│  │  (JavaScript Interface Layer)                 │      │
│  └──────┬───────────────────────────────────────┘      │
│         │                                               │
│  ┌──────▼───────────────────────────────────────┐      │
│  │  Core C++ Components                         │      │
│  │  • TextGenerator (abstract)                  │      │
│  │  • RandomWordGenerator                       │      │
│  │  • SentenceGenerator                         │      │
│  │  • MixedCaseGenerator                        │      │
│  │  • TypingSession                             │      │
│  │  • Timer                                     │      │
│  │  • Word                                      │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Text Generation:**
   - JavaScript calls `setGeneratorType(type)`
   - JavaScript calls `generateText(count)`
   - C++ generates text, allocates memory, returns pointer
   - JavaScript converts pointer to string, frees memory

2. **Typing Session:**
   - JavaScript calls `startSession(text)`
   - C++ creates TypingSession and Timer
   - User types → JavaScript calls `updateInput(typed)`
   - C++ calculates correct characters
   - JavaScript calls `getAccuracy()` and `getWPM(seconds)`
   - C++ returns calculated values

3. **Session Management:**
   - JavaScript calls `resetSession()` to clear state
   - C++ resets TypingSession and stops Timer

---

## Key Design Decisions

1. **Why WebAssembly?**
   - Performance: C++ calculations are faster than JavaScript
   - Code reuse: Core logic can be used in other projects
   - Type safety: C++ provides stronger type checking

2. **Why Emscripten?**
   - Mature toolchain with excellent C++ support
   - Automatic memory management utilities
   - Easy JavaScript integration
   - Comprehensive optimization options

3. **Memory Management Strategy:**
   - C++ allocates, JavaScript frees
   - Clear ownership model
   - Prevents memory leaks with proper cleanup

4. **Error Handling:**
   - C++ uses exceptions internally
   - JavaScript-friendly return values (empty strings, zeros)
   - Comprehensive validation on both sides

5. **Module Design:**
   - Singleton pattern for WebAssembly module
   - Clean separation of concerns
   - Easy to test and maintain

---

## Summary

This project demonstrates a complete C++ to WebAssembly workflow:

- **C++ Core**: Object-oriented design with clear responsibilities
- **Emscripten Compilation**: Optimized WebAssembly generation
- **JavaScript Integration**: Clean, safe bindings with proper memory management
- **Build System**: Automated compilation and dependency management

The architecture provides a solid foundation for a typing practice application with room for future enhancements while maintaining performance and code quality.
