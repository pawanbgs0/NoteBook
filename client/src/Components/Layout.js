// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import PostsComponent from './PostsComponent';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <PostsComponent />
      </main>
    </div>
  );
};

export default Layout;
