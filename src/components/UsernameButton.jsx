import { useState, useEffect, useRef } from 'react';
import { FiUser, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

export default function UsernameButton({ onUsernameChange }) {
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('typingTutor_username');
    if (saved) {
      setUsername(saved);
    }
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(username);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setUsername(trimmed);
      localStorage.setItem('typingTutor_username', trimmed);
      setIsEditing(false);
      if (onUsernameChange) {
        onUsernameChange(trimmed);
      }
    }
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!username && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        title="Set your username"
      >
        <FiUser className="w-4 h-4 flex-shrink-0" />
        <span className="hidden md:inline">Set Username</span>
      </button>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[120px] max-w-[200px]">
          <FiUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter username"
            className="w-full pl-8 pr-2 py-1.5 bg-bg-tertiary border border-text-tertiary rounded text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            maxLength={50}
          />
        </div>
        <button
          onClick={handleSave}
          className="text-accent hover:text-[#f5c842] transition-colors flex-shrink-0"
          title="Save"
        >
          <FiCheck className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0"
          title="Cancel"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Truncate username for display
  const getDisplayUsername = () => {
    if (username.length <= 15) return username;
    return username.substring(0, 12) + '...';
  };

  return (
    <button
      onClick={handleEdit}
      className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm group max-w-full"
      title={username.length > 15 ? username : 'Click to edit username'}
    >
      <FiUser className="w-4 h-4 flex-shrink-0" />
      <span className="hidden md:inline truncate max-w-[140px]" title={username}>
        {getDisplayUsername()}
      </span>
      <span className="md:hidden truncate max-w-[80px]" title={username}>
        {username.length > 10 ? username.substring(0, 8) + '...' : username}
      </span>
      <FiEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
