import { formatDate } from "../utils/formatDate";
import { MessageCircle, Send, MoreVertical, Heart } from "lucide-react";
import { useState } from "react";
import { addComment, deleteComment, likeFeedback, unlikeFeedback, likeComment, unlikeComment } from "../api/feedbackApi";
import toast from "react-hot-toast";
import { AuthContext } from "../../../context/AuthContext";
import { getAnonymousUserId } from "../utils/userUtils";

export default function FeedbackItem({ feedback, onUpdate }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localFeedback, setLocalFeedback] = useState(feedback);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    // Use the real logged-in user ID if available, otherwise fall back to anonymous
    const { User } = AuthContext();
    const userId = User 
        ? String(User.users_id || User.user_id || User.id) 
        : getAnonymousUserId();

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await addComment(localFeedback._id, {
                message: commentText
            });
            setLocalFeedback(response.data);
            setCommentText("");
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await deleteComment(localFeedback._id, commentId);
            setLocalFeedback(response.data.feedback);
            if (onUpdate) onUpdate(response.data.feedback);
            setDeleteConfirmId(null);
            toast.success("Comment deleted successfully");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    const handleLikeFeedback = async () => {
        try {
            console.log(localFeedback.likes)
            const isLiked = localFeedback.likes?.map(String).includes(String(userId));
            console.log(isLiked)
            
            if (isLiked) {
                console.log(userId)
                const response = await unlikeFeedback(localFeedback._id, userId);
                setLocalFeedback(response.data);
                if (onUpdate) onUpdate(response.data);
            } else {
                console.log(userId,'is liked')
                const response = await likeFeedback(localFeedback._id, userId);
                setLocalFeedback(response.data);
                if (onUpdate) onUpdate(response.data);
            }
        } catch (error) {
            toast.error("Failed to update like");
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const comment = localFeedback.comments.find(c => c._id === commentId);
            const isLiked = comment?.likes?.includes(userId);
            
            if (isLiked) {
                const response = await unlikeComment(localFeedback._id, commentId, userId);
                setLocalFeedback(response.data);
                if (onUpdate) onUpdate(response.data);
            } else {
                const response = await likeComment(localFeedback._id, commentId, userId);
                setLocalFeedback(response.data);
                if (onUpdate) onUpdate(response.data);
            }
        } catch (error) {
            toast.error("Failed to update like");
        }
    };

    return (
        <div className="w-full">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {localFeedback.title?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Anonymous User</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatDate(localFeedback.createdAt)}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                                {localFeedback.category}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {localFeedback.title}
                </h3>
                <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {localFeedback.message}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex gap-2">
                    <button 
                        onClick={handleLikeFeedback}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors font-medium ${
                            localFeedback.likes?.includes(userId) ? 'text-red-600' : 'text-gray-600'
                        }`}
                    >
                        <Heart 
                            size={18} 
                            fill={localFeedback.likes?.includes(userId) ? 'currentColor' : 'none'}
                        />
                        <span>{localFeedback.likes?.length || 0} {localFeedback.likes?.length === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 font-medium"
                    >
                        <MessageCircle size={18} />
                        <span>{localFeedback.comments?.length || 0} {localFeedback.comments?.length === 1 ? 'Comment' : 'Comments'}</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-200 bg-gray-50">
                    {/* Comments List */}
                    {localFeedback.comments && localFeedback.comments.length > 0 && (
                        <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
                            {localFeedback.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {comment.author?.charAt(0)?.toUpperCase() || "A"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-gray-900">
                                                    {comment.author || "Anonymous"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 break-words">
                                                {comment.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 mt-1 text-xs text-gray-500">
                                            <span>{formatDate(comment.createdAt)}</span>
                                            <button
                                                onClick={() => handleLikeComment(comment._id)}
                                                className={`flex items-center gap-1 hover:underline font-medium ${
                                                    comment.likes?.includes(userId) ? 'text-red-600' : 'text-gray-600'
                                                }`}
                                            >
                                                <Heart 
                                                    size={12} 
                                                    fill={comment.likes?.includes(userId) ? 'currentColor' : 'none'}
                                                />
                                                {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                                                {comment.likes?.length === 0 && <span>Like</span>}
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(comment._id)}
                                                className="hover:underline font-medium text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Comment Form */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                A
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    maxLength={500}
                                    required
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-gray-200 text-sm transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-full font-medium transition-colors flex items-center gap-1.5 text-sm disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                    {isSubmitting ? "..." : "Send"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirmId(null)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Comment?</h3>
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to delete this comment? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteComment(deleteConfirmId)}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}