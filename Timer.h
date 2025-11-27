#ifndef TIMER_H
#define TIMER_H

#include <ctime>

class Timer {
private:
    std::clock_t startTime;
    std::clock_t endTime;
    bool isRunning;

public:
    Timer();
    void start();
    void stop();
    double elapsedSeconds();
};

#endif

