#include <string>
#include <algorithm>
#include <cmath>
#include <stdexcept>
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
    try {
        if (totalChars == 0) {
            return 100.0;
        }
        if (totalChars < 0) {
            throw invalid_argument("Total characters cannot be negative");
        }
        if (correctChars < 0) {
            throw invalid_argument("Correct characters cannot be negative");
        }
        if (correctChars > totalChars) {
            throw logic_error("Correct characters cannot exceed total characters");
        }
        return (static_cast<double>(correctChars) / static_cast<double>(totalChars)) * 100.0;
    } catch (const invalid_argument& e) {
        return 0.0;
    } catch (const logic_error& e) {
        return 0.0;
    } catch (...) {
        return 0.0;
    }
}

int TypingSession::wpm(double secondsElapsed) {
    try {
        if (secondsElapsed <= 0) {
            return 0;
        }
        if (secondsElapsed < 0) {
            throw invalid_argument("Time cannot be negative");
        }
        if (correctChars < 0) {
            throw invalid_argument("Correct characters cannot be negative");
        }
        double wordSize = 5.0;
        double minutes = secondsElapsed / 60.0;
        if (minutes <= 0) {
            throw logic_error("Invalid time calculation");
        }
        double wpmValue = (static_cast<double>(correctChars) / wordSize) / minutes;
        if (wpmValue < 0) {
            throw logic_error("WPM cannot be negative");
        }
        return static_cast<int>(round(wpmValue));
    } catch (const invalid_argument& e) {
        return 0;
    } catch (const logic_error& e) {
        return 0;
    } catch (...) {
        return 0;
    }
}

void TypingSession::reset() {
    targetText = "";
    userInput = "";
    correctChars = 0;
    totalChars = 0;
}

