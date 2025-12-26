import express from 'express';
import dotenv from 'dotenv';
import querystring from 'node:querystring';
import axios from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://a-spotify-clone.vercel.app/auth/callback';
const FRONTEND_URI = process.env.FRONTEND_URI || "https://a-spotify-clone.vercel.app/";

let accessToken = '';
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: { grant_type: 'client_credentials' },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000;
    return accessToken;
  } catch (error) {
    console.error('Failed to get client credentials token:', error.response?.data || error.message);
    throw error;
  }
}

app.use(cors({
  origin: FRONTEND_URI,
  credentials: true,
}));
// app.use(cors({
//   origin: [
//     'http://localhost:5173', 
//     'https://your-app-name.vercel.app',  
//     process.env.FRONTEND_URI  
//   ].filter(Boolean),
//   credentials: true,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


app.get('/auth/login', (req, res) => {
  const state = generateRandomString(16);
  
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000, 
    sameSite: 'lax',
    secure: false,
    path: '/',
  });

  const scope = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-playback-state',   
    'user-read-currently-playing',
    'user-modify-playback-state',
    'user-library-read',     
    'user-library-modify',
    'user-top-read',           
    'user-read-recently-played',  
    'user-follow-read',  
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies.spotify_auth_state;

 

  res.clearCookie('spotify_auth_state');

  if (!code || state !== storedState) {
    return res.redirect(`${FRONTEND_URI}?error=invalid_state`);
  }

  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const params = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in,
    });

    res.redirect(`${FRONTEND_URI}#${params.toString()}`);
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect(`${FRONTEND_URI}?error=token_exchange_failed`);
  }
});

app.get('/api/me', async (req, res) => {

  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch user:', error.response?.data);
    res.status(401).json({ error: 'Failed to fetch user', details: error.response?.data });
  }
});

