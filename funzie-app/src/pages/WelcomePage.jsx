// src/pages/WelcomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import '../styles/global.css';
import '../styles/welcomepage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleRedirectToChat = () => {
    navigate('/chat');
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Section */}
      <main className="container mt-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1>
              Let's Have Fun Learning! <span style={{ color: '#FF4081' }}>With Funzie!</span>
            </h1>
            <p className="text-muted">
              Join Funzie for exciting stories, games, and learning activities. Explore new adventures and discover fun facts, all while learning with your new friend, Funzie!
            </p>
            <div className="d-flex align-items-center mt-4">
              <button className="btn btn-dark ms-2" onClick={handleRedirectToChat}>
                Start Exploring
              </button>
            </div>
          </div>

          <div className="col-md-6 text-center">
            <img
              src="https://imgcdn.stablediffusionweb.com/2024/5/18/ed88a860-f3b6-41e0-b874-194b6a4054af.jpg"
              alt="Funzie Character"
              className="img-fluid rounded-circle shadow-lg"
              style={{ width: '80%' }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WelcomePage;
