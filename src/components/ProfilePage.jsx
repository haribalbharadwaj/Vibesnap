import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { auth, provider } from "../../firebaseConfig.js";
import DefaultProfile from '../assets/default.png'; // Default profile image
import '../components/ProfilePage.css'; // Import CSS for the page

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: 'New User', // Default name for new users
    bio: 'This is your bio', // Default bio for new users
    photoURL: DefaultProfile, // Default profile image
  });
  const [posts, setPosts] = useState([]); 
  const navigate = useNavigate();
  const db = getFirestore();

  // Fetch the user's profile data from Firebase
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;  // Get the current authenticated user
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || 'New User', // Use stored name or default
            bio: data.bio || 'This is your bio', // Use stored bio or default
            photoURL: data.photoURL || DefaultProfile, // Use stored photoURL or default image
          });
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

   // Fetch posts created by the user
   const fetchUserPosts = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'posts'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => doc.data());
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data when the component loads
    fetchUserPosts();
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile'); // Navigate to edit profile page
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>

      {/* Profile Image */}
      <div className="profile-image-section">
        <img
          src={userData.photoURL}
          alt="Profile"
          className="profile-image"
        />
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        <h2>{userData.name}</h2> {/* Display user's name */}
        <p>{userData.bio}</p>   {/* Display user's bio */}
      </div>

      {/* Edit Profile Button */}
      <button className="edit-profile-button" onClick={handleEditProfile}>
        Edit Profile
      </button>

      {/* My Posts Section */}
      <div className="my-posts-section">
        <h2>My Posts</h2>

        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className="post">
              {post.text && <p>{post.text}</p>}
              {post.files && post.files.length > 0 && (
                <div className="media-files">
                  {post.files.map((file, i) => (
                    <div key={i}>
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt="Post Image" className="post-image" />
                      ) : (
                        <video controls className="post-video">
                          <source src={URL.createObjectURL(file)} />
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
        {/* Show posts created by the user */}
        <div className="post">
          <p>This is one of the posts created by the user.</p>
        </div>
        {/* Additional posts can go here */}
      </div>
    </div>
  );
};

export default ProfilePage;
