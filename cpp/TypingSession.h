#ifndef TYPING_SESSION_H
#define TYPING_SESSION_H

#include <string>

class TypingSession {
private:
    std::string targetText;
    std::string userInput;
    int correctChars;
    int totalChars;

public:
    TypingSession();
    void startSession(std::string generatedText);
    void updateInput(std::string typed);
    double accuracy();
    int wpm(double secondsElapsed);
    void reset();
};

#endif

