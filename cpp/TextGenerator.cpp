#ifndef TEXT_GENERATOR_H
#define TEXT_GENERATOR_H

#include <string>
using namespace std;

// Abstract base class - demonstrates Abstraction (4th pillar)
class TextGenerator {
public:
    // Pure virtual function - must be overridden by derived classes
    virtual string generateText(int count) = 0;
    
    // Virtual destructor - important for polymorphism
    virtual ~TextGenerator() {}
};

#endif

