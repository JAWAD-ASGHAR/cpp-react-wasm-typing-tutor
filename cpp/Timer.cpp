#include "Timer.h"
#include <ctime>

Timer::Timer() {
    startTime = 0;
    endTime = 0;
    isRunning = false;
}

void Timer::start() {
    startTime = std::clock();
    isRunning = true;
}

void Timer::stop() {
    if (isRunning) {
        endTime = std::clock();
        isRunning = false;
    }
}

double Timer::elapsedSeconds() {
    if (isRunning) {
        std::clock_t current = std::clock();
        return static_cast<double>(current - startTime) / CLOCKS_PER_SEC;
    } else if (endTime > 0) {
        return static_cast<double>(endTime - startTime) / CLOCKS_PER_SEC;
    }
    return 0.0;
}

