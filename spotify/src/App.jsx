import React, { useState, useEffect } from 'react';
import LoginPage from './components/loginpage/LoginPage';
import Sidebar from './components/sidebar/Sidebar';
import MainContent from './components/maincontent/MainContent';
import Player from './components/player/Player';
import './App.css';

const BACKEND_URL = 'http://127.0.0.1:5000';

function getTokensFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    expires_in: params.get('expires_in'),
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('spotify_access_token');
  });

const handlePlaylistSelect = (tracksData, playlistName, playlistId, playlistImage, playlistType, playlistTotal, playlistDisplayName) => {
    setSelectedPlaylist({
      id: playlistId,
      name: playlistName,
      tracks: tracksData,
      img: playlistImage,
      type: playlistType,
      total: playlistTotal,
      displayName: playlistDisplayName,
    });

  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const tokensFromUrl = getTokensFromUrl();
      
      if (tokensFromUrl.access_token) {
        localStorage.setItem('spotify_access_token', tokensFromUrl.access_token);
        localStorage.setItem('spotify_refresh_token', tokensFromUrl.refresh_token);
        setAccessToken(tokensFromUrl.access_token);
        
        window.history.replaceState({}, document.title, '/');
      }

      const token = accessToken || tokensFromUrl.access_token;

      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsLoggedIn(true);

          const playlistsRes = await fetch(`${BACKEND_URL}/api/playlists`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (playlistsRes.ok) {
            const playlistsData = await playlistsRes.json();
            setPlaylists(playlistsData);
          }
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_refresh_token');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [accessToken]);

  const handleTrackPlay = async (trackId) => {
    try {
      const { playTrack } = await import('./api/spotify');
      await playTrack(trackId);
    } catch (err) {
      console.error('Failed to play track from App:', err);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    setAccessToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setPlaylists([]);
    setCurrentView('home');
    setSelectedPlaylist(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading your Spotify...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <div className="main-layout">

        <Sidebar
          playlists={playlists}
          user={user}
          setCurrentView={setCurrentView}
          onLogout={handleLogout}
          onPlaylistSelect={handlePlaylistSelect}
        />
        {/* <div className="small-Size">
          <Player />
        </div> */}
        <MainContent 
        currentView={currentView}
        selectedPlaylist={selectedPlaylist}
        onPlaylistSelect={handlePlaylistSelect}   // Allow MainContent (Home) to trigger playlist view
        onTrackPlay={handleTrackPlay}              // Allow direct play from Home
        setCurrentView={setCurrentView}
        />
      </div>
      {/* <div  className="big-Size"> */}
        <Player />
      {/* </div> */}
    </div>
  );
}