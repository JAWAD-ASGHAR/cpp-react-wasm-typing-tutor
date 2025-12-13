let wasmModule = null;
let wasmFunctions = null;

function loadEmscriptenModule() {
  return new Promise((resolve, reject) => {
    if (window.Module && typeof window.Module === 'function') {
      window.Module({
        locateFile: (path) => path.endsWith('.wasm') ? '/typing.wasm' : path
      }).then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = '/typing.js';
    script.onload = () => {
      if (typeof window.Module === 'function') {
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

  wasmModule = await loadEmscriptenModule();
  
  const generateTextPtr = wasmModule.cwrap("generateText", "number", ["number"]);
  const generateText = (wordCount) => {
    let ptr = null;
    try {
      ptr = generateTextPtr(wordCount);
      
      // Validate pointer - check if it's null, 0, or an invalid address
      if (!ptr || ptr === 0) {
        console.error('[WASM] generateText returned null/zero pointer - memory allocation failed');
        return "";
      }
      
      // Additional validation: check if pointer is in a reasonable range
      // WASM memory typically starts at a high address, so very low addresses are suspicious
      if (ptr < 1024) {
        console.error('[WASM] generateText returned suspiciously low pointer:', ptr);
        return "";
      }
      
      // Try to convert pointer to string
      let str;
      try {
        str = wasmModule.UTF8ToString(ptr);
      } catch (conversionError) {
        console.error('[WASM] Error converting pointer to string:', conversionError, 'Pointer:', ptr);
        // Free the pointer even if conversion failed
        if (ptr) {
          try {
            wasmModule._free(ptr);
          } catch (freeError) {
            console.error('[WASM] Error freeing pointer:', freeError);
          }
        }
        return "";
      }
      
      // Free the pointer
      try {
        wasmModule._free(ptr);
      } catch (freeError) {
        console.error('[WASM] Error freeing pointer:', freeError);
      }
      
      if (!str || str.trim() === '') {
        console.warn('[WASM] generateText returned empty string');
      }
      return str || "";
    } catch (error) {
      console.error('[WASM] Error in generateText:', error, 'Pointer was:', ptr);
      // Try to free pointer if we have it
      if (ptr) {
        try {
          wasmModule._free(ptr);
        } catch (freeError) {
          // Ignore free errors in error handler
        }
      }
      return "";
    }
  };

  wasmFunctions = {
    setGeneratorType: wasmModule.cwrap("setGeneratorType", "void", ["number"]),
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

