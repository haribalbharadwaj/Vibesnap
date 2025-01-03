import React, { useState, useEffect } from 'react';
import './EditProfilePage.css';
import { auth } from "../../firebaseConfig.js";
import { updateProfile } from "firebase/auth"; 
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Edit from '../assets/editor.png';
import EditProfile from '../assets/Edit Profile.png'
import Back from '../assets/wback.png';
import { useNavigate } from 'react-router-dom';
import Save from '../assets/save.png';

const db = getFirestore();
const storage = getStorage();

const EditProfilePage = () => {
  const [backgroundImage, setBackgroundImage] = useState(null); // For preview
  const [backgroundImageFile, setBackgroundImageFile] = useState(null); // Actual file to upload
  const [profileImage, setProfileImage] = useState(null); // For preview
  const [profileImageFile, setProfileImageFile] = useState(null); // Actual file to upload
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
   const navigate = useNavigate();
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setBio(data.bio || '');
          setProfileImage(data.photoURL || '/assets/default.png');
          setBackgroundImage(data.backgroundURL || '/assets/background.jpg');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImage(URL.createObjectURL(file)); // Show preview
      setBackgroundImageFile(file); // Store actual file to upload later
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file)); // Show preview
      setProfileImageFile(file); // Store actual file to upload later
    }
  };

  const uploadImageToStorage = async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const uploadTask = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref); // Get the Firebase URL
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let profileImageUrl = profileImage;
        let backgroundImageUrl = backgroundImage;

        // Upload profile and background images if they are files
        if (profileImageFile) {
          profileImageUrl = await uploadImageToStorage(profileImageFile, `profileImages/${user.uid}`);
        }
        if (backgroundImageFile) {
          backgroundImageUrl = await uploadImageToStorage(backgroundImageFile, `backgroundImages/${user.uid}`);
        }

        // Update profile in Firebase Authentication
        await updateProfile(user, {
          displayName: name,
          photoURL: profileImageUrl,
        });

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          bio: bio,
          name: name,
          photoURL: profileImageUrl,
          backgroundURL: backgroundImageUrl,
        });

        alert('Profile updated successfully!');
        fetchUserData(); // Refresh data after update
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="background-section">
        <img src={Back} onClick={() => navigate(-1)} style={{top:'40px',left:'40px',position:'relative'}} />
        <img src={EditProfile} style={{top:'40px',left:'60px',position:'relative'}}/>
        <img
          src={backgroundImage || '/assets/background.jpg'}
          alt="Background Preview"
          className="background-preview"
        />
        <div className="edit-background-circle" 
          onClick={() => document.getElementById('background-upload').click()}>
          <img 
            src={Edit}
            alt="Edit" 
            style={{ width: '15px', height: '15px' }} 
          />
        </div>
        <input 
          type="file" 
          id="background-upload" 
          onChange={handleBackgroundUpload} 
          style={{ display: 'none' }}
        />
      </div>

      <div className="edit-profile-section">
        <img
          src={profileImage || '/assets/default.png'}
          alt="Profile Preview"
          className="profile-image-preview"
        />
        <div className="edit-profile-circle"
          onClick={() => document.getElementById('profile-upload').click()}>
          <img 
            src={Edit}
            alt="Edit" 
            style={{ width: '15px', height: '15px' }} 
          />
        </div>
        <input 
          type="file" 
          id="profile-upload" 
          onChange={handleProfileImageUpload} 
          style={{ display: 'none' }}
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
        <hr/>
  

        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-field"
        />
        <hr/>

        <img className="save-button" onClick={handleSave} src={Save}/>
      </div>
    </div>
  );
};

export default EditProfilePage;
