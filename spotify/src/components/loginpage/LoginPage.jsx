import React from 'react';
import { Music } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {

const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/auth/login';
  };
  return (
    <div className="login-container">
      <div className="login-content">
        <Music className="login-icon" />
        <h1 className="login-title">Spotify</h1>
        <p className="login-subtitle">Music for everyone</p>
        <button onClick={handleLogin} className="login-button" >
          Log in with Spotify
        </button>
      </div>
    </div>
  );
}