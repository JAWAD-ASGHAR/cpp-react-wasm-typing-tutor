import { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';

export default function NameInputModal({ isOpen, onClose, onSubmit, wpm, accuracy, time, currentBestScore, scoreUpdateStatus }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const savedUsername = localStorage.getItem('typingTutor_username');
  const hasUsername = !!savedUsername;

  useEffect(() => {
    if (isOpen) {
      if (hasUsername) {
        setName(savedUsername);
      } else {
        setName('');
      }
    }
  }, [isOpen, hasUsername, savedUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    await onSubmit(name.trim());
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-bg-secondary rounded-lg max-w-md w-full p-6 shadow-xl my-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Test Complete!</h2>

        {/* Score Display */}
        <div className="bg-bg-tertiary rounded-lg p-4 mb-6 flex items-center justify-around">
          <div className="text-center">
            <div className="text-accent text-2xl font-bold">{Math.round(wpm)}</div>
            <div className="text-text-tertiary text-xs uppercase">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-text-primary text-2xl font-bold">{accuracy.toFixed(1)}%</div>
            <div className="text-text-tertiary text-xs uppercase">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-text-primary text-2xl font-bold">{time.toFixed(1)}s</div>
            <div className="text-text-tertiary text-xs uppercase">Time</div>
          </div>
        </div>

        {/* Status Notifications */}
        {hasUsername && scoreUpdateStatus === 'improved' && currentBestScore !== null && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent rounded-lg">
            <p className="text-accent text-center font-semibold text-sm">
              🎉 New Personal Best!
            </p>
            <p className="text-text-secondary text-center text-xs mt-1">
              Previous best: {currentBestScore} WPM
            </p>
            <p className="text-text-tertiary text-center text-xs mt-1">
              Score automatically saved to leaderboard
            </p>
          </div>
        )}

        {hasUsername && scoreUpdateStatus === 'worse' && currentBestScore !== null && (
          <div className="mb-6 p-4 bg-text-tertiary/20 border border-text-tertiary rounded-lg">
            <p className="text-text-secondary text-center text-sm">
              Your best: <span className="text-accent font-semibold">{currentBestScore} WPM</span>
            </p>
            <p className="text-text-tertiary text-center text-xs mt-1">
              This score ({Math.round(wpm)} WPM) was not saved (lower than your best)
            </p>
          </div>
        )}

        {hasUsername && scoreUpdateStatus === 'new' && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent rounded-lg">
            <p className="text-accent text-center font-semibold text-sm">
              ✅ First score saved to leaderboard!
            </p>
          </div>
        )}

        {hasUsername && scoreUpdateStatus === 'same' && currentBestScore !== null && (
          <div className="mb-6 p-4 bg-text-tertiary/20 border border-text-tertiary rounded-lg">
            <p className="text-text-secondary text-center text-sm">
              Tied your best: <span className="text-accent font-semibold">{currentBestScore} WPM</span>
            </p>
          </div>
        )}

        {/* Username Input - Only show if no username */}
        {!hasUsername ? (
          <>
            <p className="text-text-secondary mb-6">
              Set your username to save scores to the leaderboard. You can change it anytime from the header.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-text-secondary text-sm mb-2">
                  Your Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-text-tertiary rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    maxLength={50}
                    autoFocus
                    disabled={submitting}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mt-2">
                    <p className="text-xs text-text-tertiary">
                      💡 Your username will be saved and remembered for future tests
                    </p>
                    <p className={`text-xs ${name.length >= 45 ? 'text-accent' : 'text-text-tertiary'}`}>
                      {name.length}/50
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-bg-tertiary border border-text-tertiary rounded-md text-text-primary hover:bg-bg-primary transition-colors"
                  disabled={submitting}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-accent text-bg-primary rounded-md font-semibold hover:bg-[#f5c842] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!name.trim() || submitting}
                >
                  {submitting ? 'Saving...' : 'Save Username'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-accent text-bg-primary rounded-md font-semibold hover:bg-[#f5c842] transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
