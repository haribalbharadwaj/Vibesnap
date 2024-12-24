// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import FeedPage from './components/FeedPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import EditProfilePage from './components/EditProfilePage.jsx';
import CreatePost from './components/CreatePost.jsx';
import PostPage from './components/PostPage.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/createpost" element={<CreatePost/>}/>
        <Route path="/post/:postId/:userId" element={<PostPage />} />
      </Routes>
    </Router>
  );
};

export default App;
