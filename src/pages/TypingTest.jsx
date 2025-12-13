import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { loadWasm } from '../wasmLoader';
import { FiRefreshCw, FiClock, FiTarget, FiTrendingUp, FiAward, FiType } from 'react-icons/fi';
import { FaRegKeyboard } from 'react-icons/fa6';
import NameInputModal from '../components/NameInputModal';
import UsernameButton from '../components/UsernameButton';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';

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
  const [isComposing, setIsComposing] = useState(false);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [isWasmLoading, setIsWasmLoading] = useState(true);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const textContainerRef = useRef(null);
  const isStartingRef = useRef(false);
  const isSwitchingModeRef = useRef(false);
  const generatorTypeRef = useRef(GENERATOR_TYPES.RANDOM_WORDS);
  const wasmRef = useRef(null);
  const modeSwitchTimeoutRef = useRef(null);

  const getTextCount = (type) => {
    switch (type) {
      case GENERATOR_TYPES.SENTENCES:
        return 3;
      case GENERATOR_TYPES.MIXED_CASE:
        return 25;
      case GENERATOR_TYPES.RANDOM_WORDS:
      default:
        return 25;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Prevent multiple loads if WASM is already loaded
    if (wasmRef.current) {
      console.log('[WASM] WASM already loaded, skipping reload');
      setIsWasmReady(true);
      setIsWasmLoading(false);
      return;
    }
    
    console.log('[WASM] Starting WASM load...');
    setIsWasmLoading(true);
    
    loadWasm()
      .then((wasmFunctions) => {
        console.log('[WASM] WASM loaded successfully');
        if (isMounted && !wasmRef.current) {
          wasmRef.current = wasmFunctions;
          setWasm(wasmFunctions);
          try {
            wasmFunctions.setGeneratorType(GENERATOR_TYPES.RANDOM_WORDS);
            generatorTypeRef.current = GENERATOR_TYPES.RANDOM_WORDS;
            console.log('[WASM] Initial generator type set to RANDOM_WORDS');
          } catch (error) {
            console.error('[WASM] Error setting initial generator type:', error);
          }
          setIsWasmReady(true);
          setIsWasmLoading(false);
        } else if (wasmRef.current) {
          console.log('[WASM] WASM already loaded by another effect, skipping');
          setIsWasmReady(true);
          setIsWasmLoading(false);
        }
      })
      .catch((error) => {
        console.error('[WASM] Failed to load WASM:', error);
        if (isMounted) {
          wasmRef.current = null;
          setIsWasmReady(false);
          setIsWasmLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
      // Don't clear wasmRef on unmount - keep it for remounts
    };
  }, []);

  // Keep wasmRef in sync with wasm state
  useEffect(() => {
    if (wasm) {
      wasmRef.current = wasm;
    }
  }, [wasm]);

  // Safety timeout to reset stuck flags
  useEffect(() => {
    const safetyCheck = setInterval(() => {
      // Reset flags if they've been stuck for more than 5 seconds
      if (isSwitchingModeRef.current) {
        const now = Date.now();
        if (!modeSwitchTimeoutRef.current || (now - modeSwitchTimeoutRef.current > 5000)) {
          console.warn('[SAFETY] Resetting stuck isSwitchingModeRef flag');
          isSwitchingModeRef.current = false;
          setIsSwitchingMode(false);
          if (modeSwitchTimeoutRef.current) {
            modeSwitchTimeoutRef.current = null;
          }
        }
      }
    }, 1000);

    return () => clearInterval(safetyCheck);
  }, []);

  const restartTest = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    console.log('[RESTART] Starting restart test', retryCount > 0 ? `(retry ${retryCount}/${MAX_RETRIES})` : '');
    const currentWasm = wasmRef.current;
    if (!currentWasm || !isWasmReady) {
      console.warn('[RESTART] WASM not ready yet', { wasm: !!currentWasm, ready: isWasmReady });
      return;
    }
    
    if (isStartingRef.current || isSwitchingModeRef.current) {
      console.warn('[RESTART] Operation in progress, ignoring duplicate call', {
        starting: isStartingRef.current,
        switching: isSwitchingModeRef.current
      });
      return;
    }
    
    isStartingRef.current = true;
    console.log('[RESTART] Flag set, proceeding with restart');
    
    try {
      // Use ref to ensure we have the latest generator type
      const currentGenType = generatorTypeRef.current;
      console.log('[RESTART] Generator type:', currentGenType);
      
      // Ensure WASM is in a clean state
      console.log('[RESTART] Resetting WASM session');
      
      // Use setTimeout to keep UI responsive
      await new Promise(resolve => setTimeout(resolve, 0));
      
      try {
        // Reset and set generator type with proper error handling
        currentWasm.resetSession();
        // Small delay to ensure reset completes
        await new Promise(resolve => setTimeout(resolve, 20));
        currentWasm.setGeneratorType(currentGenType);
        // Small delay to ensure generator type is set and generator is initialized
        await new Promise(resolve => setTimeout(resolve, 30));
      } catch (resetError) {
        console.error('[RESTART] Error resetting WASM:', resetError);
        if (retryCount < MAX_RETRIES) {
          console.log(`[RESTART] Retrying after reset error (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          isStartingRef.current = false;
          await new Promise(resolve => setTimeout(resolve, 100));
          return restartTest(retryCount + 1);
        }
        throw resetError;
      }
      
      setCurrentBestScore(null);
      setScoreUpdateStatus(null);
      setShowNameModal(false);
      
      const textCount = getTextCount(currentGenType);
      console.log('[RESTART] Generating text, count:', textCount);
      
      // Wait a bit longer to ensure generator is fully initialized
      await new Promise(resolve => setTimeout(resolve, 50));
      
      let generatedText;
      let attempts = 0;
      const maxGenerateAttempts = 3;
      
      while (attempts < maxGenerateAttempts) {
        try {
          generatedText = currentWasm.generateText(textCount);
          if (generatedText && generatedText.trim() !== '') {
            break; // Success, exit loop
          }
          // If we got empty text, wait and retry
          if (attempts < maxGenerateAttempts - 1) {
            console.log(`[RESTART] Got empty text, retrying generation (attempt ${attempts + 1}/${maxGenerateAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Reset generator before retry
            try {
              currentWasm.resetSession();
              await new Promise(resolve => setTimeout(resolve, 20));
              currentWasm.setGeneratorType(currentGenType);
              await new Promise(resolve => setTimeout(resolve, 30));
            } catch (resetError) {
              console.error('[RESTART] Error resetting before retry:', resetError);
            }
          }
          attempts++;
        } catch (wasmError) {
          console.error('[RESTART] WASM error during generateText:', wasmError);
          attempts++;
          if (attempts >= maxGenerateAttempts) {
            // If we've exhausted generate attempts, fall through to outer retry
            break;
          }
          // Wait before retrying generation
          await new Promise(resolve => setTimeout(resolve, 100));
          // Reset generator before retry
          try {
            currentWasm.resetSession();
            await new Promise(resolve => setTimeout(resolve, 20));
            currentWasm.setGeneratorType(currentGenType);
            await new Promise(resolve => setTimeout(resolve, 30));
          } catch (resetError) {
            console.error('[RESTART] Error resetting before retry:', resetError);
          }
        }
      }
      
      // Check if we got valid text after all attempts
      if (!generatedText || generatedText.trim() === '') {
        console.error('[RESTART] Failed to generate text after', maxGenerateAttempts, 'attempts. Generator type:', currentGenType);
        if (retryCount < MAX_RETRIES) {
          console.log(`[RESTART] Retrying entire operation (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          isStartingRef.current = false;
          // Reset WASM state before retry
          try {
            currentWasm.resetSession();
            await new Promise(resolve => setTimeout(resolve, 100));
            currentWasm.setGeneratorType(currentGenType);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (resetError) {
            console.error('[RESTART] Error resetting WASM for retry:', resetError);
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          return restartTest(retryCount + 1);
        }
        isStartingRef.current = false;
        alert('Failed to generate text. Please try again.');
        return;
      }
      
      console.log('[RESTART] Text generated successfully, length:', generatedText.length);
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
      
      // Reset the flag after a short delay to allow state updates
      setTimeout(() => {
        isStartingRef.current = false;
        console.log('[RESTART] Flag reset, focusing input');
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    } catch (error) {
      console.error('[RESTART] Error restarting test:', error);
      if (retryCount < MAX_RETRIES) {
        console.log(`[RESTART] Retrying after general error (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        isStartingRef.current = false;
        await new Promise(resolve => setTimeout(resolve, 100));
        return restartTest(retryCount + 1);
      }
      isStartingRef.current = false;
      alert('Failed to restart test. Please try again.');
    }
  }, [isWasmReady]);

  useEffect(() => {
      const handleGlobalKeyDown = (e) => {
      const currentWasm = wasmRef.current;
      if (e.key === 'Enter' && 
          currentWasm &&
          isWasmReady &&
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA' &&
          e.target.tagName !== 'BUTTON' &&
          (!isTestActive || isTestComplete) &&
          !isStartingRef.current &&
          !isSwitchingModeRef.current) {
        e.preventDefault();
        restartTest();
      }
      
      if (e.key === 'Tab' && 
          currentWasm &&
          isWasmReady &&
          isTestActive && 
          !isTestComplete &&
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA' &&
          e.target.tagName !== 'BUTTON' &&
          !isStartingRef.current &&
          !isSwitchingModeRef.current) {
        e.preventDefault();
        restartTest();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isWasmReady, isTestActive, isTestComplete, restartTest]);

  useEffect(() => {
    if (isTestActive && hasStartedTyping && !isTestComplete) {
      intervalRef.current = setInterval(() => {
        const currentWasm = wasmRef.current;
        if (currentWasm) {
          try {
            const elapsed = currentWasm.getElapsedSeconds();
            setTimer(elapsed);
            const currentWpm = currentWasm.getWPM(elapsed);
            setWpm(currentWpm);
            
            if (elapsed >= 60) {
              finishTest();
            }
          } catch (error) {
            console.error('Error getting timer/WPM:', error);
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
  }, [isTestActive, hasStartedTyping, isTestComplete]);

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

  const startTest = useCallback(() => {
    console.log('[START] Starting test');
    const currentWasm = wasmRef.current;
    if (!currentWasm || !isWasmReady) {
      console.warn('[START] WASM not ready yet', { wasm: !!currentWasm, ready: isWasmReady });
      return;
    }
    
    if (isTestActive && !isTestComplete) {
      console.warn('[START] Test already active, use restart instead');
      return;
    }
    
    if (isStartingRef.current || isSwitchingModeRef.current) {
      console.warn('[START] Operation in progress, ignoring duplicate call', {
        starting: isStartingRef.current,
        switching: isSwitchingModeRef.current
      });
      return;
    }
    
    isStartingRef.current = true;
    console.log('[START] Flag set, proceeding with start');
    
    const generateAndStartTest = async (retryCount = 0) => {
      const MAX_RETRIES = 3;
      try {
        const currentGenType = generatorTypeRef.current;
        console.log('[START] Generator type:', currentGenType);
        const textCount = getTextCount(currentGenType);
        console.log('[START] Generating text, count:', textCount);
        
        // Use requestIdleCallback or setTimeout to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
        
        let generatedText;
        try {
          generatedText = currentWasm.generateText(textCount);
        } catch (wasmError) {
          console.error('[START] WASM error during generateText:', wasmError);
          // Retry if we haven't exceeded max retries
          if (retryCount < MAX_RETRIES) {
            console.log(`[START] Retrying generation (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            // Reset WASM state before retry
            try {
              currentWasm.resetSession();
              currentWasm.setGeneratorType(currentGenType);
            } catch (resetError) {
              console.error('[START] Error resetting WASM:', resetError);
            }
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 100));
            return generateAndStartTest(retryCount + 1);
          }
          throw wasmError;
        }
        
        if (!generatedText || generatedText.trim() === '') {
          console.error('[START] Failed to generate text. Generator type:', currentGenType);
          // Retry if we haven't exceeded max retries
          if (retryCount < MAX_RETRIES) {
            console.log(`[START] Empty text, retrying (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            try {
              currentWasm.resetSession();
              currentWasm.setGeneratorType(currentGenType);
            } catch (resetError) {
              console.error('[START] Error resetting WASM:', resetError);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            return generateAndStartTest(retryCount + 1);
          }
          isStartingRef.current = false;
          alert('Failed to generate text. Please try again.');
          return;
        }
        
        console.log('[START] Text generated successfully, length:', generatedText.length);
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
        setCurrentBestScore(null);
        setScoreUpdateStatus(null);
        setShowNameModal(false);
        
        // Reset the flag after a short delay to allow state updates
        setTimeout(() => {
          isStartingRef.current = false;
          console.log('[START] Flag reset, focusing input');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 200);
      } catch (error) {
        console.error('[START] Error generating text:', error);
        isStartingRef.current = false;
        alert('Failed to generate text. Please try again.');
      }
    };
    
    try {
      // Use ref to ensure we have the latest generator type
      const currentGenType = generatorTypeRef.current;
      
      // Ensure WASM is in a clean state - wait if mode is switching
      if (isSwitchingModeRef.current) {
        console.log('[START] Mode switch in progress, waiting...');
        // Wait for mode switch to complete
        let attempts = 0;
        const maxAttempts = 20; // 1 second max wait (20 * 50ms)
        const checkModeSwitch = setInterval(async () => {
          attempts++;
          if (!isSwitchingModeRef.current) {
            clearInterval(checkModeSwitch);
            console.log('[START] Mode switch complete, proceeding');
            try {
              // Use setTimeout to keep UI responsive
              await new Promise(resolve => setTimeout(resolve, 0));
              currentWasm.resetSession();
              currentWasm.setGeneratorType(currentGenType);
              await generateAndStartTest();
            } catch (error) {
              console.error('[START] Error after mode switch:', error);
              isStartingRef.current = false;
              alert('Failed to start test. Please try again.');
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkModeSwitch);
            console.warn('[START] Mode switch timeout, forcing reset');
            isSwitchingModeRef.current = false;
            setIsSwitchingMode(false);
            isStartingRef.current = false;
            alert('Mode switch is taking too long. Please try again.');
          }
        }, 50);
        return;
      }
      
      console.log('[START] Resetting WASM session');
      // Use setTimeout to keep UI responsive
      (async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 0));
          currentWasm.resetSession();
          currentWasm.setGeneratorType(currentGenType);
          await generateAndStartTest();
        } catch (error) {
          console.error('[START] Error in async start:', error);
          isStartingRef.current = false;
        }
      })();
    } catch (error) {
      console.error('[START] Error starting test:', error);
      isStartingRef.current = false;
      alert('Failed to start test. Please try again.');
    }
  }, [isWasmReady, isTestActive, isTestComplete]);

  const processInput = (inputValue) => {
    if (!isTestActive || isTestComplete) return;
    
    const currentWasm = wasmRef.current;
    if (!currentWasm || !targetText) {
      console.warn('[INPUT] WASM or target text not available');
      return;
    }

    let typed = inputValue;
    
    typed = typed.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    if (typed.length > targetText.length) {
      typed = typed.substring(0, targetText.length);
    }
    
    if (!hasStartedTyping && typed.length > 0) {
      console.log('[INPUT] Starting typing session');
      setHasStartedTyping(true);
      try {
        currentWasm.startSession(targetText);
      } catch (error) {
        console.error('[INPUT] Error starting session:', error);
        return;
      }
    }

    setUserInput(typed);
    setTotalChars(typed.length);

    if (hasStartedTyping) {
      try {
        currentWasm.updateInput(typed);
        const acc = currentWasm.getAccuracy();
        setAccuracy(acc);
        const correct = Math.round((acc / 100) * typed.length);
        setCorrectChars(correct);
      } catch (error) {
        console.error('[INPUT] Error updating input:', error);
      }
    }

    if (typed.length >= targetText.length) {
      console.log('[INPUT] Test complete, finishing...');
      finishTest();
    }
  };

  const handleInputChange = (e) => {
    if (!isTestActive || isTestComplete) return;

    if (isComposing) {
      setUserInput(e.target.value);
      return;
    }

    processInput(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    if (isTestActive && !isTestComplete && inputRef.current) {
      requestAnimationFrame(() => {
        if (inputRef.current) {
          processInput(inputRef.current.value);
        }
      });
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Tab' && isTestActive && !isTestComplete && wasmRef.current && !isStartingRef.current && !isSwitchingModeRef.current) {
      e.preventDefault();
      restartTest();
    }
  };

  const finishTest = async () => {
    setIsTestActive(false);
    setIsTestComplete(true);
    
    let finalWpm = 0;
    let finalAccuracy = 100;
    let finalTime = 0;
    
    const currentWasm = wasmRef.current;
    if (currentWasm && hasStartedTyping) {
      try {
        const elapsed = currentWasm.getElapsedSeconds();
        finalWpm = Math.round(currentWasm.getWPM(elapsed));
        finalAccuracy = parseFloat(currentWasm.getAccuracy().toFixed(1));
        finalTime = parseFloat(elapsed.toFixed(1));
        setWpm(finalWpm);
        setTimer(elapsed);
        setAccuracy(finalAccuracy);
      } catch (error) {
        console.error('Error finishing test:', error);
        finalWpm = Math.round(wpm);
        finalAccuracy = parseFloat(accuracy.toFixed(1));
        finalTime = parseFloat(timer.toFixed(1));
      }
    } else {
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

  const goToHomeScreen = () => {
    console.log('[HOME] Going to home screen');
    const currentWasm = wasmRef.current;
    if (currentWasm) {
      try {
        currentWasm.resetSession();
      } catch (error) {
        console.error('[HOME] Error resetting session:', error);
      }
    }
    setTargetText('');
    setUserInput('');
    setIsTestActive(false);
    setIsTestComplete(false);
    setHasStartedTyping(false);
    setTimer(0);
    setAccuracy(100);
    setWpm(0);
    setCorrectChars(0);
    setTotalChars(0);
    setCurrentBestScore(null);
    setScoreUpdateStatus(null);
    setShowNameModal(false);
    // Reset flags
    isStartingRef.current = false;
    isSwitchingModeRef.current = false;
    setIsSwitchingMode(false);
    modeSwitchTimeoutRef.current = null;
    console.log('[HOME] All flags reset');
  };

  const renderText = () => {
    if (!targetText) return null;

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
      
      result.push(
        <span key={`word-${wordIndex}`} className="inline-block">
          {wordChars}
        </span>
      );
      
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
      <div       className="max-w-[1000px] w-full flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fade-in">
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

        {!isTestActive && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-4">
            <label className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-widest mb-0.5 sm:mb-1">
              Text Type {isWasmLoading && <span className="text-accent">(Loading...)</span>}
            </label>
            <div className="flex gap-1 sm:gap-2 bg-bg-secondary rounded-lg p-0.5 sm:p-1 border border-text-tertiary w-full max-w-md">
              {Object.entries(GENERATOR_LABELS).map(([type, label]) => {
                const typeNum = Number(type);
                const isSelected = generatorType === typeNum;
                const isDisabled = isTestActive || isSwitchingMode || isStartingRef.current || !isWasmReady;
                
                return (
                  <button
                    key={type}
                    onClick={() => {
                      const newType = typeNum;
                      console.log('[MODE] Switching to mode:', newType, GENERATOR_LABELS[newType]);
                      
                      // Prevent switching if already switching or starting
                      if (isSwitchingModeRef.current || isStartingRef.current) {
                        console.warn('[MODE] Operation in progress, cannot switch mode', {
                          switching: isSwitchingModeRef.current,
                          starting: isStartingRef.current
                        });
                        return;
                      }
                      
                      // Prevent switching if test is active
                      if (isTestActive) {
                        console.warn('[MODE] Test is active, cannot switch mode');
                        return;
                      }
                      
                    const currentWasm = wasmRef.current;
                    if (currentWasm && isWasmReady) {
                      // Use setTimeout to keep UI responsive
                      setTimeout(async () => {
                        try {
                          // Set flags to prevent concurrent operations
                          isSwitchingModeRef.current = true;
                          setIsSwitchingMode(true);
                          modeSwitchTimeoutRef.current = Date.now();
                          
                          console.log('[MODE] Resetting WASM session');
                          
                          // Yield to browser to keep UI responsive
                          await new Promise(resolve => setTimeout(resolve, 0));
                          
                          currentWasm.resetSession();
                          console.log('[MODE] Setting generator type to:', newType);
                          currentWasm.setGeneratorType(newType);
                          
                          // Update state
                          setGeneratorType(newType);
                          generatorTypeRef.current = newType;
                          setTargetText('');
                          setUserInput('');
                          setCurrentBestScore(null);
                          setScoreUpdateStatus(null);
                          
                          console.log('[MODE] Mode switch complete');
                          
                          // Reset flags after operation completes
                          setTimeout(() => {
                            isSwitchingModeRef.current = false;
                            setIsSwitchingMode(false);
                            modeSwitchTimeoutRef.current = null;
                            console.log('[MODE] Flags reset');
                          }, 100);
                        } catch (error) {
                          console.error('[MODE] Error switching mode:', error);
                          isSwitchingModeRef.current = false;
                          setIsSwitchingMode(false);
                          modeSwitchTimeoutRef.current = null;
                          alert('Failed to switch mode. Please try again.');
                        }
                      }, 0);
                    } else {
                        // WASM not ready, just update state
                        console.log('[MODE] WASM not ready, updating state only');
                        setGeneratorType(newType);
                        generatorTypeRef.current = newType;
                      }
                    }}
                    disabled={isDisabled}
                    className={`flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                      isSelected
                        ? 'bg-accent text-bg-primary shadow-md'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                      isSwitchingMode && isSelected ? 'animate-pulse' : ''
                    }`}
                    title={isDisabled ? (isSwitchingMode ? 'Switching mode...' : isTestActive ? 'Test is active' : 'WASM not ready') : ''}
                  >
                    <span className="hidden sm:inline">
                      {isSwitchingMode && isSelected ? '...' : label}
                    </span>
                    <span className="sm:hidden">
                      {isSwitchingMode && isSelected ? '...' : (label === 'Random Words' ? 'Words' : label === 'Mixed Case' ? 'Mixed' : label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {targetText && (
          <div className="text-center text-xs sm:text-sm text-text-tertiary uppercase tracking-widest -mb-2 sm:-mb-2.5 px-2">
            <span className="hidden sm:inline">{GENERATOR_LABELS[generatorType].toLowerCase()} • english</span>
            <span className="sm:hidden">
              {GENERATOR_LABELS[generatorType] === 'Random Words' ? 'words' : GENERATOR_LABELS[generatorType] === 'Mixed Case' ? 'mixed' : GENERATOR_LABELS[generatorType].toLowerCase()} • en
            </span>
          </div>
        )}

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

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={!isTestActive}
          className="absolute opacity-0 pointer-events-none w-0 h-0 border-0 bg-transparent outline-none text-transparent"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="text"
          enterKeyHint="done"
          data-1p-ignore
          data-lpignore="true"
        />

        <div className="flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-5">
          {!isTestActive && !isTestComplete && (
            <button 
              onClick={startTest}
              disabled={!isWasmReady || isWasmLoading || isSwitchingMode || isStartingRef.current}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-md cursor-pointer transition-all duration-200 font-mono bg-accent text-bg-primary border border-accent font-semibold hover:bg-[#f5c842] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(226,183,20,0.3)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (!isWasmReady || isWasmLoading || isSwitchingMode || isStartingRef.current) {
                    return;
                  }
                  startTest();
                }
              }}
              title={!isWasmReady || isWasmLoading ? 'WASM is loading...' : isSwitchingMode ? 'Switching mode...' : ''}
            >
              <FiRefreshCw className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${(isWasmLoading || isSwitchingMode) ? 'animate-spin' : ''}`} />
              <span>
                {isWasmLoading ? 'Loading...' : isSwitchingMode ? 'Switching...' : 'Start Test'}
              </span>
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
            <>
              <button 
                onClick={retry} 
                className="p-2.5 sm:p-3 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-bg-tertiary border border-text-tertiary text-text-primary rounded-md cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0" 
                title="Restart (Tab)"
              >
                <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={goToHomeScreen} 
                className="p-2.5 sm:p-3 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-bg-tertiary border border-text-tertiary text-text-primary rounded-md cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0" 
                title="Change Text Type"
              >
                <FiType className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

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

