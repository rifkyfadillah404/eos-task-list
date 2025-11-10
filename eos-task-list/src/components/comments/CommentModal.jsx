import { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const CommentModal = ({ isOpen, onClose, task, onCommentAdded }) => {
  const { token, user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && task?.id) {
      fetchComments();
    }
  }, [isOpen, task?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && newComment.trim() && !submitting) {
        e.preventDefault();
        handleSubmit(e);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, newComment, submitting, onClose]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/comments/${task.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/comments/${task.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment_text: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedComments = [...comments, data.comment];
        setComments(updatedComments);
        setNewComment('');
        
        // Notify parent with new count
        if (onCommentAdded) {
          onCommentAdded(updatedComments.length);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedComments = comments.filter(c => c.id !== commentId);
        setComments(updatedComments);
        
        // Notify parent with new count
        if (onCommentAdded) {
          onCommentAdded(updatedComments.length);
        }
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) {
    return null;
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-2.5 shadow-md">
              <MessageCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Task Comments</h2>
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{task?.title}</p>
            </div>
            <span className="ml-2 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
            title="Close (Esc)"
          >
            <X size={22} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-indigo-600 mb-3"></div>
              <p className="text-sm text-gray-500">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={40} className="text-indigo-600" />
              </div>
              <p className="text-gray-700 text-lg font-bold">No comments yet</p>
              <p className="text-gray-500 text-sm mt-2">Start the conversation by adding the first comment below!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div 
                key={comment.id} 
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 animate-slide-in-left"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{comment.user_name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      {/* Delete button - only for comment owner or admin */}
                      {(comment.user_id === user?.userId || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-600 transition-all p-1.5 hover:bg-red-50 rounded-lg hover:scale-110"
                          title="Delete comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="mb-2">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
              <Send size={12} />
              Add Comment
            </label>
          </div>
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide updates..."
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm shadow-sm"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${newComment.length > 900 ? 'text-red-600' : 'text-gray-500'}`}>
                    {newComment.length}/1000
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Press Ctrl+Enter to send
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
