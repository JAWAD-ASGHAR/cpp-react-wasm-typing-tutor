#include <string>
#include <vector>
#include <random>
#include <sstream>
using namespace std;

#include "TextGenerator.cpp"

class SentenceGenerator : public TextGenerator {
private:
    vector<string> sentences;  

public:
    SentenceGenerator();
    string generateText(int count) override;
};

SentenceGenerator::SentenceGenerator() {
    sentences = {
        "The quick brown fox jumps over the lazy dog.",
        "I like to read books in the quiet room.",
        "The sun shines bright in the blue sky.",
        "She walks to the store every day.",
        "We play games and have fun together.",
        "The cat sits on the soft chair.",
        "He writes words on clean paper.",
        "They swim in the cool water.",
        "Birds fly high in the clear sky.",
        "The dog runs fast in the green field.",
        "I drink fresh milk every morning.",
        "She sings songs with a sweet voice.",
        "We eat good food at the table.",
        "The tree grows tall in the forest.",
        "He finds peace in the quiet place.",
        "They learn new things every day.",
        "The boat sails on the blue ocean.",
        "I sleep well in my warm bed.",
        "She makes bread in the kitchen.",
        "We watch birds fly in the sky.",
        "The cat sits near the window.",
        "He reads books in the library.",
        "They walk along the quiet street.",
        "The sun rises early in the morning.",
        "I write words with a black pen.",
        "She plays music on the old piano.",
        "We see stars shine in the dark night.",
        "The dog barks loud in the yard.",
        "He finds joy in simple things.",
        "They share food with happy friends."
    };
}

string SentenceGenerator::generateText(int count) {
    if (count <= 0 || sentences.empty()) {
        return "";
    }

    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(0, sentences.size() - 1);

    ostringstream result;
    for (int i = 0; i < count; i++) {
        if (i > 0) {
            result << " ";
        }
        int randomIndex = dis(gen);
        result << sentences[randomIndex];
    }

    return result.str();
}

