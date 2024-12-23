import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // Firestore functions
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase storage functions
import { auth } from "../../firebaseConfig.js"; // Firebase auth
import './CreatePost.css';
import { useNavigate } from 'react-router-dom';
import Back from '../assets/back.png';
import Choose from '../assets/camera.png';
import Camera from '../assets/camera.png';
import Photo from '../assets/photos.png';
import Videos from '../assets/videos.png';
import Create from '../assets/create.png';


const CreatePost = () => {
  const [postText, setPostText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);  // Store selected files
  const [selectedTab, setSelectedTab] = useState('photos'); // 'photos' or 'videos'
  const db = getFirestore();
  const storage = getStorage();  // Firebase storage
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  // Handle file deletion
  const handleDeleteFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  // Upload files to Firebase Storage and get the URLs
  const uploadFiles = async (files) => {
    const fileUrls = [];

    for (const file of files) {
      const fileRef = ref(storage, `posts/${file.name}`);
      await uploadBytes(fileRef, file); // Upload file to storage
      const fileUrl = await getDownloadURL(fileRef); // Get download URL of the file
      console.log(fileUrl);
      fileUrls.push(fileUrl); // Add URL to the list
    }

    return fileUrls; // Return array of file URLs
  };

  // Handle post submission
  const handleSubmitPost = async () => {
    const user = auth.currentUser;  // Get the current authenticated user
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }
    
    if (user) {
      try {
        // Upload files and get their URLs
        const fileUrls = await uploadFiles(selectedFiles);

        // Add the post to Firestore with the file URLs
        await addDoc(collection(db, 'posts'), {
          userId: user.uid,
          text: postText,
          files: fileUrls, // Store file URLs in Firestore
          createdAt: new Date(),
        });

        console.log('Post created:', { postText, selectedFiles });
        // Clear the post form after submission
        setPostText('');
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  // Trigger file input programmatically for mobile
  const triggerFileInput = (type) => {
    setSelectedTab(type);
    document.getElementById('file-upload').click();
  };

  return (
    <div className="create-post-container">

      <img src={Back} className="back-button" onClick={() => navigate(-1)}/>

      <span className='new-post'>New post</span>
      {/* Input for post text */}
      <textarea
        className="post-textarea"
        placeholder="What's on your mind?"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
      />

      {/* File selection for desktop and mobile */}
      <div className="file-options">
        {/* Desktop view: Choose files and Camera */}
        <label htmlFor="file-upload" className="desktop-file-chooser">
          <img src={Choose} alt="Choose Files" className="icon" />
          Choose Files
        </label>
        <input
          type="file"
          id="file-upload"
          multiple
          accept={selectedTab === 'photos' ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <span
          className="desktop-camera"
          onClick={() => document.getElementById('camera-upload').click()}
        >
           <img src={Camera} alt="Camera" className="icon" />
          Camera
        </span>

        {/* Hidden input for capturing from camera */}
        <input
          type="file"
          id="camera-upload"
          accept="image/*"
          capture="camera"  
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Mobile view: Separate options for Photos, Videos, and Camera */}
        <div className="mobile-buttons">
          <span  onClick={() => triggerFileInput('photos')}>
            <img src={Photo} alt="Photos" className="icon" />
            Photos
          </span>
          <span onClick={() => triggerFileInput('videos')}>
            <img src={Videos} alt="Videos" className="icon" />
            Videos
          </span>
          <span onClick={() => document.getElementById('camera-upload').click()}>
            <img src={Camera} alt="Camera" className="icon" />
            Camera
          </span>
        </div>

      </div>

      {/* Display selected files with previews for images */}
      <div className="selected-files">
        {selectedFiles.map((file, index) => (
          <div key={index} className="file-preview">
            {file.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="image-preview"
              />
            ) : (
              <span>{file.name}</span>
            )}
            <button onClick={() => handleDeleteFile(index)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <img className="create-post-button" src={Create} onClick={handleSubmitPost}
        Create Post
      />
    </div>
  );
};

export default CreatePost;
