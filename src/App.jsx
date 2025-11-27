import { useState, useEffect, useRef } from 'react';
import { loadWasm } from './wasmLoader';
import './App.css';

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

  useEffect(() => {
    // Load WASM module on mount
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
          
          // Update WPM
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

  const startTest = () => {
    if (!wasm) return;

    // Generate text with 25 words
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

    // Start session in WASM
    wasm.startSession(generatedText);

    // Focus input field
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

    // Update WASM session
    if (wasm) {
      wasm.updateInput(typed);
      const acc = wasm.getAccuracy();
      setAccuracy(acc);

      // Calculate correct chars (approximate from accuracy)
      const correct = Math.round((acc / 100) * typed.length);
      setCorrectChars(correct);
    }

    // Check if test is complete
    if (typed.length >= targetText.length) {
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

    return targetText.split('').map((char, index) => {
      let className = 'char';
      
      if (index < userInput.length) {
        if (char === userInput[index]) {
          className += ' correct';
        } else {
          className += ' incorrect';
        }
      } else if (index === userInput.length) {
        className += ' current';
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Typing Practice</h1>
        
        <div className="stats-bar">
          <div className="stat">
            <label>Time:</label>
            <span>{timer.toFixed(1)}s</span>
          </div>
          <div className="stat">
            <label>WPM:</label>
            <span>{wpm}</span>
          </div>
          <div className="stat">
            <label>Accuracy:</label>
            <span>{accuracy.toFixed(1)}%</span>
          </div>
          <div className="stat">
            <label>Progress:</label>
            <span>{totalChars}/{targetText.length}</span>
          </div>
        </div>

        <div className="text-display">
          {targetText ? (
            <div className="text-content">{renderText()}</div>
          ) : (
            <div className="placeholder">Click "Start Test" to begin typing practice</div>
          )}
        </div>

        <div className="input-section">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            disabled={!isTestActive}
            className="typing-input"
          />
        </div>

        <div className="progress-info">
          <div className="progress-item">
            <span>Correct: {correctChars}</span>
          </div>
          <div className="progress-item">
            <span>Incorrect: {totalChars - correctChars}</span>
          </div>
        </div>

        <div className="controls">
          {!isTestActive && !isTestComplete && (
            <button onClick={startTest} className="btn btn-primary">
              Start Test
            </button>
          )}
          {isTestComplete && (
            <button onClick={retry} className="btn btn-secondary">
              Retry
            </button>
          )}
          {isTestActive && (
            <button onClick={finishTest} className="btn btn-secondary">
              Finish Test
            </button>
          )}
        </div>

        {isTestComplete && (
          <div className="results">
            <h2>Test Complete!</h2>
            <div className="result-stats">
              <div className="result-item">
                <strong>WPM:</strong> {wpm}
              </div>
              <div className="result-item">
                <strong>Accuracy:</strong> {accuracy.toFixed(1)}%
              </div>
              <div className="result-item">
                <strong>Time:</strong> {timer.toFixed(1)}s
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

