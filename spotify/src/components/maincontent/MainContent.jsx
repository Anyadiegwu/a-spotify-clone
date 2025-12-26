import React from 'react';
import HomePage from './HomePage'; 
import PlaylistView from '../userdetails/PlayListView';
import { Clock } from 'lucide-react';
import './MainContent.css';
import Search from './Search';
import Library from './Library';
import LikedSongs from '../userdetails/LikedSongs';
import CurrentTrack from './CurrentTrack';


export default function MainContent({ currentView, selectedPlaylist, setCurrentView, onPlaylistSelect}){
    // const [currentView, setCurrentView] = useState(null);

  if (currentView === 'home') {
    return (
      <HomePage />
    );
  }

  if (currentView === 'search') {
    return (
      <>
        <Search />      
      </>

    )
  }
  if (currentView === "library"){
    return(
      // <div className='most-content-wrapper'>
      //   <div className='lib-content-wrapper'>
        <Library setCurrentView={setCurrentView} 
          onPlaylistSelect={onPlaylistSelect}
        />
        // {/* </div> */}
        // {/* <div className='current-content-wrapper'> 
        // <CurrentTrack 
        // currentTrack={true}
        // recentlyPlayed={selectedPlaylist}
        // />
        // </div> */}
      // </div>
    )
  }
  if (currentView === "liked"){
    return(
      <>
        <LikedSongs />
      </>
    )
  }
  if (currentView === 'playlist' && selectedPlaylist) {
  const trackImages = (selectedPlaylist.tracks?.items || [])
    .map(item => item.track?.album?.images?.[0]?.url || item.track?.album?.images?.[1]?.url) // fallback to medium if no large
    .filter(Boolean);

  const fallbackImages = selectedPlaylist.images || selectedPlaylist.img || [];
  const fallbackUrls = Array.isArray(fallbackImages)
    ? fallbackImages.map(img => img?.url).filter(Boolean)
    : (fallbackImages?.url ? [fallbackImages.url] : []);

  const sourceUrls = trackImages.length > 0 ? trackImages : fallbackUrls;


  const uniqueUrls = [...new Set(sourceUrls)]; 
  const collageUrls = uniqueUrls.slice(0, 4);

  while (collageUrls.length < 4) {
    collageUrls.push(uniqueUrls[collageUrls.length % uniqueUrls.length] || null);
  }

  const playlistImage = (
    <div className="playlist-header-collage">
      <div className="collage-grid">
        {collageUrls.map((imageUrl, index) => (
          <div key={index} className="collage-tile">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Cover ${index + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className="playlist-image-placeholder"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <span>♪</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
    return (
      <div className="playlist-pagee">
        <div className="playlist-headerr">
          <div className="playlist-image-containerr">
            {playlistImage}
          </div>

          <div className="playlist-infoo">
            <span className="playlist-typee">PLAYLIST</span>
            <h1 className="playlist-titlee">{selectedPlaylist.name || selectedPlaylist.displayName}</h1>

            {selectedPlaylist.description && (
              <p className="playlist-descriptionn">
                {selectedPlaylist.description}
              </p>
            )}

            <div className="playlist-metaa">
              <span className="playlist-ownerr">
                {selectedPlaylist.displayName || selectedPlaylist.owner?.display_name || 'Spotify'}
              </span>
              <span className="playlist-meta-separatorr"> • </span>
              <span className="playlist-tracks-countt">
                {selectedPlaylist.total || selectedPlaylist.tracks?.total || 0} songs
              </span>
            </div>
          </div>
        </div>

        <div className="playlist-tracks-sectionn">
          <div className="songs-headerr">
            <div className="header-numberr">#</div>
            <div className="header-titlee">TITLE</div>
            <div className="header-albumm">ALBUM</div>
            <div className="header-durationn">
              <Clock className="clock-icon" />
            </div>
          </div>

          <PlaylistView playlist={selectedPlaylist} />
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1>Something went wrong. Go back to Home.</h1>
    </div>
  );
}