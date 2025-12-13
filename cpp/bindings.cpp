#include <emscripten.h>
#include <string>
#include <cstring>
#include <cstdlib>
#include <stdexcept>
using namespace std;

#include "Word.cpp"
#include "TextGenerator.cpp"
#include "RandomWordGenerator.cpp"
#include "SentenceGenerator.cpp"
#include "MixedCaseGenerator.cpp"
#include "TypingSession.cpp"
#include "Timer.cpp"

TextGenerator* textGen = nullptr;
TypingSession* session = nullptr;
Timer* timer = nullptr;

enum GeneratorType {
    RANDOM_WORDS = 0,
    SENTENCES = 1,
    MIXED_CASE = 2
};

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void setGeneratorType(int type) {
        if (textGen) {
            delete textGen;
            textGen = nullptr;
        }
        
        switch (type) {
            case RANDOM_WORDS:
                textGen = new RandomWordGenerator();
                break;
            case SENTENCES:
                textGen = new SentenceGenerator();
                break;
            case MIXED_CASE:
                textGen = new MixedCaseGenerator();
                break;
            default:
                textGen = new RandomWordGenerator();
        }
    }
    
    EMSCRIPTEN_KEEPALIVE
    char* generateText(int wordCount) {
        // Helper function to safely allocate and return empty string
        auto returnEmptyString = []() -> char* {
            char* result = (char*)calloc(1, 1);  // Use calloc for zero-initialization
            return result;  // Returns nullptr if allocation fails, which is handled by JS
        };
        
        try {
            if (wordCount < 0) {
                return returnEmptyString();
            }
            
            // Get local pointer to prevent deletion during execution
            TextGenerator* localGen = textGen;
            if (!localGen) {
                // Create default generator if none exists
                localGen = new RandomWordGenerator();
                textGen = localGen;
            }
            
            // Generate text into local string (safe copy)
            string text;
            try {
                text = localGen->generateText(wordCount);
            } catch (...) {
                // If generation fails, return empty string
                return returnEmptyString();
            }
            
            // Validate generated text
            if (text.empty() && wordCount > 0) {
                return returnEmptyString();
            }
            
            // Allocate memory with explicit size calculation
            size_t textLen = text.length();
            char* result = (char*)malloc(textLen + 1);
            if (!result) {
                return nullptr;  // Let JS handle nullptr
            }
            
            // Copy string with explicit length and ensure null termination
            if (textLen > 0) {
                memcpy(result, text.c_str(), textLen);
            }
            result[textLen] = '\0';  // Explicit null termination
            
            return result;
        } catch (const bad_alloc& e) {
            return nullptr;  // Memory allocation failed
        } catch (...) {
            // Any other exception - return empty string
            return returnEmptyString();
        }
    }

    EMSCRIPTEN_KEEPALIVE
    void startSession(char* text) {
        try {
            if (!text) {
                throw invalid_argument("Text cannot be null");
            }
            if (!session) {
                session = new TypingSession();
                if (!session) {
                    throw bad_alloc();
                }
            }
            if (!timer) {
                timer = new Timer();
                if (!timer) {
                    throw bad_alloc();
                }
            }
            string textStr(text);
            if (textStr.empty()) {
                throw invalid_argument("Text cannot be empty");
            }
            session->startSession(textStr);
            timer->start();
        } catch (const invalid_argument& e) {
        } catch (const bad_alloc& e) {
        } catch (...) {
        }
    }

    EMSCRIPTEN_KEEPALIVE
    void updateInput(char* userTyped) {
        try {
            if (!userTyped) {
                throw invalid_argument("Input cannot be null");
            }
            if (session) {
                session->updateInput(string(userTyped));
            }
        } catch (const invalid_argument& e) {
        } catch (...) {
        }
    }

    EMSCRIPTEN_KEEPALIVE
    double getAccuracy() {
        if (session) {
            return session->accuracy();
        }
        return 100.0;
    }

    EMSCRIPTEN_KEEPALIVE
    int getWPM(double secondsElapsed) {
        if (session) {
            return session->wpm(secondsElapsed);
        }
        return 0;
    }

    EMSCRIPTEN_KEEPALIVE
    void resetSession() {
        if (session) {
            session->reset();
        }
        if (timer) {
            timer->stop();
        }
    }

    EMSCRIPTEN_KEEPALIVE
    double getElapsedSeconds() {
        if (timer) {
            return timer->elapsedSeconds();
        }
        return 0.0;
    }
}

