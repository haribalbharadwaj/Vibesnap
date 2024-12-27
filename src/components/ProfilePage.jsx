import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebaseConfig.js";
import DefaultProfile from '../assets/default.png'; 
import '../components/ProfilePage.css'; 
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Plus from'../assets/plus.png';
import { onAuthStateChanged } from 'firebase/auth';
import Background from '../assets/background.jpg';
import Back from '../assets/wback.png';
import Editprofile from '../assets/editprofile.png';
import Like from '../assets/heart.png';

const ProfilePage = () => {
  const storage = getStorage();
  const [userData, setUserData] = useState({
    name: 'New User',
    bio: 'This is your bio',
    photoURL: DefaultProfile,
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const db = getFirestore();

 /* const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || 'New User',
            bio: data.bio || 'This is your bio',
            photoURL: data.photoURL || DefaultProfile,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  */
  
  const fetchUserData = async (user) => {
    try {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || 'New User',
            bio: data.bio || 'This is your bio',
            photoURL: data.photoURL || DefaultProfile,
            backgroundURL: data.backgroundURL || Background
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

 /* const fetchPosts = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(postsQuery);

        const postData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const post = doc.data();
            const files = post.files || [];
            const postFiles = await Promise.all(
              files.map(async (filePath) => {
                const url = await getDownloadURL(ref(storage, filePath));
                return url;
              })
            );

            return {
              ...post,
              postFiles,
            };
          })
        );
        
        setPosts(postData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
*/

const fetchPosts = async (user) => {
  try {
    if (user) {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(postsQuery);

      const postData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const post = doc.data();
         
          console.log(post.likes);  // Check if likeCount exists

          const files = post.files || [];
          const postFiles = await Promise.all(
            files.map(async (filePath) => {
              const url = await getDownloadURL(ref(storage, filePath));
              return url;
            })
          );

          return {
            ...post,
            postFiles,
            likes: post.likes || 0,
          };
        })
      );

      setPosts(postData);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};


  
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserData(user);
      fetchPosts(user);
    }
    setLoading(false); // Set loading to false after data is fetched
  });

  return () => unsubscribe(); // Clean up the listener on component unmount
}, []);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const stripQueryParameters = (url) => {
    return url.split('?')[0];
  };

  const isImage = (url) => {
    const cleanUrl = stripQueryParameters(url);
    return cleanUrl.toLowerCase().endsWith('.jpg') || 
           cleanUrl.toLowerCase().endsWith('.png') ||
           cleanUrl.toLowerCase().endsWith('.jpeg') || 
           cleanUrl.toLowerCase().endsWith('.gif');
  };

  const isVideo = (url) => {
    const cleanUrl = stripQueryParameters(url);
    return cleanUrl.toLowerCase().endsWith('.mp4') || 
           cleanUrl.toLowerCase().endsWith('.mov') ||
           cleanUrl.toLowerCase().endsWith('.avi');
  };

  const getFileExtension = (url) => {
    const cleanUrl = stripQueryParameters(url);
    const parts = cleanUrl.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const handleCreatePostClick = () => {
    navigate('/createpost'); // Navigate to the CreatePost page
  };

  return (

    <div>

<div className="profile-page">

    <div className="back-button" >
    <img src={Back} onClick={() => navigate(-1)} />
    </div>
  <div className='hello'>
   <img
   src={userData.backgroundURL || '/assets/background.png'}
   alt="Profile"
 />
  </div>

  <div className="profile-image-section">
    <img
      src={userData.photoURL}
      alt="Profile"
      className="profile-image"
    />
  </div>

  <div className="profile-details">
    <h2>{userData.name}</h2>
    <p>{userData.bio}</p>
  </div>

  <img className="edit-profile-button" src={Editprofile} onClick={handleEditProfile}/>

  <div className="my-posts-section">
    <h2>My Posts</h2>
    <div className="post-images">
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={index} className="post">
            {post.postFiles.length > 0 && (
              <div className="post-image-container">
                {/* Display only the first image/video */}
                {isImage(post.postFiles[0]) ? (
                  <img src={post.postFiles[0]} alt={`Post Image`} className="post-container-image" />
                ) : isVideo(post.postFiles[0]) ? (
                  <video controls className="post-video">
                    <source src={post.postFiles[0]} />
                  </video>
                ) : (
                  <p>Unsupported file format: {getFileExtension(post.postFiles[0])}</p>
                )}

{post.postFiles.length > 1 && (
            <div className="media-counter">
              {`1/${post.postFiles.length}`} {/* Always show the first one */}
            </div>
          )}

          {/* Display likes count */}

                      <div className="like-count">
                        <img src={Like}/>
                        <span > {post.likes || 0}</span>
                      </div>
          
                     
                {/* Text overlay */}
                <div className="text-overlay">{post.text}</div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  </div>

  <div className="circular-model">
          <img src={Plus} alt="Icon inside circular model"  onClick={handleCreatePostClick}/>
        </div>
</div>
    </div>
   
  );
};

export default ProfilePage;
