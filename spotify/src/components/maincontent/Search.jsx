import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon, Music, User, Disc, List, Play, X, AlertCircle } from 'lucide-react';
import { search, playTrack } from '../../api/spotify';
import './Search.css';

export default function Search({ onPlaylistSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const abortControllerRef = useRef(null);
  const searchCache = useRef(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const performSearch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = searchQuery.toLowerCase().trim();
    const cached = searchCache.current.get(cacheKey);
    
    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSearchResults(cached.data);
      setLoading(false);
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const results = await search(
        searchQuery, 
        'track,artist,album,playlist', 
        20,
        abortControllerRef.current.signal
      );
      
      // Cache the result
      searchCache.current.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
      
      setSearchResults(results);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Search failed:', err);
      setError(err.message || 'Failed to search. Please try again.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, CACHE_TTL]);

  useEffect(() => {
    let mounted = true;

    if (searchQuery.trim() === '') {
      setSearchResults(null);
      setError(null);
      return;
    }

    const delaySearch = setTimeout(() => {
      if (mounted) {
        performSearch();
      }
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(delaySearch);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, performSearch]);

  const handleTrackPlay = async (trackId) => {
    try {
        await playTrack(trackId);
    } catch (error) {
        console.error("Error playing track:", error);
    }   
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
  };

  const getFilteredResults = () => {
    if (!searchResults) return null;

    switch (activeFilter) {
      case 'tracks':
        return { tracks: searchResults.tracks };
      case 'artists':
        return { artists: searchResults.artists };
      case 'albums':
        return { albums: searchResults.albums };
      case 'playlists':
        return { playlists: searchResults.playlists };
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrapper">
          <SearchIcon className="search-input-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={clearSearch}>
              <X />
            </button>
          )}
        </div>
      </div>

      {/* Search Filters */}
      {searchResults && !error && (
        <div className="search-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilter === 'tracks' ? 'active' : ''}`}
            onClick={() => setActiveFilter('tracks')}
          >
            Songs
          </button>
          <button
            className={`filter-btn ${activeFilter === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveFilter('artists')}
          >
            Artists
          </button>
          <button
            className={`filter-btn ${activeFilter === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveFilter('albums')}
          >
            Albums
          </button>
          <button
            className={`filter-btn ${activeFilter === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveFilter('playlists')}
          >
            Playlists
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="search-error">
          <AlertCircle className="error-icon" />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={performSearch}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-loading">
          <Music className="loading-icon" />
          <p>Searching...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && filteredResults && (
        <div className="search-results">
          {/* Tracks */}
          {filteredResults.tracks?.items && filteredResults.tracks.items.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title">Songs</h2>
              <div className="tracks-list">
                {filteredResults.tracks.items.map((track) => (
                  <div
                    key={track.id}
                    className="track-item"
                    onClick={() => handleTrackPlay(track.id)}
                  >
                    <div className="track-item-left">
                      <div className="track-item-image">
                        {track.album?.images?.[0] ? (
                          <img src={track.album.images[0].url} alt={track.name} />
                        ) : (
                          <Music className="track-item-icon" />
                        )}
                        <button className="track-item-play-wrapper">
                          <Play className="songs-play-icon" fill="#eeededff" stroke='#eeededff' />
                        </button>
                      </div>
                      <div className="track-item-info">
                        <h3 className="track-item-name">{track.name}</h3>
                        <p className="track-item-artist">
                          {track.artists?.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <p className="track-item-album">{track.album?.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {filteredResults.artists?.items && filteredResults.artists.items.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title">Artists</h2>
              <div className="artists-grid">
                {filteredResults.artists.items.map((artist) => (
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
                          <User className="placeholder-icon" />
                        </div>
                      )}
                    </div>
                    <h3 className="artist-name">{artist.name}</h3>
                    <p className="artist-type">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {filteredResults.albums?.items && filteredResults.albums.items.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title">Albums</h2>
              <div className="albums-grid">
                {filteredResults.albums.items.map((album) => (
                  <div key={album.id} className="album-card">
                    <div className="album-image-wrapper">
                      {album.images?.[0] ? (
                        <img
                          src={album.images[0].url}
                          alt={album.name}
                          className="album-image"
                        />
                      ) : (
                        <div className="album-placeholder">
                          <Disc className="placeholder-icon" />
                        </div>
                      )}
                      <button className="album-play-btn">
                        <Play className="album-play-icon" fill="black" />
                      </button>
                    </div>
                    <h3 className="album-name">{album.name}</h3>
                    <p className="album-artist">
                      {album.artists?.map(a => a.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {filteredResults.playlists?.items && filteredResults.playlists.items.length > 0 && (
            
            <section className="search-section">
              <h2 className="search-section-title">Playlists</h2>
              <div className="playlists-grid">
                {filteredResults.playlists.items.map((playlist) => (
                  <div
                    key={playlist?.id}
                    className="playlist-card"
                    onClick={() => onPlaylistSelect && onPlaylistSelect(playlist)}
                  >
                    <div className="playlist-image-wrapper">
                      {playlist?.images?.[0]?.url ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="playlist-image"
                        />
                      ) : (
                        <div className="playlist-placeholder">
                          <List className="placeholder-icon" />
                        </div>
                      )}
                      <button className="playlist-play-btn">
                        <Play className="playlist-play-icon" fill="black" />
                      </button>
                    </div>
                    <h3 className="playlist-name">{playlist?.name}</h3>
                    <p className="playlist-description">
                      {playlist?.description?.replace(/<[^>]*>/g, '') || 'Playlist'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty State - No Search */}
      {!searchQuery && !searchResults && !error && (
        <div className="search-empty">
          <SearchIcon className="search-empty-icon" />
          <h2>Search for songs, artists, albums, and more</h2>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && searchQuery && searchResults && (
        <>
          {(!filteredResults.tracks?.items?.length &&
            !filteredResults.artists?.items?.length &&
            !filteredResults.albums?.items?.length &&
            !filteredResults.playlists?.items?.length) && (
            <div className="search-empty">
              <SearchIcon className="search-empty-icon" />
              <h2>No results found for "{searchQuery}"</h2>
              <p>Try searching for something else</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}