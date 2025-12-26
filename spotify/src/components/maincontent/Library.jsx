import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import './Library.css';
import { getLibraryContent, getPlaylistTracks } from '../../frontend/spotify'; 

export default function Library({ setCurrentView, onPlaylistSelect }) {
  const [activeFilter, setActiveFilter] = useState('playlists');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ['playlists', 'artists', 'albums', 'podcasts'];

  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);
      try {
        const data = await getLibraryContent(); 

        let displayItems = [];

        if (activeFilter === 'playlists') {
          displayItems = [
            data.likedSongs, 
            ...data.playlists
          ];
        } else if (activeFilter === 'artists') {
          displayItems = data.artists;
        } else if (activeFilter === 'albums') {
          displayItems = data.albums;
        } else if (activeFilter === 'podcasts') {
          displayItems = data.podcasts;
        }

        setItems(displayItems);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [activeFilter]);

  const handleItemClick = async (item) => {
    if (item.type === 'playlist' && item.id === 'liked-songs') {
        setCurrentView('liked');
        onPlaylistSelect(item); 
    }else if (item.type === "playlist" && item.id != "liked-songs"){
        try {
        const tracksData = await getPlaylistTracks(item.id);
        onPlaylistSelect(tracksData, item.name, item.id, item.images, item.type, item.tracks.total, item.display_name);
        setCurrentView("playlist");
        } catch (error) {
        console.error('Error fetching tracks:', error);
        }
    }else if (item.type === 'artist') {
      setCurrentView('artist');
    } else if (item.type === 'album') {
      setCurrentView('album');
    }
  };

  return (
    <div className="library-view">
      <div className="library-header">
        <h1>Your Library</h1>
      </div>

      <div className="library-filters">
        {filters.map(filter => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="home-page">
        <div className="loading-container">
          <Music className="loading-icon" />
          <p>Loading your music...</p>
        </div>
      </div>
      ) : (
        <div className="library-grid">
          {items.map(item => (
            <button
              key={item.id}
              className="library-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="library-item-image">
                {item.images?.[0]?.url ? (
                  <img src={item.images[0].url} alt={item.name} />
                ) : (
                  <div className="placeholder">♪</div>
                )}
              </div>
              <div className="library-item-info">
                <span className="name">{item.name}</span>
                <span className="subtitle">
                  {item.type === 'artist' ? 'Artist' :
                   item.type === 'album' ? `Album • ${item.artists?.[0]?.name}` :
                   item.type === 'show' ? 'Podcast' :
                   `Playlist • ${item.owner?.display_name || 'You'}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}