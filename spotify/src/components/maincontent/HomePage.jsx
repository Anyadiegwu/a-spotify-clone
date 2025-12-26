import React, { useState, useEffect } from 'react';
import { Play, Music, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { getTopTracks, getTopArtists, getRecentlyPlayed, playTrack } from '../../api/spotify';
import './HomePage.css';

export default function HomePage() {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good afternoon');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning!');
    else if (hour < 18) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');

    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      const [tracks, artists, recent] = await Promise.all([
        getTopTracks('short_term', 10),
        getTopArtists('short_term', 8),
        getRecentlyPlayed(8),
      ]);

      setTopTracks(tracks.items || []);
      setTopArtists(artists.items || []);
      setRecentlyPlayed(recent.items || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPlay = (trackId) => {
    playTrack(trackId);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <Music className="loading-icon" />
          <p>Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-greeting">{greeting}</h1>
      </div>
      
      {/* Quick Picks - Jump Back In */}
      {topTracks.length > 0 && (
        <section className="home-section">
          <div className="quick-picks">
            {topTracks.slice(0, 8).map((track) => (
              <div
                key={track.id}
                className="quick-pick-item"
                onClick={()=> handleTrackPlay(track.id)}
              >
                <div className="quick-pick-image"
                id='quick-pick-image'>
                  {track.album?.images?.[0] ? (
                    <img src={track.album.images[0].url} alt={track.name} />
                  ) : (
                    <div style={{
                      background: '#282828',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Music style={{ width: '40px', height: '40px', color: '#727272' }} />
                    </div>
                  )}
                </div>

                <div className="quick-pick-title">{track.name}</div>

                <button className="quick-pick-playy">
                  <Play className="play-iicon" fill="black" onClick={()=> handleTrackPlay(track.id)}/>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Artists Section */}
      {topArtists.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              Your top artists this month
            </h2>
          </div>
          <div className="artists-grid">
            {topArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <div className="artist-image-wrapper">
                  {artist.images?.[0] ? (
                    <img 
                      src={artist.images[0].url} 
                      alt={artist.name}
                      className="artist-image"
                    />
                  ) : (
                    <div className="artist-placeholder">
                      <Music className="placeholder-icon" />
                    </div>
                  )}
                  <button className="artist-play-btn">
                    <Play className="play-icon" fill="black" />
                  </button>
                </div>
                <h3 className="artist-name">{artist.name}</h3>
                <p className="artist-type">Artist</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              Recently played
            </h2>
          </div>
          <div className="tracks-grid">
            {recentlyPlayed.map((item, idx) => {
              const track = item.track;
              return (
                <div 
                  key={`${track.id}-${idx}`} 
                  className="track-card"
                  onClick={() => handleTrackPlay(track.id)}
                >
                  <div className="track-image-wrapper">
                    {track.album?.images?.[0] ? (
                      <img 
                        src={track.album.images[0].url} 
                        alt={track.name}
                        className="track-image"
                      />
                    ) : (
                      <div className="track-placeholder">
                        <Music className="placeholder-icon" />
                      </div>
                    )}
                    <button className="track-play-bttn">
                      <Play className="play-iicon" fill="black" />
                    </button>
                  </div>
                  <h3 className="track-name">{track.name}</h3>
                  <p className="track-artist">
                    {track.artists?.map(a => a.name).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* More Top Tracks Section */}
      {topTracks.length > 8 && (
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              Your top tracks
            </h2>
          </div>
          <div className="tracks-grid">
            {topTracks.slice(8).map((track) => (
              <div 
                key={track.id} 
                className="track-card"
                onClick={() => handleTrackPlay(track.id)}
              >
                <div className="track-image-wrapper">
                  {track.album?.images?.[0] ? (
                    <img 
                      src={track.album.images[0].url} 
                      alt={track.name}
                      className="track-image"
                    />
                  ) : (
                    <div className="track-placeholder">
                      <Music className="placeholder-icon" />
                    </div>
                  )}
                  <button className="track-play-bttn">
                    <Play className="play-iicon" />
                  </button>
                </div>
                <h3 className="track-name">{track.name}</h3>
                <p className="track-artist">
                  {track.artists?.map(a => a.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {topTracks.length === 0 && topArtists.length === 0 && recentlyPlayed.length === 0 && (
        <div className="empty-state">
          <Music className="empty-icon" />
          <h2>Start Listening</h2>
          <p>Play some music to see your personalized recommendations here</p>
        </div>
      )}
    </div>
  );
}