import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../custom-css.css'; // Adjust the path accordingly
import 'tailwindcss/tailwind.css';

axios.defaults.baseURL = 'http://localhost:4000';

const PostPreview = ({ post, onClick }) => (
  <div className="mb-6 cursor-pointer p-4 hover:shadow-lg transition-shadow duration-300" onClick={() => onClick(post._id)}>
    <p className="text-sm text-teal-500 mb-2">{post.categoryName}</p>
    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
    <p className="text-gray-600 mb-2">{post.authorName} | {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p>{post.content.substring(0, 200)}{post.content.length > 200 && '...'}</p>
  </div>
);

const PostList = ({ posts, onPostClick }) => {
  return (
    <div className="mb-8 h-96 overflow-y-scroll pr-[10rem]">
      {Array.isArray(posts) && posts.map(post => (
        <PostPreview key={post._id} post={post} onClick={onPostClick} />
      ))}
    </div>
  );
};

const PostsComponent = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [fullPost, setFullPost] = useState(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const [featuredResponse, popularResponse] = await Promise.all([
          axios.get('/api/posts/views'),
          axios.get('/api/posts/time')
        ]);

        const fetchAdditionalData = async (post) => {
          const [authorResponse, categoryResponse] = await Promise.all([
            axios.get(`/api/user/${post.author}`),
            axios.get(`/api/categories/${post.category}`)
          ]);

          return {
            ...post,
            authorName: authorResponse.data.data.name,
            categoryName: categoryResponse.data.data.name
          };
        };

        const featuredPostsWithDetails = await Promise.all(featuredResponse.data.data.map(fetchAdditionalData));
        const popularPostsWithDetails = await Promise.all(popularResponse.data.data.map(fetchAdditionalData));

        setFeaturedPosts(featuredPostsWithDetails);
        setPopularPosts(popularPostsWithDetails);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPostData();
  }, []);

  const handlePostClick = (postId) => {
    axios.get(`/api/posts/${postId}`)
      .then(async response => {
        const post = response.data.data;
        const [authorResponse, categoryResponse] = await Promise.all([
          axios.get(`/api/user/${post.author}`),
          axios.get(`/api/categories/${post.category}`)
        ]);

        setFullPost({
          ...post,
          authorName: authorResponse.data.data.name,
          categoryName: categoryResponse.data.data.name
        });
      })
      .catch(error => console.error('Error fetching full post:', error));
  };

  // Slider settings for popular posts
  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000, // Animation speed in milliseconds (1 second)
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 2000, // Delay between slides in milliseconds (2 seconds)
    mouseWheel: true,
  };

  return (
    <div className='bg-[#f2f8f7]'>
      <div className="container mx-auto pt-16 mt-8 bg-[#f2f8f7]">
        {fullPost ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">{fullPost.title}</h1>
            <p className="text-gray-600 mb-4">{fullPost.authorName} | {new Date(fullPost.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>{fullPost.content}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setFullPost(null)}>
              Back to Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3">
              <div className="font-bold text-2xl cursor-pointer flex items-center text-teal-600 mb-4">
                <span className="bg-teal-600 text-white px-2">Featured</span>
                <span className="ml-2">This Month</span>
              </div>
              <PostList posts={featuredPosts} onPostClick={handlePostClick} />
            </div>
            <div className="col-span-2">
              <div className="font-bold text-2xl cursor-pointer flex justify-center items-center text-teal-600 mb-4">
                <span className="bg-teal-600 text-white px-2">Popular</span>
                <span className="ml-2">Posts</span>
              </div>
              {/* Slider for popular posts */}
              <Slider {...sliderSettings}>
                {(() => {
                  const slides = [];
                  for (let i = 0; i < popularPosts.length; i += 2) {
                    slides.push(
                      <div key={popularPosts[i]._id}>
                        <div className="mb-4">
                          <PostPreview post={popularPosts[i]} onClick={handlePostClick} />
                        </div>
                        {i + 1 < popularPosts.length && (
                          <div className="mb-4">
                            <PostPreview post={popularPosts[i + 1]} onClick={handlePostClick} />
                          </div>
                        )}
                      </div>
                    );
                  }
                  return slides;
                })()}
              </Slider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsComponent;
