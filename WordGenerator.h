#ifndef WORD_GENERATOR_H
#define WORD_GENERATOR_H

#include <string>
#include <vector>

class WordGenerator {
private:
    std::vector<std::string> words;

public:
    WordGenerator();
    std::string generateText(int wordCount);
};

#endif

