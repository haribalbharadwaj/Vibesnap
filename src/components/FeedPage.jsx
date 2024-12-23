import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebaseConfig.js";
import { getFirestore, collection, getDocs } from 'firebase/firestore';  // Firestore functions
import './FeedPage.css';

const FeedPage = () => {
  const [showShare, setShowShare] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    photoURL: '',  // Initialize with empty values
  });
  const [posts, setPosts] = useState([]);  // State to store fetched posts
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

  // Fetch all posts from Firestore
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts')); // Get all documents from 'posts' collection
      const postsArray = querySnapshot.docs.map(doc => doc.data()); // Map through each post
      setPosts(postsArray);  // Set posts data to state
      console.log("Fetched posts:", postsArray);  // Log the posts to the console
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchUserData();  // Fetch user data on component load
    fetchPosts();     // Fetch all posts on component load
  }, []);

  const handleCreatePostClick = () => {
    navigate('/createpost'); // Navigate to the CreatePost page
  };

  const toggleShareDiv = () => {
    setShowShare(!showShare);
  };

  // Copy link for a specific post
  const copyLink = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    alert('Post link copied to clipboard!');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const shareOnWhatsApp = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnInstagram = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    // Instagram does not support direct URL sharing like other platforms
    alert(`Copy this URL and paste it on Instagram: ${postUrl}`);
  };

  const shareOnFacebook = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnTwitter = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnTelegram = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const telegramUrl = `https://telegram.me/share/url?url=${encodeURIComponent(postUrl)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareOnReddit = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}`;
    window.open(redditUrl, '_blank');
  };

  const shareOnDiscord = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const discordUrl = `https://discord.com/channels/@me?url=${encodeURIComponent(postUrl)}`;
    window.open(discordUrl, '_blank');
  };

  const shareOnMessenger = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(postUrl)}`;
    window.open(messengerUrl, '_blank');
  };

  const renderMedia = (files) => {
    return files.map((file, index) => {
      const fileExtension = file.split('.').pop();  // Get the file extension

      if (fileExtension === 'mp4') {
        // Render video
        return (
          <video key={index} controls className="post-video">
            <source src={file} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      } else {
        // Render image
        return <img key={index} src={file} alt="Post Media" className="post-image" />;
      }
    });
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

      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={index} className="post">
            {post.text && <p>{post.text}</p>}  {/* Display post text if available */}
            
            {post.files && renderMedia(post.files)}  {/* Display images or videos if available */}

            <button className="share-button" onClick={toggleShareDiv}>
              Share
            </button>

            {/* Share div */}
            {showShare && (
              <div className="share-div">
                <div className="social-icons">
                  {/* Social media icons with share functionality */}
                  <img src="/icons/twitter.png" alt="Twitter" onClick={() => shareOnTwitter(post.userId)} />
                  <img src="/icons/facebook.png" alt="Facebook" onClick={() => shareOnFacebook(post.userId)} />
                  <img src="/icons/whatsapp.png" alt="WhatsApp" onClick={() => shareOnWhatsApp(post.userId)} />
                  <img src="/icons/telegram.png" alt="Telegram" onClick={() => shareOnTelegram(post.userId)} />
                  <img src="/icons/instagram.png" alt="Instagram" onClick={() => shareOnInstagram(post.userId)} />
                  <img src="/icons/reddit.png" alt="Reddit" onClick={() => shareOnReddit(post.userId)} />
                  <img src="/icons/discord.png" alt="Discord" onClick={() => shareOnDiscord(post.userId)} />
                  <img src="/icons/messenger.png" alt="Messenger" onClick={() => shareOnMessenger(post.userId)} />
                </div>
                <button onClick={() => copyLink(post.userId)}>Copy Post Link</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}

      <button className="plus-button" onClick={handleCreatePostClick}>
        +
      </button>
    </div>
  );
};

export default FeedPage;
