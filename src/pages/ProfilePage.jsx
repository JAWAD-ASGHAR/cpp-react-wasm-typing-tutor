import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isLeaderboardEnabled } from '../lib/supabase';
import { FiTrendingUp, FiCalendar, FiBarChart2, FiAward, FiUser, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { FaRegKeyboard } from 'react-icons/fa6';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('typingTutor_username');
    const profileUsername = urlUsername ? decodeURIComponent(urlUsername) : savedUsername;
    
    if (profileUsername) {
      setSessions([]);
      setLeaderboardPosition(null);
      setBestScore(null);
      
      setUsername(profileUsername);
      setEditValue(profileUsername);
      setIsOwnProfile(!urlUsername || profileUsername === savedUsername);
      fetchUserData(profileUsername);
    } else {
      setLoading(false);
    }
  }, [urlUsername]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'typingTutor_username' && e.newValue) {
        const newUsername = e.newValue;
        const profileUsername = urlUsername ? decodeURIComponent(urlUsername) : newUsername;
        if (profileUsername === newUsername && isOwnProfile) {
          setUsername(newUsername);
          setEditValue(newUsername);
          fetchUserData(newUsername);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [urlUsername, isOwnProfile]);

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

  const handleSaveUsername = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== username && isOwnProfile) {
      localStorage.setItem('typingTutor_username', trimmed);
      setUsername(trimmed);
      setEditValue(trimmed);
      setIsEditingUsername(false);
      
      navigate(`/profile/${encodeURIComponent(trimmed)}`, { replace: true });
      
      await fetchUserData(trimmed);
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleSetNewUsername = async () => {
    const trimmed = newUsername.trim();
    if (trimmed) {
      localStorage.setItem('typingTutor_username', trimmed);
      setUsername(trimmed);
      setEditValue(trimmed);
      setNewUsername('');
      setIsSettingUsername(false);
      
      navigate(`/profile/${encodeURIComponent(trimmed)}`, { replace: true });
      
      await fetchUserData(trimmed);
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
    if (!filtered.length) return [];

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

    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      let wpm = 0;
      let accuracy = 0;
      
      if (dataByDate[dateKey]) {
        wpm = Math.round(dataByDate[dateKey].wpm.reduce((a, b) => a + b, 0) / dataByDate[dateKey].wpm.length);
        accuracy = parseFloat((dataByDate[dateKey].accuracy.reduce((a, b) => a + b, 0) / dataByDate[dateKey].accuracy.length).toFixed(1));
      }
      
      let label = dateKey;
      if (graphPeriod === 'day') {
        label = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (graphPeriod === 'week') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      chartData.push({
        date: label,
        dateKey: dateKey,
        wpm: wpm,
        accuracy: accuracy
      });
    }

    return chartData;
  };

  const getContributionData = () => {
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    };

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
    yearStart.setHours(0, 0, 0, 0);
    yearEnd.setHours(23, 59, 59, 999);

    const contributionMap = {};
    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate >= yearStart && sessionDate <= yearEnd) {
        const dateKey = normalizeDate(sessionDate);
        contributionMap[dateKey] = (contributionMap[dateKey] || 0) + 1;
      }
    });

    const grid = [];
    const monthLabels = [];
    const yearStartDate = new Date(selectedYear, 0, 1);
    yearStartDate.setHours(0, 0, 0, 0);
    const startDayOfWeek = yearStartDate.getDay();
    
    const startOfGrid = new Date(yearStartDate);
    startOfGrid.setDate(startOfGrid.getDate() - startDayOfWeek);
    startOfGrid.setHours(0, 0, 0, 0);

    let lastMonth = -1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let week = 0; week < 53; week++) {
      const weekData = [];
      let weekHasYearData = false;
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfGrid);
        date.setDate(date.getDate() + (week * 7) + day);
        date.setHours(0, 0, 0, 0);
        
        const currentMonth = date.getMonth();
        if (day === 0 && currentMonth !== lastMonth && date >= yearStart && date <= yearEnd) {
          monthLabels.push({ week: week, month: monthNames[currentMonth] });
          lastMonth = currentMonth;
        }
        
        if (date >= yearStart && date <= yearEnd) {
          const dateKey = normalizeDate(date);
          const count = contributionMap[dateKey] || 0;
          weekData.push({ date: dateKey, count, month: currentMonth });
          weekHasYearData = true;
        } else {
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
    
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    
    sessions.forEach(session => {
      const year = new Date(session.created_at).getFullYear();
      if (year < startYear && !years.includes(year)) {
        years.push(year);
      }
    });
    
    return years.sort((a, b) => b - a);
  };

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-bg-tertiary';
    if (count === 1) return 'bg-accent/30';
    if (count <= 3) return 'bg-accent/50';
    if (count <= 5) return 'bg-accent/70';
    return 'bg-accent';
  };

  const renderGraph = () => {
    const chartData = getGraphData();
    if (!chartData.length) {
      return (
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-5 md:p-6 border border-text-tertiary">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-1.5 sm:gap-2">
              <FiTrendingUp className="text-accent w-4 h-4 sm:w-5 sm:h-5" />
              Progress Over Time
            </h3>
            <div className="hidden sm:flex gap-2">
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
            <select
              value={graphPeriod}
              onChange={(e) => setGraphPeriod(e.target.value)}
              className="sm:hidden px-3 py-1.5 text-xs rounded bg-bg-tertiary text-text-primary border border-text-tertiary focus:outline-none focus:border-accent transition-colors"
            >
              {['day', 'week', 'month'].map(period => (
                <option key={period} value={period}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center text-text-tertiary py-12">
            No data available for this period
          </div>
        </div>
      );
    }

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length && payload[0]?.payload) {
        const data = payload[0].payload;
        return (
          <div className="bg-bg-tertiary border border-text-tertiary rounded-lg p-3 shadow-lg">
            <p className="text-text-secondary text-xs mb-2">{data.dateKey || data.date}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value !== undefined ? entry.value : 'N/A'}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
        <div className="bg-bg-secondary rounded-lg p-6 border border-text-tertiary">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <FiTrendingUp className="text-accent" />
              Progress Over Time
            </h3>
            <div className="hidden sm:flex gap-2">
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
            <select
              value={graphPeriod}
              onChange={(e) => setGraphPeriod(e.target.value)}
              className="sm:hidden px-3 py-1.5 text-xs rounded bg-bg-tertiary text-text-primary border border-text-tertiary focus:outline-none focus:border-accent transition-colors"
            >
              {['day', 'week', 'month'].map(period => (
                <option key={period} value={period}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </option>
              ))}
            </select>
          </div>
        <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="currentColor"
                style={{ fill: 'currentColor', opacity: 0.5, fontSize: '11px' }}
                tick={{ fill: 'currentColor', opacity: 0.5 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="wpm"
                stroke="currentColor"
                style={{ fill: 'currentColor', opacity: 0.5, fontSize: '11px' }}
                tick={{ fill: 'currentColor', opacity: 0.5 }}
                width={50}
                label={{ value: 'WPM', angle: -90, position: 'insideLeft', style: { fill: '#e2b714', opacity: 0.8, fontSize: '11px' } }}
              />
              <YAxis 
                yAxisId="accuracy"
                orientation="right"
                stroke="currentColor"
                style={{ fill: 'currentColor', opacity: 0.5, fontSize: '11px' }}
                tick={{ fill: 'currentColor', opacity: 0.5 }}
                domain={[0, 100]}
                width={50}
                label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', style: { fill: '#4a9eff', opacity: 0.8, fontSize: '11px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => (
                  <span className="text-text-tertiary text-xs">{value}</span>
                )}
              />
              <Line 
                yAxisId="wpm"
                type="monotone" 
                dataKey="wpm" 
                stroke="#e2b714" 
                strokeWidth={2}
                dot={{ fill: '#e2b714', r: 3 }}
                activeDot={{ r: 5 }}
                name="WPM"
              />
              <Line 
                yAxisId="accuracy"
                type="monotone" 
                dataKey="accuracy" 
                stroke="#4a9eff" 
                strokeWidth={2}
                strokeOpacity={0.8}
                dot={{ fill: '#4a9eff', r: 3 }}
                activeDot={{ r: 5 }}
                name="Accuracy %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const filteredSessions = getFilteredSessions();
  const { grid: contributionGrid, monthLabels } = getContributionData();
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-5">
        <header className="flex justify-between items-center py-3 sm:py-4 md:py-5 mb-4 sm:mb-5 md:mb-6">
          <div className="flex-1 flex justify-start items-center min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-text-secondary hover:text-text-primary transition-colors text-xs sm:text-sm"
            >
              <FaRegKeyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden md:inline">Test</span>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0 px-2">
            <Link to="/" className="flex flex-col items-center gap-0.5 sm:gap-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary tracking-tight transition-colors duration-300">
                typetutor
              </span>
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

        <div className="bg-bg-secondary rounded-lg border border-text-tertiary">
          <div className="p-4 sm:p-5 md:p-6 border-b border-text-tertiary">
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

          <div className="p-4 sm:p-5 md:p-6">
            {loading ? (
              <div className="text-center text-text-secondary py-12">
                Loading profile...
              </div>
            ) : !username ? (
              <div className="text-center py-12">
                {!isSettingUsername ? (
                  <div className="space-y-4">
                    <p className="text-text-secondary mb-6">
                      Please set a username to view your profile
                    </p>
                    <button
                      onClick={() => setIsSettingUsername(true)}
                      className="px-6 py-3 bg-accent text-bg-primary rounded-md font-semibold hover:bg-[#f5c842] transition-colors"
                    >
                      Set Username
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <p className="text-text-secondary mb-4">
                      Enter your username to get started
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSetNewUsername();
                            if (e.key === 'Escape') {
                              setIsSettingUsername(false);
                              setNewUsername('');
                            }
                          }}
                          placeholder="Enter your username"
                          className="w-full pl-10 pr-3 py-2.5 bg-bg-tertiary border border-text-tertiary rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
                          maxLength={50}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleSetNewUsername}
                        disabled={!newUsername.trim()}
                        className="px-4 py-2.5 bg-accent text-bg-primary rounded-md font-semibold hover:bg-[#f5c842] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsSettingUsername(false);
                          setNewUsername('');
                        }}
                        className="px-4 py-2.5 bg-bg-tertiary border border-text-tertiary rounded-md text-text-primary hover:bg-bg-primary transition-colors flex items-center gap-2"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-text-tertiary">
                      {newUsername.length}/50 characters
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {bestScore && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-bg-tertiary rounded-lg p-3 sm:p-4 border border-text-tertiary">
                      <div className="text-[10px] sm:text-xs text-text-tertiary uppercase mb-1">Best WPM</div>
                      <div className="text-xl sm:text-2xl font-bold text-accent">{Math.round(bestScore.wpm)}</div>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 sm:p-4 border border-text-tertiary">
                      <div className="text-[10px] sm:text-xs text-text-tertiary uppercase mb-1">Best Accuracy</div>
                      <div className="text-xl sm:text-2xl font-bold text-accent">{bestScore.accuracy.toFixed(1)}%</div>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 sm:p-4 border border-text-tertiary">
                      <div className="text-[10px] sm:text-xs text-text-tertiary uppercase mb-1">Total Sessions</div>
                      <div className="text-xl sm:text-2xl font-bold text-accent">{sessions.length}</div>
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
                        <div className="flex mb-1 relative" style={{ paddingLeft: '28px', height: '16px' }}>
                          {monthLabels.map((label, idx) => {
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
                        <div className="flex gap-1">
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

                <div className="bg-bg-secondary rounded-lg p-4 sm:p-5 md:p-6 border border-text-tertiary">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-1.5 sm:gap-2">
                      <FiBarChart2 className="text-accent w-4 h-4 sm:w-5 sm:h-5" />
                      Session History
                    </h3>
                    <div className="hidden sm:flex gap-2 flex-wrap">
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
                    <select
                      value={timeFilter === 'all' ? 'all time' : timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="sm:hidden px-3 py-1.5 text-xs rounded bg-bg-tertiary text-text-primary border border-text-tertiary focus:outline-none focus:border-accent transition-colors w-full sm:w-auto"
                    >
                      {['all time', 'today', 'week', 'month', 'year'].map(filter => (
                        <option key={filter} value={filter}>
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </option>
                      ))}
                    </select>
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

