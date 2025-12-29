import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  X, 
  ChevronDown,
  Shuffle,
  Repeat,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import './FullScreenPlayer.css';

function FullScreenPlayer({ 
  track, 
  isOpen, 
  onClose, 
  isLiked, 
  onLikeToggle,
  onTogglePlayback,
  onNext,
  onPrevious,
  seekValue,
  onSeekChange,
  onSeekMouseDown,
  onSeekMouseUp,
  formatTime,
  loading
}) {
  if (!isOpen || !track) return null;

  const progressPercent = track.durationMs ? (seekValue / track.durationMs) * 100 : 0;

  return (
    <div className="fullscreen-player-overlay">
      <div className="fullscreen-player">
        {/* Header */}
        <div className="fullscreen-header">
          <button className="close-button" onClick={onClose}>
            <ChevronDown size={28} />
          </button>
          <div className="playing-from">
            <span>PLAYING RECOMMENDED TRACKS</span>
          </div>
          <button className="more-button">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Album Art */}
        <div className="fullscreen-album-art">
          {track.albumArt ? (
            <img src={track.albumArt} alt={track.name} />
          ) : (
            <div className="no-album-art" />
          )}
        </div>

        {/* Track Info */}
        <div className="fullscreen-track-info">
          <div className="track-details">
            <h2 className="fullscreen-track-title">{track.name}</h2>
            <p className="fullscreen-track-artist">{track.artists}</p>
          </div>
          <div className="track-actions">
            <button className="action-icon">
              <X size={24} />
            </button>
            <button 
              className="action-icon" 
              onClick={onLikeToggle}
              disabled={loading}
            >
              <Heart 
                size={24} 
                fill={isLiked ? '#1db954' : 'none'}
                stroke={isLiked ? '#1db954' : '#b3b3b3'}
              />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="fullscreen-progress-section">
          <div className="fullscreen-progress-bar-wrapper">
            <div className="fullscreen-progress-track" />
            <div
              className="fullscreen-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={track.durationMs || 0}
              value={seekValue}
              onChange={onSeekChange}
              onMouseDown={onSeekMouseDown}
              onMouseUp={onSeekMouseUp}
              onTouchStart={onSeekMouseDown}
              onTouchEnd={onSeekMouseUp}
              className="fullscreen-progress-seek"
              step="1000"
            />
          </div>
          <div className="fullscreen-progress-times">
            <span>{formatTime(seekValue)}</span>
            <span>{formatTime(track.durationMs)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="fullscreen-controls">
          <button className="control-button secondary">
            <Shuffle size={20} />
          </button>
          
          <button className="control-button" onClick={onPrevious}>
            <SkipBack size={32} fill="white" />
          </button>
          
          <button className="control-button play-pause" onClick={onTogglePlayback}>
            {track.isPlaying ? (
              <Pause size={32} fill="black" />
            ) : (
              <Play size={32} fill="black" style={{ marginLeft: '3px' }} />
            )}
          </button>
          
          <button className="control-button" onClick={onNext}>
            <SkipForward size={32} fill="white" />
          </button>
          
          <button className="control-button secondary">
            <Repeat size={20} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="fullscreen-bottom-actions">
          <button className="bottom-action-button">
            <Share2 size={20} />
          </button>
          <button className="bottom-action-button">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FullScreenPlayer;