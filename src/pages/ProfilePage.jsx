import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';
import { FiTrendingUp, FiCalendar, FiBarChart2, FiAward, FiUser, FiEdit2, FiCheck, FiX, FiType } from 'react-icons/fi';

export default function ProfilePage() {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all time');
  const [graphPeriod, setGraphPeriod] = useState('month');
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const savedUsername = localStorage.getItem('typingTutor_username');
    const profileUsername = urlUsername ? decodeURIComponent(urlUsername) : savedUsername;
    
    if (profileUsername) {
      setUsername(profileUsername);
      setEditValue(profileUsername);
      setIsOwnProfile(!urlUsername || profileUsername === savedUsername);
      fetchUserData(profileUsername);
    } else {
      setLoading(false);
    }
  }, [urlUsername]);

  const fetchUserData = async (user) => {
    if (!isLeaderboardEnabled || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', user)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      const { data: allUsers, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('username, wpm, accuracy, time')
        .order('wpm', { ascending: false })
        .order('accuracy', { ascending: false })
        .order('time', { ascending: true });

      if (!leaderboardError && allUsers) {
        const isBetterScore = (newScore, existingScore) => {
          if (newScore.wpm > existingScore.wpm) return true;
          if (newScore.wpm < existingScore.wpm) return false;
          if (newScore.accuracy > existingScore.accuracy) return true;
          if (newScore.accuracy < existingScore.accuracy) return false;
          return newScore.time < existingScore.time;
        };

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

  const handleSaveUsername = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== username && isOwnProfile) {
      localStorage.setItem('typingTutor_username', trimmed);
      setUsername(trimmed);
      setIsEditingUsername(false);
      navigate(`/profile/${encodeURIComponent(trimmed)}`, { replace: true });
      fetchUserData(trimmed);
    } else {
      setIsEditingUsername(false);
    }
  };

  const getFilteredSessions = () => {
    if (!sessions.length) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    return sessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      
      switch (timeFilter) {
        case 'today':
          return sessionDate >= today;
        case 'week':
          return sessionDate >= weekAgo;
        case 'month':
          return sessionDate >= monthAgo;
        case 'year':
          return sessionDate >= yearAgo;
        case 'all time':
        case 'all':
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
    // Normalize date to just the date part (no time) for comparison
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    };

    // Get start and end of selected year
    const yearStart = new Date(selectedYear, 0, 1); // January 1st
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59); // December 31st
    yearStart.setHours(0, 0, 0, 0);
    yearEnd.setHours(23, 59, 59, 999);

    const contributionMap = {};
    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at);
      sessionDate.setHours(0, 0, 0, 0);
      
      // Only include sessions from the selected year
      if (sessionDate >= yearStart && sessionDate <= yearEnd) {
        const dateKey = normalizeDate(sessionDate);
        contributionMap[dateKey] = (contributionMap[dateKey] || 0) + 1;
      }
    });

    // Generate grid for the selected year (53 weeks)
    const grid = [];
    const monthLabels = [];
    const yearStartDate = new Date(selectedYear, 0, 1);
    yearStartDate.setHours(0, 0, 0, 0);
    const startDayOfWeek = yearStartDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Start from Sunday of the week that contains January 1st
    const startOfGrid = new Date(yearStartDate);
    startOfGrid.setDate(startOfGrid.getDate() - startDayOfWeek);
    startOfGrid.setHours(0, 0, 0, 0);

    // Track months for labels
    let lastMonth = -1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate 53 weeks (to cover the full year)
    for (let week = 0; week < 53; week++) {
      const weekData = [];
      let weekHasYearData = false;
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfGrid);
        date.setDate(date.getDate() + (week * 7) + day);
        date.setHours(0, 0, 0, 0);
        
        // Check if this is the first day of a new month (for labels)
        const currentMonth = date.getMonth();
        if (day === 0 && currentMonth !== lastMonth && date >= yearStart && date <= yearEnd) {
          monthLabels.push({ week: week, month: monthNames[currentMonth] });
          lastMonth = currentMonth;
        }
        
        // Only include dates within the selected year
        if (date >= yearStart && date <= yearEnd) {
          const dateKey = normalizeDate(date);
          const count = contributionMap[dateKey] || 0;
          weekData.push({ date: dateKey, count, month: currentMonth });
          weekHasYearData = true;
        } else {
          // Outside the year, show empty
          weekData.push({ date: normalizeDate(date), count: 0, month: currentMonth });
        }
      }
      grid.push(weekData);
    }

    return { grid, monthLabels };
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];
    
    // Generate years from 2023 to current year
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    
    // Also add any years from sessions that might be before 2023
    sessions.forEach(session => {
      const year = new Date(session.created_at).getFullYear();
      if (year < startYear && !years.includes(year)) {
        years.push(year);
      }
    });
    
    return years.sort((a, b) => b - a); // Most recent first
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
            <polyline
              points={pointsWpm}
              fill="none"
              stroke="#e2b714"
              strokeWidth="2"
            />
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
  const { grid: contributionGrid, monthLabels } = getContributionData();
  // Show only Mon, Wed, Fri (indices 1, 3, 5)
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono">
      <div className="max-w-6xl mx-auto p-5">
        {/* Header */}
        <header className="flex justify-between items-center py-5 mb-6">
          <div className="flex-1 flex justify-start items-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <FiType className="w-4 h-4" />
              <span className="hidden md:inline">Test</span>
            </Link>
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
              to="/leaderboard"
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              title="View Leaderboard"
            >
              <FiAward className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Leaderboard</span>
            </Link>
          </div>
        </header>

        {/* Profile Content */}
        <div className="bg-bg-secondary rounded-lg border border-text-tertiary">
          <div className="p-6 border-b border-text-tertiary">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FiUser className="text-accent text-2xl" />
                <div>
                  {isEditingUsername && isOwnProfile ? (
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
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="text-text-tertiary hover:text-text-primary transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {leaderboardPosition && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <FiAward className="text-accent" />
                  <span>Rank #{leaderboardPosition} on Leaderboard</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
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

                {renderGraph()}

                <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <FiCalendar className="text-accent" />
                      Activity Heatmap
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span>Less activity</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 rounded bg-bg-tertiary border border-text-tertiary/20"></div>
                        <div className="w-3 h-3 rounded bg-accent/30 border border-text-tertiary/20"></div>
                        <div className="w-3 h-3 rounded bg-accent/50 border border-text-tertiary/20"></div>
                        <div className="w-3 h-3 rounded bg-accent/70 border border-text-tertiary/20"></div>
                        <div className="w-3 h-3 rounded bg-accent border border-text-tertiary/20"></div>
                      </div>
                      <span>More activity</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="overflow-x-auto flex-1">
                      <div style={{ minWidth: '750px' }}>
                        {/* Month labels row */}
                        <div className="flex mb-1 relative" style={{ paddingLeft: '28px', height: '16px' }}>
                          {monthLabels.map((label, idx) => {
                            // Calculate position: 28px (day labels) + week * 16px (12px cell + 4px gap)
                            const leftPos = 28 + label.week * 16;
                            return (
                              <div
                                key={idx}
                                className="text-xs text-text-tertiary absolute whitespace-nowrap"
                                style={{
                                  left: `${leftPos}px`,
                                }}
                              >
                                {label.month}
                              </div>
                            );
                          })}
                        </div>
                        {/* Grid with day labels */}
                        <div className="flex gap-1">
                          {/* Day of week labels */}
                          <div className="flex flex-col gap-1 mr-1">
                            {dayLabels.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className="h-3 flex items-center justify-end pr-1"
                                style={{ minWidth: '28px', width: '28px' }}
                              >
                                {day && (
                                  <span className="text-xs text-text-tertiary leading-none whitespace-nowrap">
                                    {day}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          {/* Heatmap grid */}
                          <div className="flex gap-1">
                            {contributionGrid.map((week, weekIndex) => (
                              <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((day, dayIndex) => {
                                  const isToday = day.date === new Date().toISOString().split('T')[0];
                                  const dateObj = new Date(day.date);
                                  const isInSelectedYear = dateObj.getFullYear() === selectedYear;
                                  return (
                                    <div
                                      key={dayIndex}
                                      className={`w-3 h-3 rounded ${getIntensityColor(day.count)} border ${
                                        isToday ? 'border-accent border-2' : 'border-text-tertiary/20'
                                      } ${!isInSelectedYear ? 'opacity-30' : ''}`}
                                      title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}${isToday ? ' (Today)' : ''}`}
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Year selector buttons - GitHub style (vertical on right) */}
                    <div className="flex flex-col gap-1 items-start">
                      {getAvailableYears().map(year => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                            selectedYear === year
                              ? 'bg-accent text-bg-primary font-semibold'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <FiBarChart2 className="text-accent" />
                      Session History
                    </h3>
                    <div className="flex gap-2">
                      {['all time', 'today', 'week', 'month', 'year'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => setTimeFilter(filter)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            timeFilter === filter || (filter === 'all time' && timeFilter === 'all')
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
                            
                            let dateStr = date.toLocaleDateString();
                            if (isToday) {
                              dateStr = 'Today';
                            } else if (timeFilter === 'week' || timeFilter === 'month') {
                              dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            } else if (timeFilter === 'year' || timeFilter === 'all time' || timeFilter === 'all') {
                              dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    </div>
  );
}

