# Makefile for compiling C++ to WebAssembly using Emscripten

# Emscripten compiler
EMCC = emcc

# Directories
CPP_DIR = ../cpp
OUTPUT_DIR = ../public

# Source files (relative to cpp directory)
# Only bindings.cpp is needed since it includes the other .cpp files
CPP_SOURCES = $(CPP_DIR)/bindings.cpp

# Output files (in public directory - where Vite serves them from)
OUTPUT_JS = $(OUTPUT_DIR)/typing.js
OUTPUT_WASM = $(OUTPUT_DIR)/typing.wasm

# Compiler flags
EMCC_FLAGS = -O2 \
	-s EXPORTED_FUNCTIONS='["_setGeneratorType","_generateText","_startSession","_updateInput","_getAccuracy","_getWPM","_resetSession","_getElapsedSeconds","_malloc","_free"]' \
	-s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","stringToUTF8"]' \
	-s WASM=1 \
	-s MODULARIZE=1 \
	-s EXPORT_NAME="'Module'" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s INITIAL_MEMORY=16777216 \
	-I$(CPP_DIR) \
	--no-entry

# Default target
all: $(OUTPUT_JS)

# Build WebAssembly
$(OUTPUT_JS): $(CPP_SOURCES)
	$(EMCC) $(CPP_SOURCES) -o $(OUTPUT_JS) $(EMCC_FLAGS)
	@echo "Build complete! Generated $(OUTPUT_JS) and $(OUTPUT_WASM)"

# Clean build artifacts
clean:
	rm -f $(OUTPUT_JS) $(OUTPUT_WASM) $(CPP_DIR)/*.o

# Help
help:
	@echo "Available targets:"
	@echo "  all    - Build WebAssembly module (default)"
	@echo "  clean  - Remove build artifacts"
	@echo "  help   - Show this help message"

.PHONY: all clean help

