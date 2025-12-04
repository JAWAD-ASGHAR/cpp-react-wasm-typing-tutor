#include <emscripten.h>
#include <string>
#include <cstring>
#include <cstdlib>
using namespace std;

// Include class definitions from their .cpp files
#include "TextGenerator.cpp"
#include "RandomWordGenerator.cpp"
#include "SentenceGenerator.cpp"
#include "MixedCaseGenerator.cpp"
#include "TypingSession.cpp"
#include "Timer.cpp"

// Global instances - using base class pointer for Polymorphism
TextGenerator* textGen = nullptr;  // Polymorphism - base class pointer
TypingSession* session = nullptr;
Timer* timer = nullptr;

// Generator type enum
enum GeneratorType {
    RANDOM_WORDS = 0,
    SENTENCES = 1,
    MIXED_CASE = 2
};

extern "C" {
    // Switch generator type - demonstrates Polymorphism
    EMSCRIPTEN_KEEPALIVE
    void setGeneratorType(int type) {
        // Delete old generator if exists
        if (textGen) {
            delete textGen;
            textGen = nullptr;
        }
        
        // Create new generator based on type - Polymorphism in action
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
        // Default to random words if not set
        if (!textGen) {
            textGen = new RandomWordGenerator();
        }
        // Polymorphism - calling virtual function through base class pointer
        string text = textGen->generateText(wordCount);
        char* result = (char*)malloc(text.length() + 1);
        strcpy(result, text.c_str());
        return result;
    }

    EMSCRIPTEN_KEEPALIVE
    void startSession(char* text) {
        if (!session) {
            session = new TypingSession();
        }
        if (!timer) {
            timer = new Timer();
        }
        session->startSession(string(text));
        timer->start();
    }

    EMSCRIPTEN_KEEPALIVE
    void updateInput(char* userTyped) {
        if (session) {
            session->updateInput(string(userTyped));
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

