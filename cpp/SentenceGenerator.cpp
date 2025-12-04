#include <string>
#include <vector>
#include <random>
#include <sstream>
using namespace std;

// Include base class
#include "TextGenerator.cpp"

// SentenceGenerator inherits from TextGenerator - demonstrates Inheritance
class SentenceGenerator : public TextGenerator {
private:
    vector<string> sentences;  // Encapsulation - private member

public:
    SentenceGenerator();
    // Override virtual function - demonstrates Polymorphism
    string generateText(int count) override;
};

SentenceGenerator::SentenceGenerator() {
    sentences = {
        "The quick brown fox jumps over the lazy dog.",
        "Programming is the art of telling a computer what to do.",
        "Practice makes perfect when learning to type faster.",
        "The sun shines brightly in the clear blue sky.",
        "Reading books helps expand your vocabulary and knowledge.",
        "Technology has changed the way we communicate with others.",
        "Learning new skills requires dedication and consistent effort.",
        "The ocean waves crash against the sandy beach shore.",
        "Music has the power to evoke emotions and memories.",
        "Friendship is built on trust, respect, and understanding.",
        "Exercise is important for maintaining good physical health.",
        "Education opens doors to new opportunities and possibilities.",
        "Nature provides us with beauty, peace, and inspiration.",
        "Cooking is both an art and a science in the kitchen.",
        "Travel allows us to experience different cultures and traditions.",
        "Time management is crucial for achieving personal goals.",
        "Creativity comes from thinking outside the box.",
        "Hard work and perseverance lead to success in life.",
        "Kindness and compassion make the world a better place.",
        "The internet connects people from all around the globe.",
        "Reading improves your writing skills and critical thinking.",
        "Sleep is essential for both physical and mental health.",
        "Hobbies provide relaxation and enjoyment in daily life.",
        "Communication skills are valuable in every profession.",
        "The library is a quiet place for studying and reading.",
        "Art expresses emotions and ideas through visual forms.",
        "Science helps us understand how the world works.",
        "History teaches us lessons from the past.",
        "Mathematics is the language of science and engineering.",
        "Literature reflects the culture and values of society."
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

