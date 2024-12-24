import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDoc, doc } from 'firebase/firestore';

const PostPage = () => {
  const { postId, userId } = useParams(); // Get postId and userId from the URL
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null); // State for storing user details
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  // Fetch post and user data when component mounts
  useEffect(() => {
    const fetchPostAndUser = async () => {
      try {
        // Fetch the post from the posts collection by postId
        const postRef = doc(firestore, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          setPost(postSnap.data()); // Set post data
        } else {
          setError('No such post found.');
          return;
        }

        // Fetch user details from the users collection by userId
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data()); // Set user data
        } else {
          setError('No such user found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data.');
      }
    };

    if (postId && userId) {
      fetchPostAndUser();
    }
  }, [postId, userId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!post || !user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{post.text}</h1>
      <h2>Posted by: {user.name}</h2>
      {/* Render more post details */}
    </div>
  );
};

export default PostPage;
