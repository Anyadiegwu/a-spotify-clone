// import React, { useState, useEffect } from 'react';
// import './LikedSongs.css';
// import { getPlaylistTracks, playTrack, likeTrack, unlikeTrack, checkTracksLiked } from '../../api/spotify';
// import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';

// export default function LikedSongs({ 
//   currentTrack, 
//   isPlaying, 
//   togglePlayback,
//   likedTrackIds = new Set()
// }) {
//   const [tracks, setTracks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const [likedStatus, setLikedStatus] = useState({});
//   const [loadingLiked, setLoadingLiked] = useState(true);

//   useEffect(() => {
//     const loadLikedSongs = async () => {
//       setLoading(true);
//       try {
//         const data = await getPlaylistTracks('liked-songs');
//         setTracks(data.items || []);
//       } catch (err) {
//         console.error('Failed to load Liked Songs:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadLikedSongs();
//   }, []);

//   const formatDuration = (ms) => {
//     const minutes = Math.floor(ms / 60000);
//     const seconds = ((ms % 60000) / 1000).toFixed(0);
//     return `${minutes}:${seconds.padStart(2, '0')}`;
//   };

//   const handlePlayTrack = async (track) => {
//     try {
//         await playTrack(track.id);
//     } catch (error) {
//         console.error("Error playing track:", error);
//     }    
//   };
  
//     useEffect(() => {
        
//       if (tracks?.track || tracks.length === 0) {
//         setLikedStatus({});
//         setLoadingLiked(false);
//         return;
//       }
  
//       async function checkLikedForAllTracks() {
//         try {
//           const allTrackIds = tracks
//             .map((item) => item.track.id)
//             .filter((id) => id != null);
  
//           if (tracks.length === 0) {
//             setLikedStatus({});
//             setLoadingLiked(false);
//             return;
//           }
  
//           const batches = [];
//           for (let i = 0; i < allTrackIds.length; i += 50) {
//             batches.push(allTrackIds.slice(i, i + 50));
//           }
  
//           const batchResults = await Promise.all(
//             batches.map((batch) => checkTracksLiked(batch))
//           );
  
//           const statusMap = {};
//           let index = 0;
//           batchResults.forEach((batch) => {
//             batch.forEach((isLiked) => {
//               statusMap[allTrackIds[index]] = isLiked;
//               index++;
//             });
//           });
  
//           setLikedStatus(statusMap);
//         } catch (err) {
//           console.error("Failed to check liked status for playlist tracks:", err);
//           setLikedStatus({});
//         } finally {
//           setLoadingLiked(false);
//         }
//       }
  
//       checkLikedForAllTracks();
//     }, [tracks]);
  
//     const handleLikeToggle = async (trackId) => {  
//       const currentLiked = likedStatus[trackId] || false;
  
//       try {
//         if (currentLiked) {
//           await unlikeTrack(trackId);
//         } else {
//           await likeTrack(trackId);
//         }
  
//         setLikedStatus((prev) => ({
//           ...prev,
//           [trackId]: !currentLiked,
//         }));
//       } catch (err) {
//         console.error("Failed to toggle like:", err);
//         alert("Could not update like status. Try again.");
//       }
//     };

//   const isCurrentTrack = (trackId) => currentTrack?.id === trackId;

//   return (
//     <div className="likedsongs-view">
//       <div className="likedsongs-header">
//         <div className="likedsongs-cover-shadow">
//           <div className="likedsongs-cover">
//             <Heart size={80} fill="#1ed760" stroke="#1ed760" />
//           </div>
//         </div>

//         <div className="likedsongs-info">
//           <span className="playlist-badge">Playlist</span>
//           <h1 className="likedsongs-title">Liked Songs</h1>
//           <p className="likedsongs-description">
//             {tracks.length > 0 ? `${tracks.length} songs you've liked` : 'Your favorite tracks'}
//           </p>
//         </div>
//       </div>

//       <div className="likedsongs-controls">
//         <button className="play-button-large" aria-label="Play all">
//           <Play size={28} fill="black" />
//         </button>
//         <button className="more-button" aria-label="More options">
//           <MoreHorizontal size={32} />
//         </button>
//       </div>

