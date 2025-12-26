import React from 'react';
import { Music, Home, Search, Library, Plus, Heart, LogOut } from 'lucide-react';
import './Sidebar.css';
import { getPlaylistTracks } from '../../frontend/spotify';

export default function Sidebar({ playlists, setCurrentView, onLogout, onPlaylistSelect }) {

  const handlePlaylistClick = async (playlistId, playlistName, playlistImage, playlistType, playlistTotal, playlistDisplayName) => {
    try {
      const tracksData = await getPlaylistTracks(playlistId);
      onPlaylistSelect(tracksData, playlistName, playlistId, playlistImage, playlistType, playlistTotal, playlistDisplayName);
      setCurrentView("playlist");
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const getSubtitle = (playlist) => {
    if (playlist.type === 'album') {
      return `Album • ${playlist.artists?.[0]?.name || 'Unknown Artist'}`;
    }
    return `Playlist • ${playlist.owner?.display_name || 'You'}`;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Music className="logo-icon" />
      </div>
      <div className='sidebar-all-action'>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setCurrentView('home')}
            className="nav-button"
          >
            <Home className="nav-icon" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => setCurrentView('search')}
            className="nav-button"
          >
            <Search className="nav-icon" />
            <span>Search</span>
          </button>
          <button className="nav-button"
          onClick={() => setCurrentView("library")}>
            <Library className="nav-icon" />
            <span>Your Library</span>
          </button>
          <button className="nav-button"
          id='create-playlist'>
            <Plus className="nav-icon" />
            <span>Create Playlist</span>
          </button>
        </nav>

        <div className="sidebar-actions">
          <button className="nav-button" 
          id='show-create-playlist'>
            <Plus className="nav-icon" />
            <span>Create Playlist</span>
          </button>
          <button className="nav-button"
          id='liked-nav-buttonn'
          onClick={() => setCurrentView("liked")}>
            <Heart className="nav-icon" />
            <span>Liked Songs</span>
          </button>
        </div>
      </div>
      <div className="playlist-header">
        <p>My Playlists</p>
      </div>

      <div className="playlist-section">
        {playlists.map((playlist) => {
          const imageUrl = playlist.images?.[0]?.url || playlist.images?.url; // Handle both array and object

          return (
            <button
              key={playlist.id}
              className="playlist-item"
              onClick={() =>
                handlePlaylistClick(
                  playlist.id,
                  playlist.name,
                  playlist.images,
                  playlist.type,
                  playlist.tracks?.total,
                  playlist.owner?.display_name
                )
              }
            >
              <div className="playlist-item-image">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${playlist.name} cover`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex'; // Show placeholder if exists
                    }}
                  />
                ) : null}
                <div className="playlist-item-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                  <span>♪</span>
                </div>
              </div>

              <div className="playlist-item-info">
                <span className="playlist-item-name">{playlist.name}</span>
                <span className="playlist-subtitle">{getSubtitle(playlist)}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <button onClick={onLogout} className="spotify-logout-btn">
          <LogOut size={16} strokeWidth={2} className="logout-icon" />
          Log out
        </button>
      </div>
    </div>
  );
}