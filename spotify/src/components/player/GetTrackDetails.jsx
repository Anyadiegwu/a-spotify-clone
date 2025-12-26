export function getTrackDetailsFromState(state) {
  if (!state?.item) {
    return null; // Nothing is playing
  }

  return {
    id: state.item.id,
    name: state.item.name,
    artists: state.item.artists.map(a => a.name).join(', '),
    album: state.item.album.name,
    albumArt: state.item.album.images?.[0]?.url || null,
    durationMs: state.item.duration_ms,
    progressMs: state.progress_ms,
    isPlaying: state.is_playing,
    uri: state.item.uri
  };
}