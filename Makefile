# Makefile for compiling C++ to WebAssembly using Emscripten

# Emscripten compiler
EMCC = emcc

# Source files
CPP_SOURCES = bindings.cpp WordGenerator.cpp TypingSession.cpp Timer.cpp

# Output files
OUTPUT_JS = typing.js
OUTPUT_WASM = typing.wasm

# Compiler flags
EMCC_FLAGS = -O2 \
	-s EXPORTED_FUNCTIONS='["_generateText","_startSession","_updateInput","_getAccuracy","_getWPM","_resetSession","_getElapsedSeconds","_malloc","_free"]' \
	-s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","stringToUTF8"]' \
	-s WASM=1 \
	-s MODULARIZE=1 \
	-s EXPORT_NAME="'Module'" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s INITIAL_MEMORY=16777216 \
	--no-entry

# Default target
all: $(OUTPUT_JS)

# Build WebAssembly
$(OUTPUT_JS): $(CPP_SOURCES)
	$(EMCC) $(CPP_SOURCES) -o $(OUTPUT_JS) $(EMCC_FLAGS)
	@echo "Build complete! Generated $(OUTPUT_JS) and $(OUTPUT_WASM)"

# Clean build artifacts
clean:
	rm -f $(OUTPUT_JS) $(OUTPUT_WASM) *.o

# Help
help:
	@echo "Available targets:"
	@echo "  all    - Build WebAssembly module (default)"
	@echo "  clean  - Remove build artifacts"
	@echo "  help   - Show this help message"

.PHONY: all clean help