//       <div className="likedsongs-tracks">
//         <table className="tracks-table">
//           <thead>
//             <tr>
//               <th className="index-col">#</th>
//               <th>Title</th>
//               <th className="album-col">Album</th>
//               <th className="duration-col">
//                 <Clock size={16} />
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="4" className="loading-message">Loading your liked songs...</td>
//               </tr>
//             ) : tracks.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="empty-message">
//                   No liked songs yet. Start adding some! ❤️
//                 </td>
//               </tr>
//             ) : (
//               tracks.map((item, index) => {
//                 const track = item.track;
//                 const isHovered = hoveredIndex === index;
//                 const isCurrentlyPlaying = isCurrentTrack(track.id);
//                 const isLiked = likedStatus[track.id] || false;
//                 const isLoadingThisTrack = loadingLiked && likedStatus[track.id] === undefined;

//                 return (
//                   <tr
//                     key={track.id}
//                     className={`track-row ${isCurrentlyPlaying ? 'playing' : ''}`}
//                     onMouseEnter={() => setHoveredIndex(index)}
//                     onMouseLeave={() => setHoveredIndex(null)}
//                   >
//                     <td className="index-col">
//                       {isHovered || isCurrentlyPlaying ? (
//                         <button
//                           className="play-pause-btn"
//                           onClick={() => 
//                             isCurrentlyPlaying ? togglePlayback() : handlePlayTrack(track, index)
//                           }
//                           aria-label={isCurrentlyPlaying && isPlaying ? 'Pause' : 'Play'}
//                         >
//                           {isCurrentlyPlaying && isPlaying ? (
//                             <Pause size={16} />
//                           ) : (
//                             <Play size={16} fill="white" />
//                           )}
//                         </button>
//                       ) : (
//                         <span className="track-index">{index + 1}</span>
//                       )}
//                     </td>

//                     <td className="title-col">
//                       <div className="title-wrapper">
//                         {track.album.images?.[2]?.url ? (
//                           <img src={track.album.images[2].url} alt={track.album.name} />
//                         ) : (
//                           <div className="mini-placeholder">♪</div>
//                         )}
//                         <div>
//                           <div className={`track-name ${isCurrentlyPlaying ? 'now-playing' : ''}`}>
//                             {track.name}
//                           </div>
//                           <div className="artists">
//                             {track.artists.map(a => a.name).join(', ')}
//                           </div>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="album-col">{track.album.name}</td>

//                     <td className="duration-col">
//                       <span className="duration">{formatDuration(track.duration_ms)}</span>
//                       <button
//                         className="like-btn"
//                         onClick={() => handleLikeToggle(track.id)}
//                         aria-label={likedTrackIds.has(track.id) ? 'Unlike song' : 'Like song'}
//                       >
//                         <Heart
//                           size={16}
//                           disabled={isLoadingThisTrack}
//                           fill={isLiked ? '#1ed760' : 'none'}
//                           stroke={isLiked ? "#1db954" : "#b3b3b3"}
//                           style={{ cursor: isLoadingThisTrack ? "wait" : "pointer" }}
//                         />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import './LikedSongs.css';
import { getPlaylistTracks, playTrack, likeTrack, unlikeTrack, checkTracksLiked } from '../../frontend/spotify';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';

