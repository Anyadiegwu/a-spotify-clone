import React, { useState, useEffect } from "react";
import "../maincontent/MainContent.css";
import { Play, Heart } from "lucide-react";
import { playTrack, likeTrack, unlikeTrack, checkTracksLiked } from "../../frontend/spotify";

export default function PlaylistView({ playlist }) {
  const [likedStatus, setLikedStatus] = useState({});
  const [loadingLiked, setLoadingLiked] = useState(true);
  
  useEffect(() => {
    if (!playlist?.tracks?.items || playlist.tracks.items.length === 0) {
      setLikedStatus({});
      setLoadingLiked(false);
      return;
    }

    async function checkLikedForAllTracks() {
      try {
        const trackItems = playlist.tracks.items;
        const allTrackIds = trackItems
          .map((item) => item.track?.id)
          .filter((id) => id != null);

        if (allTrackIds.length === 0) {
          setLikedStatus({});
          setLoadingLiked(false);
          return;
        }

        const batches = [];
        for (let i = 0; i < allTrackIds.length; i += 50) {
          batches.push(allTrackIds.slice(i, i + 50));
        }

        const batchResults = await Promise.all(
          batches.map((batch) => checkTracksLiked(batch))
        );

        const statusMap = {};
        let index = 0;
        batchResults.forEach((batch) => {
          batch.forEach((isLiked) => {
            statusMap[allTrackIds[index]] = isLiked;
            index++;
          });
        });

        setLikedStatus(statusMap);
      } catch (err) {
        console.error("Failed to check liked status for playlist tracks:", err);
        setLikedStatus({});
      } finally {
        setLoadingLiked(false);
      }
    }

    checkLikedForAllTracks();
  }, [playlist?.tracks?.items]);

  const handleLikeToggle = async (trackId, e) => {
    e.stopPropagation();

    const currentLiked = likedStatus[trackId] || false;

    try {
      if (currentLiked) {
        await unlikeTrack(trackId);
      } else {
        await likeTrack(trackId);
      }

      setLikedStatus((prev) => ({
        ...prev,
        [trackId]: !currentLiked,
      }));
    } catch (err) {
      console.error("Failed to toggle like:", err);
      alert("Could not update like status. Try again.");
    }
  };

  const handleClicked = async (trackUri) => {
    try {
      const trackId = trackUri.split(":").pop();
      await playTrack(trackId);
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  if (!playlist) {
    return <div className="loading">Loading tracks...</div>;
  }

  if (!playlist.tracks?.items?.length) {
    return <div className="loading">No tracks found</div>;
  }

  return (
    <div className="playlist-tracks">
      {(playlist.tracks?.items || playlist || []).map((item, index) => {
        const track = item.track;
        if (!track) return null;

        const isLiked = likedStatus[track.id] || false;
        const isLoadingThisTrack = loadingLiked && likedStatus[track.id] === undefined;

        const minutes = Math.floor(track.duration_ms / 60000);
        const seconds = Math.floor((track.duration_ms % 60000) / 1000)
          .toString()
          .padStart(2, "0");

        return (
          <div
            key={track.id}
            className="song-row"
            onClick={() => handleClicked(track.uri)}
          >
            {/* Column 1: Number/Play Icon - matches header-numberr (50px) */}
            <div className="song-number">
              <span className="number-text">{index + 1}</span>
              <Play className="play-icon" fill="white" size={16} />
            </div>

            {/* Column 2: Title - matches header-titlee (1fr) */}
            <div className="song-info">
              <div className="song-thumbnail">
                <img
                  src={track.album.images[2]?.url || "/default-album.png"}
                  alt={track.name}
                />
              </div>
              <div className="song-details">
                <div className="song-title">{track.name}</div>
                <div className="song-artist">
                  {track.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </div>

            {/* Column 3: Album - matches header-albumm (1fr) */}
            <div className="song-album">{track.album.name}</div>

            {/* Column 4: Duration - matches header-durationn (80px) */}
            <div className="song-duration">
              <Heart
                className="heart-icon"
                onClick={(e) => handleLikeToggle(track.id, e)}
                disabled={isLoadingThisTrack}
                fill={isLiked ? "#1db954" : "none"}
                stroke={isLiked ? "#1db954" : "#b3b3b3"}
                size={18}
                style={{ cursor: isLoadingThisTrack ? "wait" : "pointer" }}
              />
              <span className="duration-text">{minutes}:{seconds}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}