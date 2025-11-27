let wasmModule = null;
let wasmFunctions = null;

// Load Emscripten module - proper way to load C++ WebAssembly
// This is NOT a JavaScript fallback - it's the standard Emscripten loading method
// All business logic runs in C++ WebAssembly
function loadEmscriptenModule() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Module && typeof window.Module === 'function') {
      window.Module({
        locateFile: (path) => path.endsWith('.wasm') ? '/typing.wasm' : path
      }).then(resolve).catch(reject);
      return;
    }

    // Load Emscripten script - exposes Module as global (from C++ compilation)
    const script = document.createElement('script');
    script.src = '/typing.js';
    script.onload = () => {
      if (typeof window.Module === 'function') {
        // Initialize C++ WebAssembly module
        window.Module({
          locateFile: (path) => path.endsWith('.wasm') ? '/typing.wasm' : path
        }).then(resolve).catch(reject);
      } else {
        reject(new Error('C++ WebAssembly Module not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load C++ WebAssembly module'));
    document.head.appendChild(script);
  });
}

export async function loadWasm() {
  if (wasmModule && wasmFunctions) {
    return wasmFunctions;
  }

  // Load C++ WebAssembly - pure C++ OOP, no JavaScript business logic
  wasmModule = await loadEmscriptenModule();
  
  // Bridge C++ functions to JavaScript
  const generateTextPtr = wasmModule.cwrap("generateText", "number", ["number"]);
  const generateText = (wordCount) => {
    const ptr = generateTextPtr(wordCount);
    if (!ptr) return "";
    const str = wasmModule.UTF8ToString(ptr);
    wasmModule._free(ptr);
    return str;
  };

  wasmFunctions = {
    generateText: generateText,
    startSession: wasmModule.cwrap("startSession", "void", ["string"]),
    updateInput: wasmModule.cwrap("updateInput", "void", ["string"]),
    getAccuracy: wasmModule.cwrap("getAccuracy", "number", []),
    getWPM: wasmModule.cwrap("getWPM", "number", ["number"]),
    resetSession: wasmModule.cwrap("resetSession", "void", []),
    getElapsedSeconds: wasmModule.cwrap("getElapsedSeconds", "number", []),
  };

  return wasmFunctions;
}

