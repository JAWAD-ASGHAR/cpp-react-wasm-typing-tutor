import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { loadWasm } from '../wasmLoader';
import { FiRefreshCw, FiClock, FiTarget, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaRegKeyboard } from 'react-icons/fa6';
import NameInputModal from '../components/NameInputModal';
import UsernameButton from '../components/UsernameButton';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';

// Generator type constants matching C++ enum
const GENERATOR_TYPES = {
  RANDOM_WORDS: 0,
  SENTENCES: 1,
  MIXED_CASE: 2
};

const GENERATOR_LABELS = {
  [GENERATOR_TYPES.RANDOM_WORDS]: 'Random Words',
  [GENERATOR_TYPES.SENTENCES]: 'Sentences',
  [GENERATOR_TYPES.MIXED_CASE]: 'Mixed Case'
};

export default function TypingTest() {
  const [wasm, setWasm] = useState(null);
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [timer, setTimer] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [currentBestScore, setCurrentBestScore] = useState(null);
  const [scoreUpdateStatus, setScoreUpdateStatus] = useState(null);
  const [generatorType, setGeneratorType] = useState(GENERATOR_TYPES.RANDOM_WORDS);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const textContainerRef = useRef(null);

  // Helper function to get appropriate count based on generator type
  const getTextCount = (type) => {
    switch (type) {
      case GENERATOR_TYPES.SENTENCES:
        return 3; // 3 sentences is a good length for typing test
      case GENERATOR_TYPES.MIXED_CASE:
        return 25; // Same as random words
      case GENERATOR_TYPES.RANDOM_WORDS:
      default:
        return 25; // 25 words is standard
    }
  };

  useEffect(() => {
    loadWasm().then((wasmFunctions) => {
      setWasm(wasmFunctions);
      // Initialize generator type to random words
      wasmFunctions.setGeneratorType(GENERATOR_TYPES.RANDOM_WORDS);
    });
  }, []);

  // Update generator type when selection changes
  useEffect(() => {
    if (wasm && !isTestActive) {
      wasm.setGeneratorType(generatorType);
    }
  }, [generatorType, wasm, isTestActive]);

  const restartTest = () => {
    if (!wasm) return;
    
    if (wasm) {
      wasm.resetSession();
      // Ensure generator type is set before generating text
      wasm.setGeneratorType(generatorType);
    }
    setCurrentBestScore(null);
    setScoreUpdateStatus(null);
    setShowNameModal(false);
    
    const textCount = getTextCount(generatorType);
    const generatedText = wasm.generateText(textCount);
    setTargetText(generatedText);
    setUserInput('');
    setIsTestActive(true);
    setIsTestComplete(false);
    setHasStartedTyping(false);
    setTimer(0);
    setAccuracy(100);
    setWpm(0);
    setCorrectChars(0);
    setTotalChars(0);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Global Enter key handler to start/restart test (when not active or after completion)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' && 
          wasm &&
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA' &&
          e.target.tagName !== 'BUTTON' &&
          (!isTestActive || isTestComplete)) {
        e.preventDefault();
        restartTest();
      }
      
      // Tab key to restart during active test
      if (e.key === 'Tab' && 
          wasm &&
          isTestActive && 
          !isTestComplete &&
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA' &&
          e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        restartTest();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [wasm, isTestActive, isTestComplete]);

  useEffect(() => {
    if (isTestActive && hasStartedTyping && !isTestComplete) {
      intervalRef.current = setInterval(() => {
        if (wasm) {
          const elapsed = wasm.getElapsedSeconds();
          setTimer(elapsed);
          const currentWpm = wasm.getWPM(elapsed);
          setWpm(currentWpm);
          
          // Automatically finish test after 60 seconds
          if (elapsed >= 60) {
            finishTest();
          }
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
  }, [isTestActive, hasStartedTyping, isTestComplete, wasm]);

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

    // Ensure generator type is set before generating text
    wasm.setGeneratorType(generatorType);
    const textCount = getTextCount(generatorType);
    const generatedText = wasm.generateText(textCount);
    setTargetText(generatedText);
    setUserInput('');
    setIsTestActive(true);
    setIsTestComplete(false);
    setHasStartedTyping(false);
    setTimer(0);
    setAccuracy(100);
    setWpm(0);
    setCorrectChars(0);
    setTotalChars(0);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    if (!isTestActive || isTestComplete) return;

    let typed = e.target.value;
    
    // Normalize input for mobile keyboards - remove any non-printable characters that might slip in
    // Keep only printable characters and preserve spaces
    typed = typed.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    if (!hasStartedTyping && typed.length > 0) {
      setHasStartedTyping(true);
      if (wasm && targetText) {
        wasm.startSession(targetText);
      }
    }

    setUserInput(typed);
    setTotalChars(typed.length);

    if (wasm && hasStartedTyping) {
      wasm.updateInput(typed);
      const acc = wasm.getAccuracy();
      setAccuracy(acc);
      const correct = Math.round((acc / 100) * typed.length);
      setCorrectChars(correct);
    }

    // Automatically finish test when all text is typed
    if (typed.length >= targetText.length) {
      finishTest();
    }
  };

  const handleInputKeyDown = (e) => {
    // Tab key to restart during active test
    if (e.key === 'Tab' && isTestActive && !isTestComplete && wasm) {
      e.preventDefault();
      restartTest();
    }
  };

  const finishTest = async () => {
    setIsTestActive(false);
    setIsTestComplete(true);
    
    // Calculate final values directly from WASM or use current state
    let finalWpm = 0;
    let finalAccuracy = 100;
    let finalTime = 0;
    
    if (wasm && hasStartedTyping) {
      const elapsed = wasm.getElapsedSeconds();
      finalWpm = Math.round(wasm.getWPM(elapsed));
      finalAccuracy = parseFloat(wasm.getAccuracy().toFixed(1));
      finalTime = parseFloat(elapsed.toFixed(1));
      setWpm(finalWpm);
      setTimer(elapsed);
      setAccuracy(finalAccuracy);
    } else {
      // Use current state values if test wasn't started properly
      finalWpm = Math.round(wpm);
      finalAccuracy = parseFloat(accuracy.toFixed(1));
      finalTime = parseFloat(timer.toFixed(1));
      setTimer(0);
      setWpm(0);
      setHasStartedTyping(false);
    }

    const savedUsername = localStorage.getItem('typingTutor_username');
    if (savedUsername && isLeaderboardEnabled && hasStartedTyping) {

      const { data: existingScores, error: queryError } = await supabase
        .from('leaderboard')
        .select('wpm, accuracy, time')
        .eq('username', savedUsername)
        .order('wpm', { ascending: false })
        .order('accuracy', { ascending: false })
        .order('time', { ascending: true });

      const isBetterScore = (newScore, existingScore) => {
        if (newScore.wpm > existingScore.wpm) return true;
        if (newScore.wpm < existingScore.wpm) return false;
        if (newScore.accuracy > existingScore.accuracy) return true;
        if (newScore.accuracy < existingScore.accuracy) return false;
        return newScore.time < existingScore.time;
      };

      // Always save the score to the database
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([
          {
            username: savedUsername,
            wpm: finalWpm,
            accuracy: finalAccuracy,
            time: finalTime,
            created_at: new Date().toISOString(),
          },
        ]);

      if (!insertError) {
        // Determine status by comparing with best score
        if (!queryError && existingScores && existingScores.length > 0) {
          const bestScore = existingScores.reduce((best, current) => {
            return isBetterScore(current, best) ? current : best;
          }, existingScores[0]);

          setCurrentBestScore(bestScore.wpm);

          const newScore = { wpm: finalWpm, accuracy: finalAccuracy, time: finalTime };
          
          if (isBetterScore(newScore, bestScore)) {
            setScoreUpdateStatus('improved');
          } else if (finalWpm < bestScore.wpm || 
                     (finalWpm === bestScore.wpm && finalAccuracy < bestScore.accuracy) ||
                     (finalWpm === bestScore.wpm && finalAccuracy === bestScore.accuracy && finalTime > bestScore.time)) {
            setScoreUpdateStatus('worse');
          } else {
            setScoreUpdateStatus('same');
          }
        } else {
          setCurrentBestScore(finalWpm);
          setScoreUpdateStatus('new');
        }
      } else {
        console.error('Error saving score:', insertError);
      }
    }

    setShowNameModal(true);
  };

  const handleSubmitScore = async (username) => {
    if (!isLeaderboardEnabled) {
      console.warn('Leaderboard is not configured. Score not saved.');
      setShowNameModal(false);
      return;
    }

    try {
      const finalWpm = Math.round(wpm);
      const finalAccuracy = parseFloat(accuracy.toFixed(1));
      const finalTime = parseFloat(timer.toFixed(1));

      localStorage.setItem('typingTutor_username', username);

      const isBetterScore = (newScore, existingScore) => {
        if (newScore.wpm > existingScore.wpm) return true;
        if (newScore.wpm < existingScore.wpm) return false;
        if (newScore.accuracy > existingScore.accuracy) return true;
        if (newScore.accuracy < existingScore.accuracy) return false;
        return newScore.time < existingScore.time;
      };

      const { data: existingScores, error: queryError } = await supabase
        .from('leaderboard')
        .select('wpm, accuracy, time')
        .eq('username', username)
        .order('wpm', { ascending: false })
        .order('accuracy', { ascending: false })
        .order('time', { ascending: true });

      if (queryError) throw queryError;

      const newScore = { wpm: finalWpm, accuracy: finalAccuracy, time: finalTime };

      if (existingScores && existingScores.length > 0) {
        const bestScore = existingScores.reduce((best, current) => {
          return isBetterScore(current, best) ? current : best;
        }, existingScores[0]);

        setCurrentBestScore(bestScore.wpm);

        if (isBetterScore(newScore, bestScore)) {
          const { error } = await supabase
            .from('leaderboard')
            .insert([
              {
                username: username,
                wpm: finalWpm,
                accuracy: finalAccuracy,
                time: finalTime,
                created_at: new Date().toISOString(),
              },
            ]);

          if (error) throw error;
          setScoreUpdateStatus('improved');
        } else if (finalWpm < bestScore.wpm || 
                   (finalWpm === bestScore.wpm && finalAccuracy < bestScore.accuracy) ||
                   (finalWpm === bestScore.wpm && finalAccuracy === bestScore.accuracy && finalTime > bestScore.time)) {
          setScoreUpdateStatus('worse');
        } else {
          setScoreUpdateStatus('same');
        }
      } else {
        const { error } = await supabase
          .from('leaderboard')
          .insert([
            {
              username: username,
              wpm: finalWpm,
              accuracy: finalAccuracy,
              time: finalTime,
              created_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
        setCurrentBestScore(finalWpm);
        setScoreUpdateStatus('new');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert(`Failed to submit score: ${error.message || 'Please check your Supabase configuration.'}`);
    } finally {
      setShowNameModal(false);
    }
  };


  const retry = () => {
    restartTest();
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
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono flex justify-center items-center p-3 sm:p-4 md:p-5 transition-colors duration-300">
      <div className="max-w-[1000px] w-full flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fade-in">
        {/* Header */}
        <header className="flex justify-between items-center py-3 sm:py-4 md:py-5">
          <div className="flex-1 flex justify-start items-center min-w-0">
            <UsernameButton />
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0 px-2">
            <Link to="/" className="flex flex-col items-center gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FaRegKeyboard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-accent flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary tracking-tight transition-colors duration-300">
                  typetutor
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest font-medium">
                wasm
              </span>
            </Link>
          </div>
          <div className="flex-1 flex justify-end items-center min-w-0">
            <Link
              to="/leaderboard"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-text-secondary hover:text-text-primary transition-colors"
              title="View Leaderboard"
            >
              <FiAward className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Leaderboard</span>
            </Link>
          </div>
        </header>

        {/* Main Stats Bar - Only show when typing has started */}
        {isTestActive && hasStartedTyping && (
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-10 py-3 sm:py-4 md:py-5 animate-slide-down">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-secondary text-xs sm:text-sm">
              <FiClock className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-text-tertiary flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-xl font-semibold text-text-primary min-w-[35px] sm:min-w-[40px] md:min-w-[50px] text-right">
                {timer.toFixed(1)}s
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-secondary text-xs sm:text-sm">
              <FiTrendingUp className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-text-tertiary flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-xl font-semibold text-text-primary min-w-[35px] sm:min-w-[40px] md:min-w-[50px] text-right">
                {Math.round(wpm)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-secondary text-xs sm:text-sm">
              <FiTarget className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-text-tertiary flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-xl font-semibold text-text-primary min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-right">
                {accuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Generator Type Selector - Only show when test is not active */}
        {!isTestActive && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-4">
            <label className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-widest mb-0.5 sm:mb-1">
              Text Type
            </label>
            <div className="flex gap-1 sm:gap-2 bg-bg-secondary rounded-lg p-0.5 sm:p-1 border border-text-tertiary w-full max-w-md">
              {Object.entries(GENERATOR_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setGeneratorType(Number(type))}
                  disabled={isTestActive}
                  className={`flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                    generatorType === Number(type)
                      ? 'bg-accent text-bg-primary shadow-md'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  } ${isTestActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">
                    {label === 'Random Words' ? 'Words' : label === 'Mixed Case' ? 'Mixed' : label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Language Label */}
        {targetText && (
          <div className="text-center text-xs sm:text-sm text-text-tertiary uppercase tracking-widest -mb-2 sm:-mb-2.5 px-2">
            <span className="hidden sm:inline">{GENERATOR_LABELS[generatorType].toLowerCase()} • english</span>
            <span className="sm:hidden">
              {GENERATOR_LABELS[generatorType] === 'Random Words' ? 'words' : GENERATOR_LABELS[generatorType] === 'Mixed Case' ? 'mixed' : GENERATOR_LABELS[generatorType].toLowerCase()} • en
            </span>
          </div>
        )}

        {/* Text Display Area */}
        <div 
          className="bg-bg-secondary rounded-lg px-3 py-6 sm:px-4 sm:py-7 md:px-5 md:py-8 lg:px-8 lg:py-10 min-h-[150px] sm:min-h-[180px] md:min-h-[200px] flex items-center justify-center cursor-text transition-colors duration-300 relative overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-1 sm:focus-within:outline-offset-2"
          onClick={() => {
            if (isTestActive || targetText) {
              inputRef.current?.focus();
            }
          }}
        >
          {targetText ? (
            <div 
              ref={textContainerRef}
              className="text-base sm:text-lg md:text-xl lg:text-2xl leading-[1.6] sm:leading-[1.7] md:leading-[1.8] lg:leading-[2] tracking-wide text-text-secondary select-none w-full text-left overflow-x-hidden transition-all duration-200 scroll-smooth whitespace-normal"
              style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
            >
              {renderText()}
            </div>
          ) : (
            <div className="text-center text-text-tertiary text-sm sm:text-base md:text-lg leading-[1.6] sm:leading-[1.8] px-2">
              <p className="my-1 sm:my-2">Click the button below to start a typing test</p>
              <p className="text-xs sm:text-sm opacity-70">Press Space or Enter to begin</p>
            </div>
          )}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onCompositionStart={(e) => {
            // Prevent composition events from interfering
            e.stopPropagation();
          }}
          onCompositionEnd={(e) => {
            // Handle composition end (for mobile keyboards)
            e.stopPropagation();
            if (e.target.value !== userInput) {
              handleInputChange(e);
            }
          }}
          disabled={!isTestActive}
          className="absolute opacity-0 pointer-events-none w-0 h-0 border-0 bg-transparent outline-none text-transparent"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="text"
          enterKeyHint="done"
        />

        {/* Controls */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-5">
          {!isTestActive && !isTestComplete && (
            <button 
              onClick={startTest} 
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-md cursor-pointer transition-all duration-200 font-mono bg-accent text-bg-primary border border-accent font-semibold hover:bg-[#f5c842] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(226,183,20,0.3)] active:translate-y-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  startTest();
                }
              }}
            >
              <FiRefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span>Start Test</span>
            </button>
          )}
          
          {isTestComplete && (
            <div className="flex flex-col items-center gap-4 sm:gap-5 animate-fade-in-up w-full">
              <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-10 py-3 sm:py-4 md:py-5 w-full justify-center">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-widest">
                    wpm
                  </span>
                  <span className="text-xl sm:text-2xl md:text-[2rem] font-bold text-accent">
                    {Math.round(wpm)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-widest">
                    acc
                  </span>
                  <span className="text-xl sm:text-2xl md:text-[2rem] font-bold text-accent">
                    {accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-widest">
                    time
                  </span>
                  <span className="text-xl sm:text-2xl md:text-[2rem] font-bold text-accent">
                    {timer.toFixed(1)}s
                  </span>
                </div>
              </div>
              <button 
                onClick={retry} 
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base font-medium rounded-md cursor-pointer transition-all duration-200 font-mono bg-transparent text-text-primary border border-text-secondary hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0"
              >
                <FiRefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {isTestActive && (
            <button 
              onClick={retry} 
              className="p-2.5 sm:p-3 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-bg-tertiary border border-text-tertiary text-text-primary rounded-md cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0" 
              title="Restart (Tab)"
            >
              <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Footer Hints */}
        <footer className="flex justify-center py-3 sm:py-4 md:py-5 mt-auto">
          <div className="text-[10px] sm:text-xs text-text-tertiary flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-5 text-center px-2">
            {!isTestActive && !isTestComplete && (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="bg-bg-tertiary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-text-secondary border border-text-tertiary text-[10px] sm:text-xs">
                  enter
                </span>
                <span className="hidden sm:inline">-</span>
                <span>start test</span>
              </span>
            )}
            {isTestActive && !isTestComplete && (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="bg-bg-tertiary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-text-secondary border border-text-tertiary text-[10px] sm:text-xs">
                  tab
                </span>
                <span className="hidden sm:inline">-</span>
                <span>restart</span>
              </span>
            )}
            {isTestComplete && (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="bg-bg-tertiary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-text-secondary border border-text-tertiary text-[10px] sm:text-xs">
                  enter
                </span>
                <span className="hidden sm:inline">-</span>
                <span>try again</span>
              </span>
            )}
          </div>
        </footer>
      </div>

      {/* Results Modal - Always shown after test, with or without username */}
      <NameInputModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleSubmitScore}
        wpm={wpm}
        accuracy={accuracy}
        time={timer}
        currentBestScore={currentBestScore}
        scoreUpdateStatus={scoreUpdateStatus}
      />
    </div>
  );
}

