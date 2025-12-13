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
        try {
            if (wordCount < 0) {
                throw invalid_argument("Word count cannot be negative");
            }
            if (!textGen) {
                textGen = new RandomWordGenerator();
            }
            string text = textGen->generateText(wordCount);
            if (text.empty() && wordCount > 0) {
                throw runtime_error("Text generation failed");
            }
            char* result = (char*)malloc(text.length() + 1);
            if (!result) {
                throw bad_alloc();
            }
            strcpy(result, text.c_str());
            return result;
        } catch (const invalid_argument& e) {
            char* error = (char*)malloc(1);
            if (error) error[0] = '\0';
            return error;
        } catch (const runtime_error& e) {
            char* error = (char*)malloc(1);
            if (error) error[0] = '\0';
            return error;
        } catch (const bad_alloc& e) {
            return nullptr;
        } catch (...) {
            char* error = (char*)malloc(1);
            if (error) error[0] = '\0';
            return error;
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

