#include "WordGenerator.h"
#include <random>
#include <sstream>
#include <algorithm>

WordGenerator::WordGenerator() {
    // Embedded word list
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

std::string WordGenerator::generateText(int wordCount) {
    if (wordCount <= 0 || words.empty()) {
        return "";
    }

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, words.size() - 1);

    std::ostringstream result;
    for (int i = 0; i < wordCount; i++) {
        if (i > 0) {
            result << " ";
        }
        int randomIndex = dis(gen);
        result << words[randomIndex];
    }

    return result.str();
}

