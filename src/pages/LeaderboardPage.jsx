import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';
import { FiAward } from 'react-icons/fi';
import { FaRegKeyboard } from 'react-icons/fa6';
import UsernameButton from '../components/UsernameButton';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      if (!isLeaderboardEnabled) {
        throw new Error('Leaderboard is not configured. Please check your .env file.');
      }
      
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('wpm', { ascending: false });

      if (error) throw error;

      const isBetterScore = (newScore, existingScore) => {
        if (newScore.wpm > existingScore.wpm) return true;
        if (newScore.wpm < existingScore.wpm) return false;
        if (newScore.accuracy > existingScore.accuracy) return true;
        if (newScore.accuracy < existingScore.accuracy) return false;
        return newScore.time < existingScore.time;
      };

      const userMap = new Map();
      
      data?.forEach(entry => {
        const existing = userMap.get(entry.username);
        if (!existing || isBetterScore(entry, existing)) {
          userMap.set(entry.username, entry);
        }
      });

      const topUsers = Array.from(userMap.values())
        .sort((a, b) => {
          if (b.wpm !== a.wpm) return b.wpm - a.wpm;
          if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
          return a.time - b.time;
        })
        .slice(0, 100);

      setLeaderboard(topUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
      if (error.message) {
        alert(`Leaderboard error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono">
      <div className="max-w-6xl mx-auto p-5">
        {/* Header */}
        <header className="flex justify-between items-center py-5 mb-6">
          <div className="flex-1 flex justify-start items-center">
            <UsernameButton />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Link to="/" className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight transition-colors duration-300">
                typetutor
              </span>
              <span className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                wasm
              </span>
            </Link>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              title="Back to Test"
            >
              <FaRegKeyboard className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Test</span>
            </Link>
          </div>
        </header>

        {/* Leaderboard Content */}
        <div className="bg-bg-secondary rounded-lg border border-text-tertiary">
          <div className="p-6 border-b border-text-tertiary">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <FiAward className="text-accent" />
              Leaderboard
            </h2>
          </div>

          <div className="p-6">
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
                    {leaderboard.map((entry, index) => {
                      const profileLink = `/profile/${encodeURIComponent(entry.username)}`;
                      return (
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
                            <Link
                              to={profileLink}
                              className="truncate hover:text-accent transition-colors block"
                              title={entry.username.length > 20 ? entry.username : undefined}
                            >
                              {entry.username}
                            </Link>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

