import { useEffect, useState } from 'react';
import { getUserPlaylists, setAuthToken } from '../../api/spotify';

export default function Playlist({ accessToken, children }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    setAuthToken(accessToken);

    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists();
        setPlaylists(data);
      } catch (err) {
        setError(err?.response?.data?.error?.message || err.message || 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  if (loading) return null;
  if (error) return null;


  return children(playlists);
}
