import React, { useEffect, useState, useCallback } from "react";
import "./CurrentTrack.css";
import { getPlayerState, getRecentlyPlayed } from "../../api/spotify";

export default function CurrentTrack() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [recentTrack, setRecentTrack] = useState(null);
  const [loading, setLoading] = useState(true);

    const formatDuration = useCallback((ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
    }, []);

    const normalizeTrack = useCallback((track) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: track.album.images?.[0]?.url,
    duration: formatDuration(track.duration_ms),
    }), [formatDuration]);

    const fetchData = useCallback(async () => {
    try {
        setLoading(true);

        const player = await getPlayerState();

        if (player?.item) {
        setCurrentTrack(normalizeTrack(player.item));
        setRecentTrack(null);
        return;
        }

        const recent = await getRecentlyPlayed(1);
        if (recent?.items?.length) {
        setRecentTrack(normalizeTrack(recent.items[0].track));
        }

        setCurrentTrack(null);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
    }, [normalizeTrack]);


  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="current-track-container">
        <p className="status">Loading...</p>
      </div>
    );
  }

  return (
    <div className="current-track-container">
      {currentTrack ? (
        <div className="now-playing">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="album-large"
          />
          <div className="track-details">
            <h2 className="track-title">{currentTrack.title}</h2>
            <p className="track-artist">{currentTrack.artist}</p>
            <span className="track-duration">{currentTrack.duration}</span>
          </div>
        </div>
      ) : recentTrack ? (
        <div className="recent-track">
          <span className="recent-label">Recently played</span>
          <div className="recent-content">
            <img
              src={recentTrack.albumArt}
              alt={recentTrack.title}
              className="album-small"
            />
            <div>
              <p className="track-title">{recentTrack.title}</p>
              <p className="track-artist">{recentTrack.artist}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="status">No playback activity</p>
      )}
    </div>
  );
}
