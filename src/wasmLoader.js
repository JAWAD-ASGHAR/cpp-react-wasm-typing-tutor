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
    const ptr = generateTextPtr(wordCount);
    if (!ptr) return "";
    const str = wasmModule.UTF8ToString(ptr);
    wasmModule._free(ptr);
    return str;
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

