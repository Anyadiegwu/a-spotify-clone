const BACKEND_URL = 'http://127.0.0.1:5000';

function getAccessToken() {
  return localStorage.getItem('spotify_access_token');
}

async function handleApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Not authenticated')) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      window.location.href = 'http://127.0.0.1:5000/auth/login';
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
}

export async function getPlaylistTracks(playlistId) {
  return handleApiCall(async () => {

    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Not authenticated');
      }
      throw new Error('Failed to fetch playlist tracks');
    }

    return await response.json();
  });
}

export async function playTrack(trackId) {
  return handleApiCall(async () => {
    const token = getAccessToken();

    if (!token) throw new Error('No access token');

    const response = await fetch(`${BACKEND_URL}/api/player/play`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to play track: ${response.status} - ${errData.error || 'Unknown error'}`
      );
    }
  });
}

export async function togglePlayback() {
  return handleApiCall(async () => {
    const token = getAccessToken();

    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/player/toggle`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to toggle playback: ${response.status} - ${
          errorData.error || errorData.details || 'Unknown error'
        }`
      );
    }

    return true;
  });
}

export async function getPlayerState() {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/player`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Not authenticated');
      }
      throw new Error('Failed to fetch player state');
    }

    return await response.json();
  });
}

export async function skipToNext() {
  return handleApiCall(async () => {
    const token = getAccessToken();

    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/player/next`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to skip to next: ${response.status} - ${
          errorData.error || errorData.details || 'Unknown error'
        }`
      );
    }

    return true;
  });
}

export async function skipToPrevious() {
  return handleApiCall(async () => {
    const token = getAccessToken();

    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/player/previous`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to skip to previous: ${response.status} - ${
          errorData.error || errorData.details || 'Unknown error'
        }`
      );
    }

    return true;
  });
}

export async function setVolume(volume) {
  return handleApiCall(async () => {
    const token = localStorage.getItem('spotify_access_token');

    if (!token) throw new Error('No access token');

    const response = await fetch('http://127.0.0.1:5000/api/player/volume', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ volume }),
    });

    if (!response.ok) {
      throw new Error('Failed to set volume');
    }
  });
}

export async function likeTrack(trackId) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${BACKEND_URL}/api/tracks/${trackId}/like`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to like track');
    }

    return true;
  });
}

export async function unlikeTrack(trackId) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${BACKEND_URL}/api/tracks/${trackId}/like`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to unlike track');
    }

    return true;
  });
}

export async function checkTracksLiked(trackIds) {
  return handleApiCall(async () => {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;

    const token = getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${BACKEND_URL}/api/tracks/liked?ids=${ids}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to check liked tracks');
    }

    return await response.json();
  });
}

export async function seekToPosition(positionMs) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${BACKEND_URL}/api/player/seek`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position_ms: Math.floor(positionMs) }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Seek failed: ${response.status} - ${errData.error || 'Unknown'}`);
    }

    return true;
  });
}

export async function getTopArtists(timeRange = 'medium_term', limit = 20) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/me/top/artists?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    return await response.json();
  });
}

export async function getTopTracks(timeRange = 'medium_term', limit = 20) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }

    return await response.json();
  });
}

export async function getFollowedArtists(limit = 20) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/me/following?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch followed artists');
    }

    return await response.json();
  });
}

export async function getRecentlyPlayed(limit = 20) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recently played');
    }

    return await response.json();
  });
}

export async function getNewReleases(limit = 20) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/browse/new-releases?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch new releases');
    }

    return await response.json();
  });
}

export async function search(query, type = 'track,artist,album,playlist', limit = 20, signal = null) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }

    const fetchOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    if (signal) {
      fetchOptions.signal = signal;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      fetchOptions
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Not authenticated');
      }
      throw new Error('Search failed');
    }

    return await response.json();
  });
}

export async function getArtist(artistId) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/artists/${artistId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artist');
    }

    return await response.json();
  });
}

export async function getArtistTopTracks(artistId) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/artists/${artistId}/top-tracks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artist top tracks');
    }

    return await response.json();
  });
}

export async function getAlbum(albumId) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/albums/${albumId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch album');
    }

    return await response.json();
  });
}

export async function getUserPlaylists() {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/playlists`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }

    return await response.json();
  });
}

export async function getSavedAlbums(limit = 50, offset = 0) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/library/albums?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch saved albums');
    }

    const data = await response.json();
    return data.items;
  });
}

export async function getLibraryFollowedArtists(limit = 50, after = null) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    let url = `${BACKEND_URL}/api/library/artists?limit=${limit}`;
    if (after) url += `&after=${after}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch followed artists');
    }

    const data = await response.json();
    return data.artists;
  });
}

export async function getSavedPodcasts(limit = 50, offset = 0) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/library/podcasts?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch saved podcasts');
    }

    const data = await response.json();
    return data.items;
  });
}

export async function getLikedSongs(limit = 50, offset = 0) {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(
      `${BACKEND_URL}/api/library/liked-songs?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch liked songs');
    }

    const data = await response.json();
    return data.items;
  });
}

export async function getLibraryContent() {
  return handleApiCall(async () => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${BACKEND_URL}/api/library`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch library content');
    }

    return await response.json();
  });
}