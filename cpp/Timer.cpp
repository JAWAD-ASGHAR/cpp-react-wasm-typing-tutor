#include <ctime>
using namespace std;

class Timer {
private:
    clock_t startTime;
    clock_t endTime;
    bool isRunning;

public:
    Timer();
    void start();
    void stop();
    double elapsedSeconds();
};

Timer::Timer() {
    startTime = 0;
    endTime = 0;
    isRunning = false;
}

void Timer::start() {
    startTime = clock();
    isRunning = true;
}

void Timer::stop() {
    if (isRunning) {
        endTime = clock();
        isRunning = false;
    }
}

double Timer::elapsedSeconds() {
    if (isRunning) {
        clock_t current = clock();
        return static_cast<double>(current - startTime) / CLOCKS_PER_SEC;
    } else if (endTime > 0) {
        return static_cast<double>(endTime - startTime) / CLOCKS_PER_SEC;
    }
    return 0.0;
}

