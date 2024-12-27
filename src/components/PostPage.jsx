import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './PostPage.css';  // Import CSS file for styling
import Like from '../assets/Like.png';

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);  // Track the current media index
  const db = getFirestore();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost(postData);
        } else {
          console.log('No such post!');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);

  // Handle clicking the left arrow (go to the previous media file)
  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? post.files.length - 1 : prevIndex - 1
    );
  };

  // Handle clicking the right arrow (go to the next media file)
  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === post.files.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Function to render the current media (image or video)
  const renderMedia = (files) => {
    const file = files[currentMediaIndex];
    return <img src={file} alt={`media-${currentMediaIndex}`} className="post-image" />;
  };

  return (
    <div style={{ width: '100vw', position: 'fixed', top: '0', left: '0', height: '200vh', backgroundColor: 'rgba(0, 0, 0, 1)'}}>
      <div className="post-page-container" >
      {post ? (
        <div className="post-content" >
          <h2 className="post-text">{post.text}</h2>
          <div className="media-slider">
            {/* Only show arrows if there's more than one media file */}
            {post.files && post.files.length > 1 && (
              <>
                <button className="arrow left-arrow" onClick={handlePrevMedia}>
                  &#8249;
                </button>
                <button className="arrow right-arrow" onClick={handleNextMedia}>
                  &#8250;
                </button>
              </>
            )}
            {/* Display media file */}
            {post.files ? renderMedia(post.files) : <p>No media files available</p>}
          </div>
          <div style={{display:'flex',flexDirection:'row'}}>
            <img src={Like}/> 
            <p className="post-likes">{post.likes}</p>
          </div>
          
        </div>
      ) : (
        <p className="loading">Loading post...</p>
      )}
    </div>
    </div>
  );
};

export default PostPage;
