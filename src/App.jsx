import { useState, useEffect, useRef } from 'react';
import { loadWasm } from './wasmLoader';
import { FiRefreshCw, FiClock, FiTarget, FiTrendingUp } from 'react-icons/fi';

function App() {
  const [wasm, setWasm] = useState(null);
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const textContainerRef = useRef(null);

  useEffect(() => {
    loadWasm().then((wasmFunctions) => {
      setWasm(wasmFunctions);
    });
  }, []);

  useEffect(() => {
    if (isTestActive && !isTestComplete) {
      intervalRef.current = setInterval(() => {
        if (wasm) {
          const elapsed = wasm.getElapsedSeconds();
          setTimer(elapsed);
          const currentWpm = wasm.getWPM(elapsed);
          setWpm(currentWpm);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTestActive, isTestComplete, wasm]);

  // Auto-scroll to current character
  useEffect(() => {
    if (isTestActive && textContainerRef.current) {
      const currentChar = textContainerRef.current.querySelector('.char.current');
      if (currentChar) {
        currentChar.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [userInput.length, isTestActive]);

  const startTest = () => {
    if (!wasm) return;

    const generatedText = wasm.generateText(25);
    setTargetText(generatedText);
    setUserInput('');
    setIsTestActive(true);
    setIsTestComplete(false);
    setTimer(0);
    setAccuracy(100);
    setWpm(0);
    setCorrectChars(0);
    setTotalChars(0);

    wasm.startSession(generatedText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    if (!isTestActive || isTestComplete) return;

    const typed = e.target.value;
    setUserInput(typed);
    setTotalChars(typed.length);

    if (wasm) {
      wasm.updateInput(typed);
      const acc = wasm.getAccuracy();
      setAccuracy(acc);
      const correct = Math.round((acc / 100) * typed.length);
      setCorrectChars(correct);
    }

    if (typed.length >= targetText.length) {
      finishTest();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isTestActive) {
      finishTest();
    }
  };

  const finishTest = () => {
    setIsTestActive(false);
    setIsTestComplete(true);
    
    if (wasm) {
      const elapsed = wasm.getElapsedSeconds();
      const finalWpm = wasm.getWPM(elapsed);
      setWpm(finalWpm);
      setTimer(elapsed);
    }
  };

  const retry = () => {
    if (wasm) {
      wasm.resetSession();
    }
    setTargetText('');
    setUserInput('');
    setIsTestActive(false);
    setIsTestComplete(false);
    setTimer(0);
    setAccuracy(100);
    setWpm(0);
    setCorrectChars(0);
    setTotalChars(0);
  };

  const renderText = () => {
    if (!targetText) return null;

    // Split text into words to preserve word boundaries
    const words = targetText.split(' ');
    let charIndex = 0;

    return words.map((word, wordIndex) => {
      const wordChars = word.split('').map((char) => {
        const index = charIndex++;
        let className = 'inline transition-all duration-150 ease-in relative';
        
        if (index < userInput.length) {
          if (char === userInput[index]) {
            className += ' text-text-primary animate-correct-pulse';
          } else {
            className += ' text-incorrect bg-[rgba(202,71,84,0.15)] border-b-2 border-incorrect animate-incorrect-shake';
          }
        } else if (index === userInput.length) {
          className += ' char current bg-[rgba(226,183,20,0.2)] border-l-2 border-accent animate-blink';
        } else {
          className += ' text-text-secondary';
        }

        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      });

      const result = [];
      
      // Wrap word in a span - this keeps the word together when wrapping
      result.push(
        <span key={`word-${wordIndex}`} className="inline-block">
          {wordChars}
        </span>
      );
      
      // Add space after word (except last word) - spaces allow wrapping to next line
      if (wordIndex < words.length - 1) {
        const spaceIndex = charIndex++;
        let spaceClassName = 'inline transition-all duration-150 ease-in relative';
        
        if (spaceIndex < userInput.length) {
          if (' ' === userInput[spaceIndex]) {
            spaceClassName += ' text-text-primary animate-correct-pulse';
          } else {
            spaceClassName += ' text-incorrect bg-[rgba(202,71,84,0.15)] border-b-2 border-incorrect animate-incorrect-shake';
          }
        } else if (spaceIndex === userInput.length) {
          spaceClassName += ' char current bg-[rgba(226,183,20,0.2)] border-l-2 border-accent animate-blink';
        } else {
          spaceClassName += ' text-text-secondary';
        }

        result.push(
          <span key={spaceIndex} className={spaceClassName + ' inline-block'}> </span>
        );
      }

      return result;
    }).flat();
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono flex justify-center items-center p-5 transition-colors duration-300">
      <div className="max-w-[1000px] w-full flex flex-col gap-5 animate-fade-in">
        {/* Header */}
        <header className="flex justify-center py-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight transition-colors duration-300">
              typetutor
            </span>
            <span className="text-xs text-text-secondary uppercase tracking-widest font-medium">
              wasm
            </span>
          </div>
        </header>

        {/* Main Stats Bar */}
        {isTestActive && (
          <div className="flex justify-center gap-5 md:gap-10 py-4 md:py-5 animate-slide-down">
            <div className="flex items-center gap-2 text-text-secondary text-xs md:text-sm">
              <FiClock className="w-[18px] h-[18px] text-text-tertiary" />
              <span className="text-base md:text-xl font-semibold text-text-primary min-w-[40px] md:min-w-[50px]">
                {timer.toFixed(1)}s
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-xs md:text-sm">
              <FiTrendingUp className="w-[18px] h-[18px] text-text-tertiary" />
              <span className="text-base md:text-xl font-semibold text-text-primary min-w-[40px] md:min-w-[50px]">
                {Math.round(wpm)}
              </span>
              <span className="text-xs text-text-tertiary uppercase tracking-wide">
                wpm
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-xs md:text-sm">
              <FiTarget className="w-[18px] h-[18px] text-text-tertiary" />
              <span className="text-base md:text-xl font-semibold text-text-primary min-w-[40px] md:min-w-[50px]">
                {accuracy.toFixed(0)}%
              </span>
              <span className="text-xs text-text-tertiary uppercase tracking-wide">
                acc
              </span>
            </div>
          </div>
        )}

        {/* Language Label */}
        {targetText && (
          <div className="text-center text-sm text-text-tertiary uppercase tracking-widest -mb-2.5">
            english
          </div>
        )}

        {/* Text Display Area */}
        <div 
          className="bg-bg-secondary rounded-lg px-5 py-8 md:px-8 md:py-10 min-h-[180px] md:min-h-[200px] flex items-center justify-center cursor-text transition-colors duration-300 relative overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2"
          onClick={() => {
            if (isTestActive || targetText) {
              inputRef.current?.focus();
            }
          }}
        >
          {targetText ? (
            <div 
              ref={textContainerRef}
              className="text-xl md:text-2xl leading-[1.8] md:leading-[2] tracking-wide text-text-secondary select-none w-full text-left overflow-x-hidden transition-all duration-200 scroll-smooth whitespace-normal"
              style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
            >
              {renderText()}
            </div>
          ) : (
            <div className="text-center text-text-tertiary text-lg leading-[1.8]">
              <p className="my-2">Click the button below to start a typing test</p>
              <p className="text-sm opacity-70">Press Space or Enter to begin</p>
            </div>
          )}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!isTestActive}
          className="absolute opacity-0 pointer-events-none w-0 h-0 border-0 bg-transparent outline-none text-transparent"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 py-5">
          {!isTestActive && !isTestComplete && (
            <button 
              onClick={startTest} 
              className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-md cursor-pointer transition-all duration-200 font-mono bg-accent text-bg-primary border border-accent font-semibold hover:bg-[#f5c842] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(226,183,20,0.3)] active:translate-y-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  startTest();
                }
              }}
            >
              <FiRefreshCw className="w-[18px] h-[18px]" />
              Start Test
            </button>
          )}
          
          {isTestComplete && (
            <div className="flex flex-col items-center gap-5 animate-fade-in-up">
              <div className="flex gap-5 md:gap-10 py-5">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-text-tertiary uppercase tracking-widest">
                    wpm
                  </span>
                  <span className="text-2xl md:text-[2rem] font-bold text-accent">
                    {Math.round(wpm)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-text-tertiary uppercase tracking-widest">
                    acc
                  </span>
                  <span className="text-2xl md:text-[2rem] font-bold text-accent">
                    {accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-text-tertiary uppercase tracking-widest">
                    time
                  </span>
                  <span className="text-2xl md:text-[2rem] font-bold text-accent">
                    {timer.toFixed(1)}s
                  </span>
                </div>
              </div>
              <button 
                onClick={retry} 
                className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-md cursor-pointer transition-all duration-200 font-mono bg-transparent text-text-primary border border-text-secondary hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0"
              >
                <FiRefreshCw className="w-[18px] h-[18px]" />
                Try Again
              </button>
            </div>
          )}

          {isTestActive && (
            <button 
              onClick={retry} 
              className="p-3 w-11 h-11 flex items-center justify-center bg-bg-tertiary border border-text-tertiary text-text-primary rounded-md cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0" 
              title="Restart (Tab + Enter)"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>

        {/* Footer Hints */}
        <footer className="flex justify-center py-5 mt-auto">
          <div className="text-xs text-text-tertiary flex flex-col md:flex-row gap-2 md:gap-5 text-center">
            <span>
              <span className="bg-bg-tertiary px-2 py-1 rounded font-mono mr-2 text-text-secondary border border-text-tertiary">
                esc
              </span>
              - finish test
            </span>
            <span>
              <span className="bg-bg-tertiary px-2 py-1 rounded font-mono mr-2 text-text-secondary border border-text-tertiary">
                tab + enter
              </span>
              - restart
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
