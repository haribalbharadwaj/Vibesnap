import React, { useState, useEffect } from 'react';
import './EditProfilePage.css';  // Assuming you will create this CSS file for styling
import { auth } from "../../firebaseConfig.js";
import { updateProfile } from "firebase/auth";  // Firebase auth to update profile
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();

const EditProfilePage = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  // Fetch the current user's profile data from Firebase when the page loads
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;  // Ensure user is authenticated
      if (user) {
        try {
          // Fetch user data from Firestore
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');  // Set user's name
            setBio(data.bio || '');    // Set user's bio
            setProfileImage(data.photoURL || '/assets/default-profile.png');  // Set user's profile image
            // Optionally fetch the background image if stored in Firestore (if applicable)
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);  // Empty dependency array ensures this runs only on component mount

  const handleBackgroundUpload = (e) => {
    setBackgroundImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleProfileImageUpload = (e) => {
    setProfileImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSave = async () => {
    try {
      // Update user profile information using Firebase
      const user = auth.currentUser;
      if (user) {
        // Update profile image and name in Firebase Authentication
        await updateProfile(user, {
          displayName: name,
          photoURL: profileImage,
        });

        // Update additional user data (bio, name, and profile image) in Firestore
        await setDoc(doc(db, "users", user.uid), {
          bio: bio,
          name: name,
          photoURL: profileImage,
        });

        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="background-section">
        <img
          src={backgroundImage || '/assets/default-background.png'}
          alt="Background Preview"
          className="background-preview"
        />
        <label htmlFor="background-upload" className="edit-background-btn">
          Edit Background
        </label>
        <input 
          type="file" 
          id="background-upload" 
          onChange={handleBackgroundUpload} 
          style={{ display: 'none' }}  // Hidden input, triggered by label click
        />
      </div>

      <div className="profile-section">
        <img
          src={profileImage || '/assets/default-profile.png'}
          alt="Profile Preview"
          className="profile-image-preview"
        />
        <label htmlFor="profile-upload" className="edit-profile-btn">
          Edit Profile Image
        </label>
        <input 
          type="file" 
          id="profile-upload" 
          onChange={handleProfileImageUpload} 
          style={{ display: 'none' }}  // Hidden input, triggered by label click
        />
      </div>

      <div className="form-section">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />

        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-field"
        />

        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;
