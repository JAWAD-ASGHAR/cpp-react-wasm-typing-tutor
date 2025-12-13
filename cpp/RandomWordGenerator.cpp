#include <string>
#include <vector>
#include <random>
#include <sstream>
#include <stdexcept>
using namespace std;

#include "TextGenerator.cpp"
#include "Word.cpp"

class RandomWordGenerator : public TextGenerator {
private:
    vector<Word> words;  

public:
    RandomWordGenerator();
    string generateText(int count) override;
};

RandomWordGenerator::RandomWordGenerator() {
    vector<string> wordStrings = {
        "apple", "green", "river", "monkey", "blue", "fast", "water", "light",
        "happy", "quiet", "small", "warm", "black", "white", "brown", "pink",
        "paper", "chair", "table", "phone", "music", "dance", "think", "learn",
        "teach", "write", "speak", "watch", "build", "start", "finish", "begin",
        "close", "open", "clean", "dirty", "fresh", "sweet", "sharp", "smooth",
        "rough", "quick", "slow", "early", "late", "young", "old", "new",
        "right", "left", "front", "back", "above", "below", "under", "over",
        "after", "before", "today", "night", "morning", "evening", "week", "month",
        "king", "queen", "peace", "brave", "smart", "funny", "kind", "calm",
        "clear", "cloud", "earth", "wind", "ocean", "beach", "island", "forest",
        "valley", "river", "stream", "pond", "lake", "ship", "boat", "sail",
        "crew", "map", "path", "road", "trail", "track", "train", "bus",
        "stop", "driver", "seat", "window", "flight", "pilot", "city", "town",
        "street", "corner", "sign", "shop", "store", "market", "buyer", "cash",
        "price", "sale", "offer", "deal", "brand", "model", "choice", "select",
        "pick", "need", "want", "buy", "order", "ship", "mail", "box",
        "crate", "plant", "tool", "gear", "bed", "pillow", "blanket", "sheet",
        "cover", "rug", "mat", "lamp", "bulb", "fan", "broom", "mop",
        "bucket", "trash", "bin", "can", "waste", "nature", "wild", "animal",
        "insect", "bug", "bee", "ant", "snake", "frog", "lion", "tiger",
        "bear", "zebra", "goat", "sheep", "cow", "bull", "horse", "rabbit",
        "rat", "mouse", "pig", "bat", "owl", "eagle", "hawk", "crow",
        "duck", "goose", "swan", "crane", "whale", "shark", "seal", "crab",
        "fish", "bird", "dog", "cat", "tree", "flower", "grass", "leaf",
        "fruit", "berry", "grain", "bread", "milk", "juice", "food", "meal",
        "break", "lunch", "dinner", "taste", "smell", "touch", "sound", "voice",
        "laugh", "smile", "cry", "shout", "whisper", "sing", "dance", "jump",
        "run", "walk", "swim", "climb", "fall", "rise", "stand", "sit",
        "sleep", "wake", "dream", "hope", "fear", "love", "hate", "like",
        "know", "think", "feel", "see", "hear", "find", "lose", "keep",
        "give", "take", "send", "bring", "carry", "push", "pull", "throw",
        "catch", "drop", "break", "fix", "make", "do", "work", "play",
        "game", "fun", "time", "day", "year", "hour", "minute", "second"
    };
    
    words.clear();
    for (const string& wordStr : wordStrings) {
        words.push_back(Word(wordStr, "general"));
    }
}

string RandomWordGenerator::generateText(int count) {
    try {
        if (count <= 0) {
            throw invalid_argument("Word count must be positive");
        }
        
        if (words.empty()) {
            throw runtime_error("Word list is empty");
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
            if (randomIndex < 0 || randomIndex >= words.size()) {
                throw out_of_range("Invalid word index");
            }
            Word selectedWord = words[randomIndex];
            if (!selectedWord.isValid()) {
                throw runtime_error("Invalid word object");
            }
            result << selectedWord.getText();
        }

        return result.str();
    } catch (const invalid_argument& e) {
        return "";
    } catch (const runtime_error& e) {
        return "";
    } catch (const out_of_range& e) {
        return "";
    } catch (...) {
        return "";
    }
}

