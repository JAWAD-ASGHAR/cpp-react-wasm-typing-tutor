#include <emscripten.h>
#include <string>
#include <cstring>
#include <cstdlib>
using namespace std;

// Include class definitions from their .cpp files
#include "WordGenerator.cpp"
#include "TypingSession.cpp"
#include "Timer.cpp"

// Global instances
WordGenerator* wordGen = nullptr;
TypingSession* session = nullptr;
Timer* timer = nullptr;

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    char* generateText(int wordCount) {
        if (!wordGen) {
            wordGen = new WordGenerator();
        }
        string text = wordGen->generateText(wordCount);
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

