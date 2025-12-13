#ifndef TEXT_GENERATOR_H
#define TEXT_GENERATOR_H

#include <string>
using namespace std;

class TextGenerator {
public:
    virtual string generateText(int count) = 0;
    
    virtual ~TextGenerator() {}
};

#endif