export default function LikedSongs({ 
  currentTrack, 
  isPlaying, 
  togglePlayback,
  // likedTrackIds = new Set()
}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [likedStatus, setLikedStatus] = useState({});
  const [loadingLiked, setLoadingLiked] = useState(true);

  useEffect(() => {
    const loadLikedSongs = async () => {
      setLoading(true);
      try {
        const data = await getPlaylistTracks('liked-songs');
        setTracks(data.items || []);
      } catch (err) {
        console.error('Failed to load Liked Songs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLikedSongs();
  }, []);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const handlePlayTrack = async (track) => {
    try {
        await playTrack(track.id);
    } catch (error) {
        console.error("Error playing track:", error);
    }    
  };
  
  useEffect(() => {
    if (tracks?.track || tracks.length === 0) {
      setLikedStatus({});
      setLoadingLiked(false);
      return;
    }

    async function checkLikedForAllTracks() {
      try {
        const allTrackIds = tracks
          .map((item) => item.track.id)
          .filter((id) => id != null);

        if (tracks.length === 0) {
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
  }, [tracks]);

  const handleLikeToggle = async (trackId) => {  
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

  const isCurrentTrack = (trackId) => currentTrack?.id === trackId;

  return (
    <div className="likedsongs-view">
      <div className="likedsongs-header">
        <div className="likedsongs-cover-shadow">
          <div className="likedsongs-cover">
            <Heart size={80} fill="#1ed760" stroke="#1ed760" />
          </div>
        </div>

        <div className="likedsongs-info">
          <span className="playlist-badge">Playlist</span>
          <h1 className="likedsongs-title">Liked Songs</h1>
          <p className="likedsongs-description">
            {tracks.length > 0 ? `${tracks.length} songs you've liked` : 'Your favorite tracks'}
          </p>
        </div>
      </div>

      <div className="likedsongs-controls">
        <button className="play-button-large" aria-label="Play all">
          <Play size={28} fill="black" />
        </button>
        <button className="more-button" aria-label="More options">
          <MoreHorizontal size={32} />
        </button>
      </div>

      <div className="likedsongs-tracks">
        <table className="tracks-table">
          <thead>
            <tr>
              <th className="index-col">#</th>
              <th className="title-col">Title</th>
              <th className="album-col">Album</th>
              <th className="duration-col">
                <Clock size={16} />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-message">Loading your liked songs...</td>
              </tr>
            ) : tracks.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-message">
                  No liked songs yet. Start adding some! ❤️
                </td>
              </tr>
            ) : (
              tracks.map((item, index) => {
                const track = item.track;
                const isHovered = hoveredIndex === index;
                const isCurrentlyPlaying = isCurrentTrack(track.id);
                const isLiked = likedStatus[track.id] || false;
                const isLoadingThisTrack = loadingLiked && likedStatus[track.id] === undefined;

                return (
                  <tr
                    key={track.id}
                    className={`track-row ${isCurrentlyPlaying ? 'playing' : ''}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Column 1: Index/Play Button */}
                    <td className="index-col">
                      {isHovered || isCurrentlyPlaying ? (
                        <button
                          className="play-pause-btn"
                          onClick={() => 
                            isCurrentlyPlaying ? togglePlayback() : handlePlayTrack(track, index)
                          }
                          aria-label={isCurrentlyPlaying && isPlaying ? 'Pause' : 'Play'}
                        >
                          {isCurrentlyPlaying && isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} fill="white" />
                          )}
                        </button>
                      ) : (
                        <span className="track-index">{index + 1}</span>
                      )}
                    </td>

                    {/* Column 2: Title */}
                    <td className="title-col">
                      <div className="title-wrapper">
                        {track.album.images?.[2]?.url ? (
                          <img src={track.album.images[2].url} alt={track.album.name} />
                        ) : (
                          <div className="mini-placeholder">♪</div>
                        )}
                        <div>
                          <div className={`track-name ${isCurrentlyPlaying ? 'now-playing' : ''}`}>
                            {track.name}
                          </div>
                          <div className="artists">
                            {track.artists.map(a => a.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Album (hidden on mobile) */}
                    <td className="album-col">{track.album.name}</td>

                    {/* Column 4: Duration */}
                    <td className="duration-col">
                      <span className="duration">{formatDuration(track.duration_ms)}</span>
                      <button
                        className="like-btn"
                        onClick={() => handleLikeToggle(track.id)}
                        aria-label={isLiked ? 'Unlike song' : 'Like song'}
                      >
                        <Heart
                          size={16}
                          disabled={isLoadingThisTrack}
                          fill={isLiked ? '#1ed760' : 'none'}
                          stroke={isLiked ? "#1db954" : "#b3b3b3"}
                          style={{ cursor: isLoadingThisTrack ? "wait" : "pointer" }}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}