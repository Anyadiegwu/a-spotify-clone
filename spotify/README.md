# Spotify Clone

A full-stack Spotify clone built with React, Node.js/Express, and the Spotify Web API. This application replicates core Spotify features including music playback control, playlist management, search functionality, and user library access.

![Spotify Clone](https://img.shields.io/badge/React-19.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 🎵 Features

### Core Functionality
- **🔐 Spotify Authentication** - Secure OAuth 2.0 login flow with token management
- **🎧 Music Playback Control** - Play, pause, skip, previous, seek, and volume control
- **📱 Responsive Design** - Fully responsive UI that works on desktop, tablet, and mobile devices
- **🔍 Advanced Search** - Search for tracks, artists, albums, and playlists with real-time results
- **📚 Library Management** - Access and organize your playlists, liked songs, albums, and followed artists
- **💚 Like/Unlike Tracks** - Save and remove songs from your Liked Songs collection
- **🎨 Dynamic UI** - Beautiful gradients, smooth animations, and modern design patterns

### User Interface Components
- **Home Page** - Personalized recommendations with top tracks, artists, and recently played
- **Search Page** - Comprehensive search with filterable results
- **Library View** - Organized view of all your saved content
- **Playlist View** - Detailed playlist interface with track listings
- **Liked Songs** - Dedicated view for your favorite tracks
- **Music Player** - Full-featured bottom player with progress bar and controls

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library with hooks
- **Vite 7.2.4** - Fast build tool and dev server
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling with CSS Grid and Flexbox

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web application framework
- **Spotify Web API** - Official Spotify API integration
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling middleware
- **Dotenv** - Environment variable management

### Development Tools
- **ESLint** - Code linting and quality
- **Vite Plugin React** - Fast refresh support
- **Cross-env** - Cross-platform environment variables

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Spotify Premium Account** (required for playback control)
- **Spotify Developer Account** (to create an app and get API credentials)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/spotify-clone.git
cd spotify-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add these redirect URIs in your app settings:
   ```
   http://127.0.0.1:5000/auth/callback
   http://localhost:5173
   ```
4. Note your **Client ID** and **Client Secret**

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Server Configuration
PORT=5000
REDIRECT_URI=http://127.0.0.1:5000/auth/callback
FRONTEND_URI=http://localhost:5173
```

### 5. Run the Application

#### Start the Backend Server
```bash
npm run server
```
The backend server will run on `http://127.0.0.1:5000`

#### Start the Frontend Development Server
Open a new terminal and run:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

### 6. Login to Spotify
1. Navigate to `http://localhost:5173`
2. Click "Log in with Spotify"
3. Authorize the application
4. You'll be redirected back to the app, ready to use!

---

## 📁 Project Structure

```
spotify-clone/
│
├── public/                    # Static assets
│   └── vite.svg
│
├── server/                    # Backend server
│   └── index.js              # Express server with Spotify API routes
│
├── src/                      # Frontend source code
│   ├── api/                  # API integration
│   │   └── spotify.js        # Spotify API wrapper functions
│   │
│   ├── components/           # React components
│   │   ├── loginpage/        # Login screen
│   │   │   ├── LoginPage.jsx
│   │   │   └── LoginPage.css
│   │   │
│   │   ├── sidebar/          # Navigation sidebar
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   │
│   │   ├── maincontent/      # Main content area components
│   │   │   ├── HomePage.jsx
│   │   │   ├── HomePage.css
│   │   │   ├── Search.jsx
│   │   │   ├── Search.css
│   │   │   ├── Library.jsx
│   │   │   ├── Library.css
│   │   │   ├── MainContent.jsx
│   │   │   ├── MainContent.css
│   │   │   ├── CurrentTrack.jsx
│   │   │   └── CurrentTrack.css
│   │   │
│   │   ├── player/           # Music player components
│   │   │   ├── Player.jsx
│   │   │   ├── Player.css
│   │   │   └── GetTrackDetails.jsx
│   │   │
│   │   └── userdetails/      # User-specific views
│   │       ├── LikedSongs.jsx
│   │       ├── LikedSongs.css
│   │       ├── Playlist.jsx
│   │       └── PlayListView.jsx
│   │
│   ├── assets/               # Static assets
│   │   └── react.svg
│   │
│   ├── App.jsx               # Main application component
│   ├── App.css               # Global styles
│   ├── main.jsx              # React entry point
│   └── index.css             # Base CSS
│
├── .env                      # Environment variables (create this)
├── .gitignore               # Git ignore rules
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── README.md                # This file
└── vite.config.js           # Vite configuration
```

---

## 🔑 Key Features Explained

### Authentication Flow
The app uses Spotify's OAuth 2.0 Authorization Code Flow:
1. User clicks "Login with Spotify"
2. Redirected to Spotify's authorization page
3. After approval, Spotify redirects back with an authorization code
4. Backend exchanges code for access and refresh tokens
5. Tokens are stored in localStorage for persistent sessions

### API Integration
All Spotify API calls are wrapped in helper functions in `src/api/spotify.js`:
- Automatic token refresh handling
- Error handling with user-friendly messages
- Request rate limiting and caching for search
- Abort controller support for cancellable requests

### Player Controls
The player component provides full playback control:
- Real-time progress tracking with seekable progress bar
- Volume control with visual feedback
- Previous/Next track navigation
- Play/Pause toggle
- Like/Unlike functionality
- Album art and track information display

### Search System
Advanced search features include:
- Debounced search input (500ms delay)
- Result caching to reduce API calls
- Filterable results (All, Songs, Artists, Albums, Playlists)
- Request cancellation on new searches
- Empty state and error handling

---

## 🎨 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

Key responsive features:
- Collapsible sidebar to bottom navigation on mobile
- Scrolling track titles on smaller screens
- Touch-optimized controls
- Adaptive grid layouts
- Hidden columns on mobile for better readability

---

## 📡 Available API Endpoints

### Authentication
- `GET /auth/login` - Initiate Spotify OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh access token
- `GET /auth/logout` - Clear authentication cookies

### User Data
- `GET /api/me` - Get current user profile
- `GET /api/playlists` - Get user's playlists
- `GET /api/me/top/artists` - Get user's top artists
- `GET /api/me/top/tracks` - Get user's top tracks
- `GET /api/me/following` - Get followed artists
- `GET /api/me/player/recently-played` - Get recently played tracks

### Playback Control
- `GET /api/player` - Get current playback state
- `PUT /api/player/play` - Start playback of a track
- `PUT /api/player/toggle` - Toggle play/pause
- `POST /api/player/next` - Skip to next track
- `POST /api/player/previous` - Go to previous track
- `PUT /api/player/volume` - Set volume level
- `PUT /api/player/seek` - Seek to position in track

### Library Management
- `GET /api/library` - Get all library content
- `GET /api/library/liked-songs` - Get Liked Songs playlist info
- `GET /api/playlists/:playlistId/tracks` - Get tracks from a playlist
- `PUT /api/tracks/:id/like` - Like a track
- `DELETE /api/tracks/:id/like` - Unlike a track
- `GET /api/tracks/liked` - Check if tracks are liked

### Search & Discovery
- `GET /api/search` - Search for tracks, artists, albums, playlists
- `GET /api/browse/new-releases` - Get new album releases
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/top-tracks` - Get artist's top tracks
- `GET /api/albums/:id` - Get album details

---

## 🎮 Usage Guide

### Playing Music
1. Ensure you have an active Spotify device (desktop app, mobile app, or web player)
2. Navigate through Home, Search, or Library to find music
3. Click on any track to start playback
4. Use the player controls at the bottom to manage playback

### Managing Playlists
1. Click on "Your Library" in the sidebar
2. Filter by Playlists to see all your playlists
3. Click on any playlist to view its tracks
4. Click on tracks to play them

### Searching for Music
1. Click on the Search icon in the sidebar
2. Type your search query
3. Use the filter buttons (All, Songs, Artists, Albums, Playlists) to refine results
4. Click on any result to interact with it

### Managing Liked Songs
1. Click the heart icon on any track to like/unlike it
2. Access all your liked songs through "Liked Songs" in the sidebar
3. View your complete collection in a dedicated interface

---

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` file to version control
- **Token Storage**: Access tokens stored in localStorage (consider more secure alternatives for production)
- **CORS Configuration**: Restricted to specified frontend origin
- **HTTP-Only Cookies**: Used for state management in auth flow
- **Token Expiration**: Automatic refresh token handling

---

## ⚠️ Known Limitations

1. **Spotify Premium Required**: Free accounts cannot control playback
2. **Active Device Needed**: Requires an active Spotify device to control playback
3. **Rate Limiting**: Spotify API has rate limits (respect them in production)
4. **Browser Storage**: Using localStorage instead of secure token storage
5. **No Offline Support**: Requires internet connection for all features

---

## 🐛 Troubleshooting

### Issue: "No access token" error
**Solution**: 
- Clear browser localStorage
- Log out and log back in
- Check if your Spotify Developer App credentials are correct in `.env`

### Issue: Playback controls not working
**Solution**:
- Ensure you have a Spotify Premium account
- Open Spotify on any device to create an active session
- Check if the device is selected in the Spotify app

### Issue: "Failed to fetch player state"
**Solution**:
- Make sure Spotify is actively playing on at least one device
- Refresh the page to re-authenticate
- Check your internet connection

### Issue: Search not returning results
**Solution**:
- Check if your API credentials are valid
- Ensure you're not hitting Spotify's rate limits
- Try clearing the browser cache

### Issue: Backend server won't start
**Solution**:
- Verify all environment variables in `.env` are set correctly
- Check if port 5000 is already in use
- Run `npm install` to ensure all dependencies are installed

---

## 🚧 Future Enhancements

- [ ] Implement queue management
- [ ] Add playlist creation and editing
- [ ] Include podcast support
- [ ] Add lyrics integration
- [ ] Implement collaborative playlists
- [ ] Add social sharing features
- [ ] Create user profile management
- [ ] Implement audio visualization
- [ ] Add keyboard shortcuts
- [ ] Include shuffle and repeat controls
- [ ] Add download for offline playback (where permitted)
- [ ] Implement crossfade between tracks
- [ ] Add equalizer settings
- [ ] Create custom themes/skins
- [ ] Implement drag-and-drop playlist organization

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments to complex logic
- Update documentation as needed
- Test your changes thoroughly before submitting
- Ensure responsive design principles are maintained

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

```
MIT License

Copyright (c) 2025 [Victor Anyadiegwu]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api) for the comprehensive API
- [Lucide Icons](https://lucide.dev/) for the beautiful icon set
- [Vite](https://vitejs.dev/) for the amazing developer experience
- [React](https://react.dev/) for the powerful UI library
- [Express.js](https://expressjs.com/) for the robust backend framework
- The React community for excellent documentation and resources
- All contributors who help improve this project

---

## 📧 Contact

For questions, issues, or suggestions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/spotify-clone/issues)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🔗 Useful Links

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)

---

## 📊 Project Stats

- **Lines of Code**: ~5,000+
- **Components**: 20+
- **API Endpoints**: 25+
- **Supported Devices**: Desktop, Tablet, Mobile
- **Build Time**: < 2 seconds (Vite)

---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository on GitHub
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🔀 Contributing code improvements
- 📢 Sharing with others who might find it useful

---

**Made with ❤️ and ☕ by [Victor Anyadiegwu]**

**⭐ Don't forget to star this repository if you found it helpful!**