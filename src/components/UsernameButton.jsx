import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';

export default function UsernameButton() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('typingTutor_username');
    if (saved) {
      setUsername(saved);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === 'typingTutor_username') {
        setUsername(e.newValue || '');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getDisplayUsername = () => {
    if (!username) return 'Set Username';
    if (username.length <= 15) return username;
    return username.substring(0, 12) + '...';
  };

  const profileUrl = username ? `/profile/${encodeURIComponent(username)}` : '/profile';

  return (
    <Link
      to={profileUrl}
      className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm max-w-full"
      title={username ? (username.length > 15 ? username : 'View profile') : 'Set your username'}
    >
      <FiUser className="w-4 h-4 flex-shrink-0" />
      {username ? (
        <>
          <span className="hidden md:inline truncate max-w-[140px]" title={username}>
            {getDisplayUsername()}
          </span>
          <span className="md:hidden truncate max-w-[80px]" title={username}>
            {username.length > 10 ? username.substring(0, 8) + '...' : username}
          </span>
        </>
      ) : (
        <span className="hidden md:inline">Set Username</span>
      )}
    </Link>
  );
}
