import React, { useState, useRef } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from "../../firebaseConfig.js";
import './CreatePost.css';
import { useNavigate } from 'react-router-dom';
import Back from '../assets/back.png';
import Choose from '../assets/choose.png';
import Camera from '../assets/camera.png';
import Photo from '../assets/photos.png';
import Videos from '../assets/videos.png';
import Create from '../assets/create.png';
import Slider from 'react-slick';
import Addmore from '../assets/addmore.png';
import Delete from '../assets/delete.png';

const CreatePost = () => {
  const [postText, setPostText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sliderKey, setSliderKey] = useState(0);
  const [selectedTab, setSelectedTab] = useState('photos');
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();

  const fileUploadRef = useRef(null);  // Create a ref for the file input
  const cameraUploadRef = useRef(null); 

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const nonDuplicateFiles = newFiles.filter(newFile =>
      !selectedFiles.some(existingFile => existingFile.file.name === newFile.file.name)
    );

    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...nonDuplicateFiles];
      setSliderKey(prevKey => prevKey + 1);
      return updatedFiles;
    });
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      setSliderKey(prevKey => prevKey + 1);
      return updatedFiles;
    });
  };

  const uploadFiles = async (files) => {
    const fileUrls = [];
    for (const { file } of files) {
      const fileRef = ref(storage, `posts/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      fileUrls.push(fileUrl);
    }
    return fileUrls;
  };

  const handleSubmitPost = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }
  
    if (!postText.trim() && selectedFiles.length === 0) {
      console.error('Cannot create an empty post.');
      return;
    }
  
    try {
      let fileUrls = [];
  
      if (selectedFiles.length > 0) {
        fileUrls = await uploadFiles(selectedFiles);
      }
  
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        text: postText.trim() || '', 
        files: fileUrls, 
        createdAt: new Date(),
      });
  
      setPostText('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0px',
  };

  // Corrected triggerFileInput function
  /*const triggerFileInput = (type) => {
    if (fileUploadRef.current) {  // Ensure the ref is not null
      if (type === 'photos') {
        fileUploadRef.current.setAttribute('accept', 'image/*');
      } else if (type === 'videos') {
        fileUploadRef.current.setAttribute('accept', 'video/*');
      }
      fileUploadRef.current.click();  // Trigger the file input click event
    } else {
      console.error('fileUploadRef is null or undefined');
    }
  };*/

   const triggerFileInput = (type) => {
    setSelectedTab(type);
    document.getElementById('file-upload').click();
  };
  

  return (
    <div className="create-post-container">
      <img src={Back} className="back-button" onClick={() => navigate(-1)} />
      <span className="new-post">New post</span>

      {selectedFiles.length === 0 && (
        <div className="file-options">
          <label htmlFor="file-upload" className="desktop-file-chooser">
            <img src={Choose} alt="Choose Files" className="icon" />
            Choose Files
          </label>
          <input
            ref={fileUploadRef}
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
          <input
            type="file"
            id="camera-upload"
            accept="image/*"
            capture="camera"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="mobile-buttons">
            <span onClick={() => triggerFileInput('photos')}>
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
      )}

      {selectedFiles.length > 0 && (
        <div className="slider-container">
          <Slider {...settings} key={sliderKey}>
            {selectedFiles.map((fileObj, index) => (
              <div key={fileObj.file.name} className="file-preview">
                <img src={fileObj.preview} alt="preview" className="image-preview" />
                <img
                  src={Delete}
                  onClick={() => handleDeleteFile(index)}
                  style={{
                    width: '18.33px',
                    height: '18.33px',
                    top: '-25px',
                    left: '240px',
                    position: 'relative',
                  }}
                />
              </div>
            ))}
          </Slider>
          <input
      ref={fileUploadRef}
      type="file"
      id="file-upload"
      multiple
      accept={selectedTab === 'photos' ? 'image/*' : 'video/*'}
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />

          
    <span onClick={() => fileUploadRef.current?.click()} className="add-more-files-button">
      <img src={Addmore} alt="Addmore" />
      Add More Photos
    </span>


        </div>
      )}

      <textarea
        className="post-textarea"
        placeholder="What’s on your mind?"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
      />

      <img
        className="create-post-button"
        src={Create}
        alt="Create Post"
        onClick={handleSubmitPost}
      />
    </div>
  );
};

export default CreatePost;
