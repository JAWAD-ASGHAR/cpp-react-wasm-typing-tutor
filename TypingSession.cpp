#include "TypingSession.h"
#include <algorithm>
#include <cmath>

TypingSession::TypingSession() {
    targetText = "";
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

void TypingSession::startSession(std::string generatedText) {
    targetText = generatedText;
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

void TypingSession::updateInput(std::string typed) {
    userInput = typed;
    totalChars = typed.length();
    correctChars = 0;

    int minLength = std::min(targetText.length(), typed.length());
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
    // WPM = (correct characters / 5) / (time in minutes)
    double minutes = secondsElapsed / 60.0;
    double wpmValue = (static_cast<double>(correctChars) / 5.0) / minutes;
    return static_cast<int>(std::round(wpmValue));
}

void TypingSession::reset() {
    targetText = "";
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

