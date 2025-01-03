import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebaseConfig.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import './FeedPage.css';
import Like from '../assets/Like.png';
import Share from '../assets/Share.png';
import Twitter from '../assets/twitter.png';
import Facebook from '../assets/facebook.png';
import Reddit from '../assets/reddit.png';
import Discord from '../assets/discord.png';
import Whatsapp from '../assets/whatsapp.png';
import Messenger from '../assets/messenger.png';
import Telegram from '../assets/telegram.png';
import Instagram from '../assets/instagram.png';
import Plus from'../assets/plus.png';
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Copy from '../assets/copy.png';
import Close from '../assets/close.png';

const FeedPage = () => {
  const [showShare, setShowShare] = useState({});
  const [currentPostId, setCurrentPostId] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    photoURL: '',  // Initialize with empty values
  });
  const [posts, setPosts] = useState([]);  // State to store fetched posts
  const navigate = useNavigate();
  const db = getFirestore();
  const [userId, setUserId] = useState(auth.currentUser?.uid); // Track the logged-in user ID
  const [copiedLink, setCopiedLink] = useState('');


  useEffect(() => {
    console.log("Auth currentUser:", auth.currentUser); // Check if auth.currentUser is defined
    if (!userId && auth.currentUser) {
      setUserId(auth.currentUser.uid);
      console.log("User ID set:", auth.currentUser.uid); // Log when userId is set
    } else {
      console.log("User is not authenticated or userId is already set.");
    }
  }, [userId]);
  
  // Fetch the user's profile data from Firebase
 /* const fetchUserData = async (uid) => {
    try {
      const user = auth.currentUser;  // Get current authenticated user
      if (user) {
        setUserId(user.uid);  // Set the userId
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());  // Set the user's data
          console.log('User Data:', docSnap.data());  // Log user data
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };*/

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        localStorage.setItem('userData', JSON.stringify(data));  // Store user data in localStorage
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Auth state changed: user logged in", user.uid); // Log when a user is logged in
        setUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        console.log("Auth state changed: no user logged in");
      }
    });
    
    return () => {
      unsubscribe(); // Cleanup subscription on component unmount
    };
  }, []);
  

  // Fetch all posts from Firestore

  // Fetch all posts from Firestore
const fetchPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'posts')); // Get all documents from 'posts' collection
    const postsArray = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();  // Retrieve document data
        const userRef = doc(db, 'users', data.userId);  // Reference to the user document
        const userSnap = await getDoc(userRef);  // Get user data

        const postWithUserData = {
          id: docSnap.id,  // Use docSnap.id to get the document ID
          ...data,  // Spread the data into the post object
          likedBy: data.likedBy || [],  // Ensure likedBy is always an array
          userData: userSnap.exists() ? userSnap.data() : null,  // Add user data to the post
        };
        
        console.log('Post Data:', postWithUserData);
        return postWithUserData; 
      })
    ); 
    setPosts(postsArray);  // Set posts data to state
    console.log("Fetched posts:", postsArray);  // Log the posts to the console
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

  
  // Calculate time difference
  const calculateTimeAgo = (timestamp) => {
    const postTime = timestamp.toDate();
    const currentTime = new Date();
    const timeDifference = currentTime - postTime;  // Difference in milliseconds

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  };

  // Handle the like functionality
  const handleLikeClick = async (postId, currentLikes, likedBy = []) => {
    try {
      const postRef = doc(db, 'posts', postId);  // Reference to the specific post document
    
      // Ensure likedBy is an array before checking
      if (Array.isArray(likedBy) && likedBy.includes(userId)) {
        // If user has already liked, decrement the like count
        await updateDoc(postRef, {
          likes: currentLikes - 1,
          likedBy: likedBy.filter(id => id !== userId),
        });
        
        // Update local state to reflect the new like count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, likes: currentLikes - 1, likedBy: likedBy.filter(id => id !== userId) } : post
          )
        );
      } else {
        // If user hasn't liked, increment the like count
        await updateDoc(postRef, {
          likes: currentLikes + 1,
          likedBy: [...(Array.isArray(likedBy) ? likedBy : []), userId],  // Ensure likedBy is an array
        });
        
        // Update local state to reflect the new like count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, likes: currentLikes + 1, likedBy: [...(Array.isArray(likedBy) ? likedBy : []), userId] } : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  

  useEffect(() => {
    fetchUserData();  // Fetch user data on component load
    fetchPosts();     // Fetch all posts on component load
  }, []);


  

  const handleCreatePostClick = () => {
    navigate('/createpost'); // Navigate to the CreatePost page
  };

  const toggleShareDiv = (postId) => {
    setShowShare(prevState => ({
      ...prevState,
      [postId]: !prevState[postId],  // Toggle the visibility for the specific post
    }));
  };
  

  // Handle the share button click
  const handleShareClick = (postId) => {
    setCurrentPostId(postId);
    const postUrl = `${window.location.origin}/post/${postId}`;  // Generate the post URL
    setCopiedLink(postUrl);  // Set the copied link immediately
    toggleShareDiv(postId);
  };
  

  const handleCloseShareDiv=()=>{
    setShowShare(false);
  }


  // Modify the function to copy the link for a specific post
  const copyPostLink = () => {
    if (currentPostId) {
      const postUrl = `${window.location.origin}/post/${currentPostId}`;
      navigator.clipboard.writeText(postUrl).then(() => {
        setCopiedLink(postUrl);
        toast.success('Link copied to clipboard!');
        console.log("Link copied to clipboard:", postUrl);
      }).catch((err) => {
        console.error("Error copying link:", err);
        toast.error('Failed to copy the link.');
      });
    }
  };


  const shareFeedLink = (platform) => {
    const feedUrl = `${window.location.origin}/post/${currentPostId}`;
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${feedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${feedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${feedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${feedUrl}`;
        break;
      case 'instagram':
        shareUrl = `https://www.instagram.com/?url=${feedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${feedUrl}`;
        break;
      case 'discord':
        shareUrl = `https://discord.com/channels/@me?url=${feedUrl}`;
        break;
      case 'messenger':
        shareUrl = `https://www.messenger.com/t/?link=${feedUrl}`;
        break;
      default:
        break;
    }

    window.open(shareUrl, '_blank');
  };

  const renderMedia = (files) => {
    return (
      <div className="post-media-container">
        {files.map((file, index) => {
          const fileExtension = file.split('.').pop();
  
          if (fileExtension === 'mp4') {
            return (
              <video key={index} controls className="post-video">
                <source src={file} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            );
          } else {
            return <img key={index} src={file} alt="Post Media" className="post-image" />;
          }
        })}
      </div>
    );
  };

  
  const handleProfileClick = () => {
    navigate(`/profile/${userId}`);  // Navigate to profile page with userId
  };

  return (
    <div className="feed-container">

      {/* Profile Image */}
     <div>
     <div className="feed-profiles-section">
     {console.log('userId', userId)}
        <img 
          src={userData.photoURL || '/assets/default.png'}  // Use fetched profile image or default
          alt="Profile"
          className="profile-image"
          onClick={handleProfileClick}
        />
        <div className="user-name">
          <span>Welcome back</span>
          <h2>{userData.name}</h2> 
        </div>
      </div>
     </div>

      <h1 className="feeds">Feeds</h1>

      <div>

      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={post.id} className="post">
            {post.text && <span className='posts-text'>{post.text}</span>}  {/* Display post text if available */}
              <div className="post-user-info">
                <img 
                  src={post.userData?.photoURL || '/assets/default.png'}  // Use the user's photoURL or a default image
                  alt="User Profile"
                  className="user-profile-image"
                />
                <span className='post-user-name'>{post.userData ? post.userData.name : 'Unknown User'}</span>
              </div>
              <span className='timeAgo'>{calculateTimeAgo(post.createdAt)}</span>  {/* Display time ago */}
              
              {post.files && renderMedia(post.files)}  {/* Display images or videos if available */}
              
              {/* Like Button */}
              <div className="like-button">
                <img src={Like}
                  onClick={() => handleLikeClick(post.id, post.likes || 0, post.likedBy || [])}
                />
                <span > {post.likes || 0}</span>
              </div>
              <img 
                style={{width:'92px',height:'30px'}}
                src={Share}  // Replace with your image path
                alt="Share Icon" 
                className="share-icon"  // Optionally, add a class for styling
                onClick={() => handleShareClick(post.id)}
              />
              
              {/* Share div */}
              {showShare[post.id] && (
                <div style={{ width: '100vw', position: 'fixed', top: '0', left: '0', height: '200vh', backgroundColor: 'rgba(0, 0, 0, 0.5)',zIndex:'2000' }}>
                  <div className="share-div" >
                    <span style={{fontFamily:'Karla,sans-serif',fontSize:'22px',fontWeight:'800',lineHeight: '25.72px',
                      color:'#000000',left:'20px',position:'absolute'
                    }}> Share post</span>
                    <img 
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '30px',
                        cursor: 'pointer',
                        zIndex:'2000',
                        color:'#A8A8A8'
                      }}
                      onClick={handleCloseShareDiv}
                     src={Close}
                    />
                    <div className="social-icons" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                      <div style={{display:'flex',flexDirection:'row',gap:'20px'}}>
                        <div className="social-icon">
                            <div className="icon-circle">
                              <img src={Twitter} onClick={() => shareFeedLink('twitter',post.id)} />
                            </div>
                            <span className="icon-label">Twitter</span>
                          </div>
                          <div className="social-icon">
                            <div className="icon-circle">
                              <img src={Facebook} onClick={() => shareFeedLink('facebook', post.id)} />
                            </div>
                            <span className="icon-label">Facebook</span>
                          </div>
                          <div className="social-icon">
                            <div className="icon-circle">
                              <img src={Whatsapp} onClick={() => shareFeedLink('whatsapp', post.id)} />
                            </div>
                            <span className="icon-label">WhatsApp</span>
                          </div>
                          <div className="social-icon">
                            <div className="icon-circle">
                              <img src={Telegram} onClick={() => shareFeedLink('telegram', post.id)} />
                            </div>
                            <span className="icon-label">Telegram</span>
                          </div>

                        </div>

                    <div style={{display:'flex',flexDirection:'row',gap:'20px'}}>

                      <div className="social-icon">
                        <div className="icon-circle">
                          <img src={Instagram} onClick={() => shareFeedLink('instagram', post.id)} />
                        </div>
                        <span className="icon-label">Instagram</span>
                      </div>
                      <div className="social-icon">
                        <div className="icon-circle">
                          <img src={Reddit} onClick={() => shareFeedLink('reddit', post.id)} />
                        </div>
                        <span className="icon-label">Reddit</span>
                      </div>
                      <div className="social-icon">
                        <div className="icon-circle">
                          <img src={Discord} onClick={() => shareFeedLink('discord', post.id)} />
                        </div>
                        <span className="icon-label">Discord</span>
                      </div>
                      <div className="social-icon">
                        <div className="icon-circle">
                          <img src={Messenger} onClick={() => shareFeedLink('messenger', post.id)} />
                        </div>
                        <span className="icon-label">Messenger</span>
                      </div>

                    </div>
                      
                  </div>
                  <span style={{color:'#000000',fontFamily:'Karla,sans-serif',fontSize:'16px',fontWeight: '600',lineHeight:'18.7px',
                    left:'-100px',top:'80px',position:'relative'
                  }}>Page Link</span>
                  <div className="copyboard" style={{display:'flex',flexDirection:'row',left:'5px',top:'100px',
                    position:'relative',width:'310px',height:'43px',backgroundColor:'#D9D9D9',}}>
                    
                   
                    {currentPostId === post.id && copiedLink && (
                      <div className="copied-link-display" style={{color:'#000000'}}>
                        <span>{copiedLink}</span>
                      </div>
                    )}
                     <img onClick={() => copyPostLink(post.id)} src={Copy}/>
                  </div>
              </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}

      </div>

    
      <div className="circle-model">
        <img src={Plus} alt="Icon inside circular model"  onClick={handleCreatePostClick}/>
      </div>

      <ToastContainer />

    </div>
  );
};

export default FeedPage;
