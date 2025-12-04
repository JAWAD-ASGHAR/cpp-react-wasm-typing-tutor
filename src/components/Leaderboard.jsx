import { useState, useEffect } from 'react';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';
import { FiAward, FiClock, FiTarget } from 'react-icons/fi';

export default function Leaderboard({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      if (!isLeaderboardEnabled) {
        throw new Error('Leaderboard is not configured. Please check your .env file.');
      }
      
      // Fetch all entries (we'll filter for best per user)
      // Note: For large datasets, consider using a database view or function
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('wpm', { ascending: false });

      if (error) throw error;

      // Helper function to compare scores: WPM > Accuracy > Time (lower is better for time)
      const isBetterScore = (newScore, existingScore) => {
        // Primary: WPM (higher is better)
        if (newScore.wpm > existingScore.wpm) return true;
        if (newScore.wpm < existingScore.wpm) return false;
        
        // Secondary: Accuracy (higher is better)
        if (newScore.accuracy > existingScore.accuracy) return true;
        if (newScore.accuracy < existingScore.accuracy) return false;
        
        // Tertiary: Time (lower is better)
        return newScore.time < existingScore.time;
      };

      // Group by username and get best score for each user
      const userMap = new Map();
      
      data?.forEach(entry => {
        const existing = userMap.get(entry.username);
        if (!existing || isBetterScore(entry, existing)) {
          userMap.set(entry.username, entry);
        }
      });

      // Convert to array, sort by WPM > Accuracy > Time, and get top 100 users
      const topUsers = Array.from(userMap.values())
        .sort((a, b) => {
          // Primary: WPM (descending)
          if (b.wpm !== a.wpm) return b.wpm - a.wpm;
          // Secondary: Accuracy (descending)
          if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
          // Tertiary: Time (ascending - lower is better)
          return a.time - b.time;
        })
        .slice(0, 100);

      setLeaderboard(topUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
      // Show error message to user
      if (error.message) {
        alert(`Leaderboard error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-bg-secondary rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-text-tertiary">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FiAward className="text-accent" />
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Leaderboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-text-secondary py-12">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-text-secondary py-12">
              No entries yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-text-tertiary">
                    <th className="text-left py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold min-w-[120px] max-w-[200px]">
                      Name
                    </th>
                    <th className="text-right py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold">
                      WPM
                    </th>
                    <th className="text-right py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold">
                      Accuracy
                    </th>
                    <th className="text-right py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.id || index}
                      className={`border-b border-bg-tertiary hover:bg-bg-tertiary transition-colors ${
                        index < 3 ? 'bg-bg-tertiary/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-accent">🥇</span>}
                          {index === 1 && <span className="text-text-secondary">🥈</span>}
                          {index === 2 && <span className="text-text-tertiary">🥉</span>}
                          <span className={`font-semibold ${index < 3 ? 'text-accent' : 'text-text-primary'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-text-primary font-medium max-w-[200px]">
                        <div 
                          className="truncate" 
                          title={entry.username.length > 20 ? entry.username : undefined}
                        >
                          {entry.username}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-text-primary font-semibold">
                        {Math.round(entry.wpm)}
                      </td>
                      <td className="py-4 px-4 text-right text-text-secondary">
                        {entry.accuracy.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-right text-text-secondary">
                        {entry.time.toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

