import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import './Player.css';
import {
  getPlayerState,
  togglePlayback,
  skipToNext,
  skipToPrevious,
  setVolume,
  unlikeTrack,
  likeTrack,
  checkTracksLiked,
  seekToPosition } from '../../api/spotify';
import { getTrackDetailsFromState } from './GetTrackDetails';

function Player() {
  const [track, setTrack] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(50);
  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const state = await getPlayerState();

        const trackDetails = getTrackDetailsFromState(state);
        setTrack(trackDetails);

        // Sync volume
        if (state?.device?.volume_percent !== undefined) {
          setVolumeState(state.device.volume_percent);
        }

        // Sync progress only when not actively seeking
        if (!isSeeking && trackDetails?.progressMs !== undefined) {
          setSeekValue(trackDetails.progressMs);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to get player state:', err);
        setError('Could not load player state');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerState();
    const interval = setInterval(fetchPlayerState, 2000);
    return () => clearInterval(interval);
  }, [isSeeking]);

  useEffect(() => {
    if (!track?.id) {
      setIsLiked(false);
      return;
    }

    async function checkLiked() {
      try {
        const results = await checkTracksLiked(track.id);
        setIsLiked(results[0]);
      } catch (err) {
        console.error('Failed to check liked status:', err);
      }
    }

    checkLiked();
  }, [track?.id]);

  const handleLikeToggle = async () => {
    if (!track?.id) return;
    setLoading(true);
    try {
      if (isLiked) {
        await unlikeTrack(track.id);
      } else {
        await likeTrack(track.id);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to update like status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!track) return;
    try {
      await togglePlayback();
      const state = await getPlayerState();
      setTrack(getTrackDetailsFromState(state));
    } catch (err) {
      console.error('Play/pause failed:', err);
    }
  };

  const handlePrevious = async () => {
    try {
      await skipToPrevious();
      await new Promise((res) => setTimeout(res, 300));
      const state = await getPlayerState();
      setTrack(getTrackDetailsFromState(state));
    } catch (err) {
      console.error('Previous failed:', err);
      alert('Could not go to previous track. Make sure something is playing.');
    }
  };

  const handleNext = async () => {
    try {
      await skipToNext();
      await new Promise((res) => setTimeout(res, 300));
      const state = await getPlayerState();
      setTrack(getTrackDetailsFromState(state));
    } catch (err) {
      console.error('Next failed:', err);
      alert('Could not skip to next track. Make sure something is playing.');
    }
  };

  const handleVolumeChange = async (e) => {
    const newVolume = Number(e.target.value);
    setVolumeState(newVolume);

    try {
      await setVolume(newVolume);
    } catch (err) {
      console.error('Volume update failed', err);
      // Re-sync on failure
      const state = await getPlayerState();
      if (state?.device?.volume_percent !== undefined) {
        setVolumeState(state.device.volume_percent);
      }
    }
  };

  const handleSeekChange = (e) => {
    const newPos = Number(e.target.value);
    setSeekValue(newPos);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = async (e) => {
    setIsSeeking(false);
    const newPos = Number(e.target.value);

    try {
      await seekToPosition(newPos);
      const state = await getPlayerState();
      const trackDetails = getTrackDetailsFromState(state);
      setTrack(trackDetails);
      setSeekValue(trackDetails.progressMs);
    } catch (err) {
      console.error('Seek failed:', err);
      // Re-sync on error
      const state = await getPlayerState();
      const trackDetails = getTrackDetailsFromState(state);
      setTrack(trackDetails);
      setSeekValue(trackDetails.progressMs);
    }
  };

  const formatTime = (ms) => {
    if (ms === undefined || ms === null) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="player-loading"></div>;
  }

  if (error) {
    return <div className="player-error">{error}</div>;
  }

  if (!track) {
    return (
      <div className="player player-empty">
        <p></p>
      </div>
    );
  }

  const progressPercent = track.durationMs ? (seekValue / track.durationMs) * 100 : 0;

  return (
    <div className="player" key={track.id}>
      {/* Left: Album art, title, heart */}
      <div className="player-left">
        <div className="current-track-image">
          {track.albumArt ? (
            <img src={track.albumArt} alt="Album cover" />
          ) : (
            <div className="no-image" />
          )}
        </div>

        <div className="current-track-info">
          <div className="track-carousel">
            <span className="current-track-title">{track.name}</span>
            <span className="track-separator"> • </span>
            <span className="current-track-artist">{track.artists}</span>
          </div>
        </div>

        <Heart
          className={`player-heart ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
          disabled={loading}
          fill={isLiked ? '#1db954' : 'none'}
          stroke={isLiked ? '#1db954' : '#b3b3b3'}
        />
      </div>

      {/* Center: Controls + Seek bar */}
      <div className="player-center">
        <div className="player-controls">
          <SkipBack className="control-icon" onClick={handlePrevious} />
          <button onClick={handleToggle} className="play-button">
            {track.isPlaying ? (
              <Pause className="play-iconn pause" />
            ) : (
              <Play className="play-iconn play-icon-offset" />
            )}
          </button>
          <SkipForward className="control-icon" onClick={handleNext} />
        </div>

        <div className="progress-container">
          <span className="progress-time">{formatTime(seekValue)}</span>

          <div className="progress-bar-wrapper">
            <div className="progress-track" />
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={track.durationMs || 0}
              value={seekValue}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              className="progress-seek"
              step="1000"
            />
          </div>

          <span className="progress-time">{formatTime(track.durationMs)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="player-right">
        <Volume2 className="volume-icon" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          style={{ '--fill-percent': `${volume}%` }}
        />
      </div>
    </div>
  );
}

export default Player;