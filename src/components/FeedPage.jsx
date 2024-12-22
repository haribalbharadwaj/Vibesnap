import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth} from "../../firebaseConfig.js";
import { getFirestore, doc, getDoc } from 'firebase/firestore';  // Firestore functions
import './FeedPage.css';

const FeedPage = () => {
  const [showShare, setShowShare] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    photoURL: '',  // Initialize with empty values
  });
  const navigate = useNavigate();
  const db = getFirestore();

  // Fetch the user's profile data from Firebase
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;  // Get current authenticated user
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());  // Set the user's data
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();  // Fetch user data on component load
  }, []);

  const handleCreatePostClick = () => {
    navigate('/createpost'); // Navigate to the CreatePost page
  };

  const toggleShareDiv = () => {
    setShowShare(!showShare);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="feed-container">
      {/* Profile Image */}
      <div className="profile-section">
        <img 
          src={userData.photoURL || '/assets/default.png'}  // Use fetched profile image or default
          alt="Profile"
          className="profile-image"
          onClick={handleProfileClick}
        />
        <h2>{userData.name}</h2>  {/* Display fetched user name */}
        <p>{userData.bio}</p>     {/* Display fetched user bio */}
      </div>

      {/* Feeds Section */}
      <h1>Feed Page</h1>

      <div className="post">
        <p>This is a sample post created by a user.</p>
        <button className="share-button" onClick={toggleShareDiv}>
          Share
        </button>

        {/* Share div */}
        {showShare && (
          <div className="share-div">
            <div className="social-icons">
              {/* Social media icons */}
              <img src="/icons/twitter.png" alt="Twitter" />
              <img src="/icons/facebook.png" alt="Facebook" />
              <img src="/icons/reddit.png" alt="Reddit" />
              <img src="/icons/discord.png" alt="Discord" />
              <img src="/icons/whatsapp.png" alt="WhatsApp" />
              <img src="/icons/messenger.png" alt="Messenger" />
              <img src="/icons/telegram.png" alt="Telegram" />
              <img src="/icons/instagram.png" alt="Instagram" />
            </div>
            <button onClick={copyLink}>Copy Feed Link</button>
          </div>
        )}
      </div>

      <button className="plus-button" onClick={handleCreatePostClick}>
        +
      </button>

      {/* Add more posts here */}
    </div>
  );
};

export default FeedPage;
