import { useState, useEffect } from 'react';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';
import { FiX, FiTrendingUp, FiCalendar, FiBarChart2, FiAward, FiUser, FiEdit2, FiCheck } from 'react-icons/fi';

export default function Profile({ isOpen, onClose, onUsernameChange }) {
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'yesterday', 'week', 'month'
  const [graphPeriod, setGraphPeriod] = useState('month'); // 'day', 'week', 'month'
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('typingTutor_username');
      if (saved) {
        setUsername(saved);
        setEditValue(saved);
        fetchUserData(saved);
      }
    }
  }, [isOpen]);

  const fetchUserData = async (user) => {
    if (!isLeaderboardEnabled || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all sessions for this user
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', user)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      // Fetch leaderboard position
      const { data: allUsers, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('username, wpm, accuracy, time')
        .order('wpm', { ascending: false })
        .order('accuracy', { ascending: false })
        .order('time', { ascending: true });

      if (!leaderboardError && allUsers) {
        // Group by username and get best score for each
        const userMap = new Map();
        allUsers.forEach(entry => {
          const existing = userMap.get(entry.username);
          if (!existing || isBetterScore(entry, existing)) {
            userMap.set(entry.username, entry);
          }
        });

        const sortedUsers = Array.from(userMap.values())
          .sort((a, b) => {
            if (b.wpm !== a.wpm) return b.wpm - a.wpm;
            if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
            return a.time - b.time;
          });

        const position = sortedUsers.findIndex(u => u.username === user);
        setLeaderboardPosition(position >= 0 ? position + 1 : null);

        // Get best score
        const userBest = userMap.get(user);
        if (userBest) {
          setBestScore(userBest);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBetterScore = (newScore, existingScore) => {
    if (newScore.wpm > existingScore.wpm) return true;
    if (newScore.wpm < existingScore.wpm) return false;
    if (newScore.accuracy > existingScore.accuracy) return true;
    if (newScore.accuracy < existingScore.accuracy) return false;
    return newScore.time < existingScore.time;
  };

  const handleSaveUsername = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== username) {
      setUsername(trimmed);
      localStorage.setItem('typingTutor_username', trimmed);
      setIsEditingUsername(false);
      if (onUsernameChange) {
        onUsernameChange(trimmed);
      }
      fetchUserData(trimmed);
    } else {
      setIsEditingUsername(false);
    }
  };

  const getFilteredSessions = () => {
    if (!sessions.length) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return sessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      
      switch (timeFilter) {
        case 'today':
          return sessionDate >= today;
        case 'yesterday':
          return sessionDate >= yesterday && sessionDate < today;
        case 'week':
          return sessionDate >= weekAgo;
        case 'month':
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getGraphData = () => {
    const filtered = getFilteredSessions();
    if (!filtered.length) return { labels: [], wpm: [], accuracy: [] };

    const now = new Date();
    let days = 7;
    if (graphPeriod === 'day') days = 1;
    else if (graphPeriod === 'week') days = 7;
    else if (graphPeriod === 'month') days = 30;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Group sessions by date
    const dataByDate = {};
    filtered.forEach(session => {
      const date = new Date(session.created_at);
      if (date >= startDate) {
        const dateKey = date.toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = { wpm: [], accuracy: [] };
        }
        dataByDate[dateKey].wpm.push(session.wpm);
        dataByDate[dateKey].accuracy.push(session.accuracy);
      }
    });

    // Generate labels and average values
    const labels = [];
    const wpmData = [];
    const accuracyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      labels.push(dateKey);
      
      if (dataByDate[dateKey]) {
        const avgWpm = dataByDate[dateKey].wpm.reduce((a, b) => a + b, 0) / dataByDate[dateKey].wpm.length;
        const avgAcc = dataByDate[dateKey].accuracy.reduce((a, b) => a + b, 0) / dataByDate[dateKey].accuracy.length;
        wpmData.push(Math.round(avgWpm));
        accuracyData.push(parseFloat(avgAcc.toFixed(1)));
      } else {
        wpmData.push(0);
        accuracyData.push(0);
      }
    }

    return { labels, wpm: wpmData, accuracy: accuracyData };
  };

  const getContributionData = () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 365); // Last year

    const contributionMap = {};
    sessions.forEach(session => {
      const date = new Date(session.created_at);
      if (date >= startDate) {
        const dateKey = date.toISOString().split('T')[0];
        contributionMap[dateKey] = (contributionMap[dateKey] || 0) + 1;
      }
    });

    // Generate grid (53 weeks x 7 days)
    // Start from today and go back 53 weeks
    const grid = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the day of week (0 = Sunday, 6 = Saturday)
    const todayDayOfWeek = today.getDay();
    
    // Calculate the start date (Sunday of the week that contains the date 53 weeks ago)
    const startOfGrid = new Date(today);
    startOfGrid.setDate(startOfGrid.getDate() - (53 * 7) - todayDayOfWeek);

    for (let week = 0; week < 53; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfGrid);
        date.setDate(date.getDate() + (week * 7) + day);
        const dateKey = date.toISOString().split('T')[0];
        const count = contributionMap[dateKey] || 0;
        weekData.push({ date: dateKey, count });
      }
      grid.push(weekData);
    }

    return grid;
  };

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-bg-tertiary';
    if (count === 1) return 'bg-accent/30';
    if (count <= 3) return 'bg-accent/50';
    if (count <= 5) return 'bg-accent/70';
    return 'bg-accent';
  };

  const renderGraph = () => {
    const { labels, wpm, accuracy } = getGraphData();
    if (!labels.length) return null;

    const maxWpm = Math.max(...wpm, 1);
    const maxAccuracy = Math.max(...accuracy, 1);
    const width = 600;
    const height = 200;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const pointsWpm = wpm.map((value, i) => {
      const x = padding + (i / Math.max(labels.length - 1, 1)) * graphWidth;
      const y = padding + graphHeight - (value / Math.max(maxWpm, 1)) * graphHeight;
      return `${x},${y}`;
    }).join(' ');

    const pointsAccuracy = accuracy.map((value, i) => {
      const x = padding + (i / Math.max(labels.length - 1, 1)) * graphWidth;
      const y = padding + graphHeight - (value / Math.max(maxAccuracy, 1)) * graphHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <FiTrendingUp className="text-accent" />
            Progress Over Time
          </h3>
          <div className="flex gap-2">
            {['day', 'week', 'month'].map(period => (
              <button
                key={period}
                onClick={() => setGraphPeriod(period)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  graphPeriod === period
                    ? 'bg-accent text-bg-primary'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="min-w-full">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <g key={i}>
                <line
                  x1={padding}
                  y1={padding + ratio * graphHeight}
                  x2={width - padding}
                  y2={padding + ratio * graphHeight}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
                <text
                  x={padding - 10}
                  y={padding + ratio * graphHeight + 4}
                  fill="currentColor"
                  fontSize="10"
                  opacity="0.5"
                  textAnchor="end"
                >
                  {Math.round(maxWpm * (1 - ratio))}
                </text>
              </g>
            ))}
            {/* WPM line */}
            <polyline
              points={pointsWpm}
              fill="none"
              stroke="#e2b714"
              strokeWidth="2"
            />
            {/* Accuracy line (scaled) */}
            <polyline
              points={pointsAccuracy}
              fill="none"
              stroke="#4a9eff"
              strokeWidth="2"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-text-tertiary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span>WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded opacity-70"></div>
            <span>Accuracy %</span>
          </div>
        </div>
      </div>
    );
  };

  const filteredSessions = getFilteredSessions();
  const contributionGrid = getContributionData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-bg-secondary rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-text-tertiary">
          <div className="flex items-center gap-4">
            <FiUser className="text-accent text-2xl" />
            <div>
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveUsername();
                      if (e.key === 'Escape') setIsEditingUsername(false);
                    }}
                    className="px-3 py-1 bg-bg-tertiary border border-text-tertiary rounded text-text-primary focus:outline-none focus:border-accent"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="text-accent hover:text-[#f5c842] transition-colors"
                  >
                    <FiCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingUsername(false)}
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {username || 'Profile'}
                  </h2>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {leaderboardPosition && (
                <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                  <FiAward className="text-accent" />
                  <span>Rank #{leaderboardPosition} on Leaderboard</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-text-secondary py-12">
              Loading profile...
            </div>
          ) : !username ? (
            <div className="text-center text-text-secondary py-12">
              Please set a username to view your profile
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Summary */}
              {bestScore && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-bg-tertiary rounded-lg p-4 border border-text-tertiary">
                    <div className="text-xs text-text-tertiary uppercase mb-1">Best WPM</div>
                    <div className="text-2xl font-bold text-accent">{Math.round(bestScore.wpm)}</div>
                  </div>
                  <div className="bg-bg-tertiary rounded-lg p-4 border border-text-tertiary">
                    <div className="text-xs text-text-tertiary uppercase mb-1">Best Accuracy</div>
                    <div className="text-2xl font-bold text-accent">{bestScore.accuracy.toFixed(1)}%</div>
                  </div>
                  <div className="bg-bg-tertiary rounded-lg p-4 border border-text-tertiary">
                    <div className="text-xs text-text-tertiary uppercase mb-1">Total Sessions</div>
                    <div className="text-2xl font-bold text-accent">{sessions.length}</div>
                  </div>
                </div>
              )}

              {/* Progress Graph */}
              {renderGraph()}

              {/* Contribution Graph */}
              <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <FiCalendar className="text-accent" />
                  Activity Heatmap
                </h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-1" style={{ minWidth: '700px' }}>
                    {contributionGrid.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 rounded ${getIntensityColor(day.count)} border border-text-tertiary/20`}
                            title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-text-tertiary">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-bg-tertiary border border-text-tertiary/20"></div>
                    <div className="w-3 h-3 rounded bg-accent/30 border border-text-tertiary/20"></div>
                    <div className="w-3 h-3 rounded bg-accent/50 border border-text-tertiary/20"></div>
                    <div className="w-3 h-3 rounded bg-accent/70 border border-text-tertiary/20"></div>
                    <div className="w-3 h-3 rounded bg-accent border border-text-tertiary/20"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Session History */}
              <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <FiBarChart2 className="text-accent" />
                    Session History
                  </h3>
                  <div className="flex gap-2">
                    {['all', 'today', 'yesterday', 'week', 'month'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          timeFilter === filter
                            ? 'bg-accent text-bg-primary'
                            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredSessions.length === 0 ? (
                  <div className="text-center text-text-secondary py-8">
                    No sessions found for this period
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-text-tertiary">
                          <th className="text-left py-3 px-4 text-text-tertiary uppercase text-xs tracking-wider font-semibold">
                            Date
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
                        {filteredSessions.map((session, index) => {
                          const date = new Date(session.created_at);
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
                          
                          let dateStr = date.toLocaleDateString();
                          if (isToday) dateStr = 'Today';
                          else if (isYesterday) dateStr = 'Yesterday';
                          else if (timeFilter === 'week' || timeFilter === 'month') {
                            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }

                          return (
                            <tr
                              key={session.id || index}
                              className="border-b border-bg-tertiary hover:bg-bg-tertiary transition-colors"
                            >
                              <td className="py-4 px-4 text-text-primary">
                                {dateStr}
                                <div className="text-xs text-text-tertiary">
                                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right text-text-primary font-semibold">
                                {Math.round(session.wpm)}
                              </td>
                              <td className="py-4 px-4 text-right text-text-secondary">
                                {session.accuracy.toFixed(1)}%
                              </td>
                              <td className="py-4 px-4 text-right text-text-secondary">
                                {session.time.toFixed(1)}s
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
          )}
        </div>
      </div>
    </div>
  );
}

