#include <string>
#include <vector>
#include <random>
#include <sstream>
#include <cctype>
using namespace std;

// Include base class
#include "TextGenerator.cpp"

// MixedCaseGenerator inherits from TextGenerator - demonstrates Inheritance
class MixedCaseGenerator : public TextGenerator {
private:
    vector<string> words;  // Encapsulation - private member

public:
    MixedCaseGenerator();
    // Override virtual function - demonstrates Polymorphism
    string generateText(int count) override;
    
private:
    // Helper method - demonstrates Encapsulation
    string randomizeCase(const string& word);
};

MixedCaseGenerator::MixedCaseGenerator() {
    words = {
        "apple", "green", "river", "monkey", "blue", "fast", "car", "laptop",
        "computer", "keyboard", "mouse", "screen", "window", "door", "house",
        "tree", "flower", "bird", "dog", "cat", "fish", "water", "fire",
        "earth", "wind", "cloud", "sun", "moon", "star", "light", "dark",
        "happy", "sad", "angry", "calm", "quiet", "loud", "big", "small",
        "hot", "cold", "warm", "cool", "red", "yellow", "orange", "purple",
        "black", "white", "gray", "brown", "pink", "book", "paper", "pen",
        "pencil", "desk", "chair", "table", "phone", "music", "song", "dance",
        "run", "walk", "jump", "fly", "swim", "eat", "drink", "sleep", "wake",
        "think", "learn", "teach", "read", "write", "speak", "listen", "see",
        "look", "watch", "find", "search", "create", "build", "make", "do",
        "work", "play", "game", "fun", "time", "day", "night", "morning",
        "evening", "week", "month", "year", "today", "tomorrow", "yesterday"
    };
}

string MixedCaseGenerator::randomizeCase(const string& word) {
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(0, 1);
    
    string result = word;
    for (char& c : result) {
        if (dis(gen) == 0) {
            c = toupper(c);
        } else {
            c = tolower(c);
        }
    }
    return result;
}

string MixedCaseGenerator::generateText(int count) {
    if (count <= 0 || words.empty()) {
        return "";
    }

    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(0, words.size() - 1);

    ostringstream result;
    for (int i = 0; i < count; i++) {
        if (i > 0) {
            result << " ";
        }
        int randomIndex = dis(gen);
        result << randomizeCase(words[randomIndex]);
    }

    return result.str();
}

