// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const Navbar = () => {
  const navigate = useNavigate(); // Hook to navigate to the chat page

  const handleRedirectToChat = () => {
    navigate('/chat'); // Redirect to the chat page when clicked
  };

  return (
    <header className="d-flex justify-content-between align-items-center p-4">
      <div className="logo">
        <h2>Funzie</h2>
      </div>
      <nav>
        <ul className="d-flex list-unstyled gap-4">
          <li>
        
              Home
         
          </li>
          <li><a href="#" className="text-dark text-decoration-none">Menu</a></li>
          <li><a href="#" className="text-dark text-decoration-none">About Us</a></li>
          <li><a href="#" className="text-dark text-decoration-none">Contact Us</a></li>
        </ul>
      </nav>
      <div>
        <button className="btn btn-outline-dark">Login</button>
        <button className="btn btn-dark">Sign Up</button>
      </div>
    </header>
  );
};

export default Navbar;
