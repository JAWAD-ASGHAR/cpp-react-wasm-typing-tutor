#ifndef WORD_H
#define WORD_H

#include <string>
using namespace std;

class Word {
private:
    string text;
    int length;
    string category;

public:
    Word();
    Word(string wordText, string wordCategory);
    string getText() const;
    int getLength() const;
    string getCategory() const;
    void setText(string wordText);
    bool isValid() const;
};

Word::Word() {
    text = "";
    length = 0;
    category = "general";
}

Word::Word(string wordText, string wordCategory) {
    text = wordText;
    length = wordText.length();
    category = wordCategory;
}

string Word::getText() const {
    return text;
}

int Word::getLength() const {
    return length;
}

string Word::getCategory() const {
    return category;
}

void Word::setText(string wordText) {
    text = wordText;
    length = wordText.length();
}

bool Word::isValid() const {
    return text.length() > 0 && text.length() <= 6;
}

#endif
