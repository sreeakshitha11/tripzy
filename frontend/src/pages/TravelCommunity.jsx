import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Heart, MessageCircle, Plus, Send,
  Share2, Flag, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TravelCommunity() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'STORY',
    destinationName: '',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
  });
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [postComments, setPostComments] = useState([]);

  const categories = ['ALL', 'STORY', 'TIP', 'QUESTION', 'RECOMMENDATION'];

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory]);

  const fetchPosts = async (cat) => {
    setLoading(true);
    try {
      const res = await api.get('/community/posts', {
        params: { category: cat !== 'ALL' ? cat : undefined }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const res = await api.post('/community/posts', newPost);
      setPosts([res.data, ...posts]);
      setIsModalOpen(false);
      setNewPost({
        title: '',
        content: '',
        category: 'STORY',
        destinationName: '',
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
      });
    } catch (err) {
      alert("Failed to publish post");
    }
  };

  const handleToggleLike = async (postId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: res.data.likesCount } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    try {
      const res = await api.get(`/community/posts/${postId}`);
      setPostComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/community/posts/${postId}/comments`, { content: text.trim() });
      setPostComments([...postComments, res.data]);
      setCommentInputs({ ...commentInputs, [postId]: '' });
      setPosts(posts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    } catch (err) {
      alert("Failed to post comment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-trail-600" />
            <span>Travel Community</span>
          </h1>
          <p className="text-sm text-moss-500">
            Stories, backcountry advice, tips, and Q&A from solo globetrotters.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-pine hover:bg-forest text-white font-bold text-xs shadow-md transition flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" /> Share Story or Tip
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedCategory === c
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white hover:bg-moss-100 text-moss-600 border border-moss-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="py-20 text-center text-xs text-moss-400">Loading community stories...</div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-moss-200/80 space-y-4">
              {/* Author & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-trail-500"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-moss-900">{post.authorName}</h3>
                    <span className="text-[10px] text-trail-600 font-semibold">{post.destinationName || 'Traveler'}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-moss-100 text-moss-600">
                  {post.category}
                </span>
              </div>

              {/* Title & Content */}
              <div className="space-y-2">
                <h2 className="font-bold text-lg text-forest">{post.title}</h2>
                <p className="text-xs text-moss-600 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>

              {post.imageUrl && (
                <div className="h-64 rounded-2xl overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Likes & Comments Counters */}
              <div className="flex items-center justify-between pt-3 border-t border-moss-100 text-xs text-moss-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-red-600 transition"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <button
                    onClick={() => handleOpenComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-trail-600 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-trail-600" />
                    <span>{post.commentsCount} Comments</span>
                  </button>
                </div>

                <button
                  onClick={() => api.post(`/community/posts/${post.id}/report`).then(() => alert("Post reported to moderators."))}
                  className="hover:text-red-500 transition"
                  title="Report Post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collapsible Comments Section */}
              {activeCommentsPostId === post.id && (
                <div className="pt-4 border-t border-moss-100 space-y-3 bg-moss-50 p-4 rounded-2xl">
                  <div className="space-y-2">
                    {postComments.map(c => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <img
                          src={c.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                          alt={c.authorName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="bg-white p-2.5 rounded-xl border border-moss-200 flex-1">
                          <span className="font-bold text-[11px] text-moss-900 block">{c.authorName}</span>
                          <p className="text-moss-600 mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Write a reply or comment..."
                      className="flex-1 p-2 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-2 bg-pine text-white rounded-xl text-xs font-bold"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Create Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-moss-200 space-y-4">
            <h3 className="font-bold text-lg text-forest font-display">
              Share Travel Story or Tip
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. 5 Hidden Cafes in Old Manali You Shouldn't Miss"
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  >
                    <option value="STORY">Travel Story</option>
                    <option value="TIP">Travel Tip</option>
                    <option value="QUESTION">Question / Q&A</option>
                    <option value="RECOMMENDATION">Recommendation</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={newPost.destinationName}
                    onChange={(e) => setNewPost({ ...newPost, destinationName: e.target.value })}
                    placeholder="e.g. Manali"
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Story Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows="4"
                  placeholder="Describe your journey, highlights, tips..."
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-moss-100 text-moss-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pine text-white font-bold"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
