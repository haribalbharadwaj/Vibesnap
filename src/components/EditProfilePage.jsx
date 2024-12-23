import React, { useState, useEffect } from 'react';
import './EditProfilePage.css';
import { auth } from "../../firebaseConfig.js";
import { updateProfile } from "firebase/auth"; 
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

const EditProfilePage = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

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
      uploadImageToStorage(file, `backgroundImages/${auth.currentUser.uid}`)
        .then((url) => {
          console.log('Background image URL:', url);
          setBackgroundImage(url); // Update with Firebase URL
        })
        .catch((error) => {
          console.error("Error uploading background image:", error);
        });
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file)); // Show preview
      uploadImageToStorage(file, `profileImages/${auth.currentUser.uid}`)
        .then((url) => {
          console.log('Profile image URL:', url);
          setProfileImage(url); // Update with Firebase URL
        })
        .catch((error) => {
          console.error("Error uploading profile image:", error);
        });
    }
  };

  const uploadImageToStorage = async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const uploadTask = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref); // Ensure this URL is fetched correctly
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
        if (profileImage && profileImage instanceof File) {
          profileImageUrl = await uploadImageToStorage(profileImage, `profileImages/${user.uid}`);
        }
        if (backgroundImage && backgroundImage instanceof File) {
          backgroundImageUrl = await uploadImageToStorage(backgroundImage, `backgroundImages/${user.uid}`);
        }

        // Update profile in Firebase Authentication
        await updateProfile(user, {
          displayName: name,
          photoURL: profileImageUrl,
          backgroundURL:backgroundImageUrl  // Permanent URL
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
        <img
          src={backgroundImage || '/assets/background.jpg'}
          alt="Background Preview"
          className="background-preview"
        />
        <label htmlFor="background-upload" className="edit-background-btn">Edit Background</label>
        <input 
          type="file" 
          id="background-upload" 
          onChange={handleBackgroundUpload} 
          style={{ display: 'none' }}
        />
      </div>

      <div className="profile-section">
        <img
          src={profileImage || '/assets/default.png'}
          alt="Profile Preview"
          className="profile-image-preview"
        />
        <label htmlFor="profile-upload" className="edit-profile-btn">Edit Profile Image</label>
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

        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-field"
        />

        <button className="save-button" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default EditProfilePage;
