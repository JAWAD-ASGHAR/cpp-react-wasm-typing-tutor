#include <emscripten.h>
#include <string>
#include <cstring>
#include <cstdlib>
using namespace std;

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
        if (!textGen) {
            textGen = new RandomWordGenerator();
        }
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