app.get('/api/playlists', async (req, res) => {
  
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;


  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error('Failed to fetch playlists:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

app.get('/api/playlists/:playlistId/tracks', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  const { playlistId } = req.params;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    let response;

    if (playlistId === 'liked-songs') {
      response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const transformed = {
        items: response.data.items.map(item => ({
          track: item.track,
          added_at: item.added_at,
        })),
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset,
      };
      return res.json(transformed);
    }


    response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch playlist tracks:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

app.get('/api/player', async (req, res) => {
  
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    if (response.status === 204 || !response.data) {
      return res.json({ isPlaying: false, device: null, item: null });
    }

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 204) {
      return res.json({ isPlaying: false, device: null, item: null });
    }
    console.error('Failed to fetch player state:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch player state', details: error.response?.data });
  }
});

app.post('/auth/refresh', async (req, res) => {
  const refresh_token = req.cookies.spotify_refresh_token;

  if (!refresh_token) {
    return res.status(400).json({ error: 'No refresh token available' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const { access_token, expires_in } = response.data;
    
    res.cookie('spotify_access_token', access_token, {
      httpOnly: true,
      maxAge: expires_in * 1000,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    res.json({ access_token });
  } catch (error) {
    console.error('Refresh failed:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

app.put("/api/player/play", async (req, res) => {
  const { trackId } = req.body; 
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  if (!trackId) {
    return res.status(400).json({ error: "Missing trackId or uri" });
  }

  try {

    const response = await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {
        uris: [`spotify:track:${trackId}`],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.sendStatus(204);

  } catch (err) {
      console.error("Play track error:", err.response?.data || err.message);
      
      res.status(err.response?.status || 500).json({
        error: "Failed to play track",
        details: err.response?.data?.error?.message || err.message, // ✅ Fixed
        status: err.response?.status
      });
    }
});

app.put('/api/player/toggle', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const stateResponse = await axios.get(
      'https://api.spotify.com/v1/me/player',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const isPlaying = stateResponse.data?.is_playing;

    const endpoint = isPlaying
      ? 'https://api.spotify.com/v1/me/player/pause'
      : 'https://api.spotify.com/v1/me/player/play';

    await axios.put(
      endpoint,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.sendStatus(204);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Failed to toggle playback';

    return res.status(status).json({
      error: 'Toggle failed',
      details: message,
    });
  }
});

app.post('/api/player/next', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    await axios.post(
      'https://api.spotify.com/v1/me/player/next',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(204); 
  } catch (err) {
    console.error('Next track error:', err.response?.data || err.message);

    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Failed to skip to next track';

    res.status(status).json({
      error: 'Failed to skip to next track',
      details: message,
    });
  }
});

app.post('/api/player/previous', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    await axios.post(
      'https://api.spotify.com/v1/me/player/previous',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(204);
  } catch (err) {
    console.error('Previous track error:', err.response?.data || err.message);

    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Failed to go to previous track';

    res.status(status).json({
      error: 'Failed to go to previous track',
      details: message,
    });
  }
});

app.put('/api/player/volume', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  const { volume } = req.body; // 0–100

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  if (typeof volume !== 'number' || volume < 0 || volume > 100) {
    return res.status(400).json({ error: 'Volume must be between 0 and 100' });
  }

  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.sendStatus(204);
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error?.message || 'Failed to set volume';

    res.status(status).json({
      error: 'Volume change failed',
      details: message,
    });
  }
});


app.put('/api/tracks/:id/like', async (req, res) => {
  const { id: trackId } = req.params;
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    await axios.put(
      `https://api.spotify.com/v1/me/tracks`,
      { ids: [trackId] },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(200); 
  } catch (err) {
    console.error('Like track error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      error: 'Failed to like track',
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.delete('/api/tracks/:id/like', async (req, res) => {
  const { id: trackId } = req.params;
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    await axios.delete(
      `https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Unlike track error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      error: 'Failed to unlike track',
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.get('/api/tracks/liked', async (req, res) => {
  const { ids } = req.query; 

  if (!ids) {
    return res.status(400).json({ error: 'Missing track ids' });
  }

  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Check liked error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      error: 'Failed to check liked tracks',
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.put('/api/player/seek', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  const { position_ms } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  if (typeof position_ms !== 'number' || position_ms < 0) {
    return res.status(400).json({ error: 'Invalid position_ms' });
  }

  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.floor(position_ms)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(204);
  } catch (err) {
    console.error('Seek failed:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Failed to seek';

    res.status(status).json({ error: 'Seek failed', details: message });
  }
});

app.get('/api/me/top/artists', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const timeRange = req.query.time_range || 'medium_term';
  const limit = req.query.limit || 20;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch top artists:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch top artists', 
      details: error.response?.data 
    });
  }
});

app.get('/api/me/top/tracks', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const timeRange = req.query.time_range || 'medium_term';
  const limit = req.query.limit || 20;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch top tracks:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch top tracks', 
      details: error.response?.data 
    });
  }
});

app.get('/api/me/following', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const limit = req.query.limit || 20;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch followed artists:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch followed artists', 
      details: error.response?.data 
    });
  }
});

app.get('/api/me/player/recently-played', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const limit = req.query.limit || 20;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch recently played:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch recently played', 
      details: error.response?.data 
    });
  }
});

app.get('/api/browse/new-releases', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const limit = req.query.limit || 20;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch new releases:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch new releases', 
      details: error.response?.data 
    });
  }
});

app.get('/api/search', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { q, type, limit } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // ✅ Sanitize query
  const sanitizedQuery = q.trim();
  
  const searchType = type || 'track,artist,album,playlist';
  const searchLimit = Math.min(parseInt(limit) || 20, 50); // ✅ Limit max to 50

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: {
          q: sanitizedQuery,
          type: searchType,
          limit: searchLimit,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Search failed:', error.response?.data);
    res.status(error.response?.status || 500).json({ 
      error: 'Search failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

app.get('/api/artists/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch artist:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch artist',
      details: error.response?.data 
    });
  }
});

app.get('/api/artists/:id/top-tracks', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}/top-tracks`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: {
          market: 'US',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch artist top tracks:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch artist top tracks',
      details: error.response?.data 
    });
  }
});

app.get('/api/albums/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${id}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch album:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch album',
      details: error.response?.data 
    });
  }
});

app.get('/api/library', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const [playlistsRes, albumsRes, artistsRes, showsRes, likedRes] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/playlists?limit=50', { headers: { Authorization: `Bearer ${access_token}` } }),
      axios.get('https://api.spotify.com/v1/me/albums?limit=50', { headers: { Authorization: `Bearer ${access_token}` } }),
      axios.get('https://api.spotify.com/v1/me/following?type=artist&limit=50', { headers: { Authorization: `Bearer ${access_token}` } }),
      axios.get('https://api.spotify.com/v1/me/shows?limit=50', { headers: { Authorization: `Bearer ${access_token}` } }),
      axios.get('https://api.spotify.com/v1/me/tracks?limit=50', { headers: { Authorization: `Bearer ${access_token}` } }),
    ]);

    res.json({
      playlists: playlistsRes.data.items,
      albums: albumsRes.data.items.map(i => ({ ...i.album, added_at: i.added_at })),
      artists: artistsRes.data.artists.items,
      podcasts: showsRes.data.items.map(i => ({ ...i.show, added_at: i.added_at })),
      likedSongs: {
        name: "Liked Songs",
        id: "liked-songs",
        images: [{ url: "https://misc.scdn.co/liked-songs/liked-songs-300.png" }], // official image
        type: "playlist",
        owner: { display_name: "You" },
        tracks: { total: likedRes.data.total },
      },
    });
  } catch (error) {
    console.error('Failed to fetch library data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to load library' });
  }
});

app.get('/api/library/liked-songs', async (req, res) => {
  const authHeader = req.headers.authorization;
  const access_token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const tracksResponse = await axios.get(
      'https://api.spotify.com/v1/me/tracks?limit=1',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const total = tracksResponse.data.total;

    const likedSongsPlaylist = {
      id: 'liked-songs',
      name: 'Liked Songs',
      description: 'Your favorite tracks',
      images: [
        { url: 'https://misc.scdn.co/liked-songs/liked-songs-300.png' },
        { url: 'https://misc.scdn.co/liked-songs/liked-songs-640.png' }
      ],
      owner: { display_name: 'You', id: 'you' },
      tracks: {
        total,
        href: 'https://api.spotify.com/v1/me/tracks'
      },
      type: 'playlist',
      public: false,
    };

    res.json(likedSongsPlaylist);
  } catch (error) {
    console.error('Failed to fetch Liked Songs info:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch Liked Songs' });
  }
});

app.get('/auth/logout', (req, res) => {
  res.clearCookie('spotify_access_token');
  res.clearCookie('spotify_refresh_token');
  res.redirect(FRONTEND_URI);
});


// Export the app for Vercel
export default app;