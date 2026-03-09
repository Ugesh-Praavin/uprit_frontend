import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from './Toast';

/**
 * CommentSection — inline comment list + input, shown when "Comment" is clicked on PostCard.
 * Paginated: loads 10 at a time.
 */
export default function CommentSection({ postId, currentUserId, onCountChange }) {
    const { showToast } = useToast();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => { loadComments(0); }, [postId]);

    const loadComments = async (p) => {
        try {
            const res = await api.get(`/api/posts/${postId}/comments?page=${p}&size=10`);
            if (p === 0) {
                setComments(res.data.content || []);
            } else {
                setComments(prev => [...prev, ...(res.data.content || [])]);
            }
            setTotalPages(res.data.totalPages || 0);
            setPage(p);
            if (onCountChange) onCountChange(res.data.totalElements || 0);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUserId) return;
        if (text.length > 500) { showToast('Comment must be under 500 characters', 'error'); return; }
        setSubmitting(true);
        try {
            const res = await api.post(`/api/posts/${postId}/comments?userId=${currentUserId}`, { commentText: text.trim() });
            setComments(prev => [res.data, ...prev]);
            setText('');
            if (onCountChange) onCountChange(prev => typeof prev === 'number' ? prev + 1 : 1);
            showToast('Comment added!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add comment', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/api/comments/${commentId}?userId=${currentUserId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
            if (onCountChange) onCountChange(prev => typeof prev === 'number' ? Math.max(0, prev - 1) : 0);
            showToast('Comment deleted', 'info');
        } catch (err) {
            showToast(err.response?.data?.message || 'Cannot delete', 'error');
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="mt-3 pt-3 border-t border-[var(--color-border-default)]">
            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    💬
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={500}
                        className="w-full px-3 py-2 pr-16 rounded-xl bg-[var(--color-bg-glass)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)]/40 transition-colors"
                    />
                    <button type="submit" disabled={!text.trim() || submitting}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] text-xs font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-accent-primary)]/25 transition-all">
                        {submitting ? '...' : 'Post'}
                    </button>
                </div>
            </form>

            {/* Character Count */}
            {text.length > 400 && (
                <p className={`text-xs text-right mb-2 ${text.length > 480 ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
                    {text.length}/500
                </p>
            )}

            {/* Comment List */}
            {loading ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-2">Loading…</p>
            ) : comments.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-2">No comments yet. Be the first!</p>
            ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-2 group">
                            <Link to={`/profile/${c.userId}`} className="shrink-0">
                                {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt={c.userName} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-[var(--color-bg-glass)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)]">
                                        {c.userName?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="bg-[var(--color-bg-glass)] rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                        <Link to={`/profile/${c.userId}`} className="text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)]">
                                            {c.userName}
                                        </Link>
                                        <span className="text-[10px] text-[var(--color-text-muted)]">{timeAgo(c.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 break-words">{c.commentText}</p>
                                </div>
                                {c.userId === currentUserId && (
                                    <button onClick={() => handleDelete(c.id)}
                                        className="text-[10px] text-[var(--color-text-muted)] hover:text-red-400 mt-0.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More */}
            {page + 1 < totalPages && (
                <button onClick={() => loadComments(page + 1)}
                    className="text-xs text-[var(--color-accent-primary)] hover:underline mt-2 cursor-pointer w-full text-center">
                    Load more comments...
                </button>
            )}
        </div>
    );
}
