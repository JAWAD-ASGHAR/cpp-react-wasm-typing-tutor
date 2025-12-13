EMCC = emcc

CPP_DIR = ../cpp
OUTPUT_DIR = ../public

CPP_SOURCES = $(CPP_DIR)/bindings.cpp

OUTPUT_JS = $(OUTPUT_DIR)/typing.js
OUTPUT_WASM = $(OUTPUT_DIR)/typing.wasm

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

all: $(OUTPUT_JS)

$(OUTPUT_JS): $(CPP_SOURCES)
	$(EMCC) $(CPP_SOURCES) -o $(OUTPUT_JS) $(EMCC_FLAGS)
	@echo "Build complete! Generated $(OUTPUT_JS) and $(OUTPUT_WASM)"

clean:
	rm -f $(OUTPUT_JS) $(OUTPUT_WASM) $(CPP_DIR)/*.o

help:
	@echo "Available targets:"
	@echo "  all    - Build WebAssembly module (default)"
	@echo "  clean  - Remove build artifacts"
	@echo "  help   - Show this help message"

.PHONY: all clean help

