#include <string>
#include <algorithm>
#include <cmath>
using namespace std;

class TypingSession {
private:
    string targetText;
    string userInput;
    int correctChars;
    int totalChars;

public:
    TypingSession();
    void startSession(string generatedText);
    void updateInput(string typed);
    double accuracy();
    int wpm(double secondsElapsed);
    void reset();
};

TypingSession::TypingSession() {
    targetText = "";
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

void TypingSession::startSession(string generatedText) {
    targetText = generatedText;
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

void TypingSession::updateInput(string typed) {
    userInput = typed;
    totalChars = typed.length();
    correctChars = 0;

    int minLength = min(targetText.length(), typed.length());
    for (int i = 0; i < minLength; i++) {
        if (targetText[i] == typed[i]) {
            correctChars++;
        }
    }
}

double TypingSession::accuracy() {
    if (totalChars == 0) {
        return 100.0;
    }
    return (static_cast<double>(correctChars) / static_cast<double>(totalChars)) * 100.0;
}

int TypingSession::wpm(double secondsElapsed) {
    if (secondsElapsed <= 0) {
        return 0;
    }
    double wordSize = 5.0;
    double minutes = secondsElapsed / 60.0;
    double wpmValue = (static_cast<double>(correctChars) / wordSize) / minutes;
    return static_cast<int>(round(wpmValue));
}

void TypingSession::reset() {
    targetText = "";
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

