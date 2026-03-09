import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from './Toast';
import CommentSection from './CommentSection';

/**
 * PostCard — achievement post with like/comment engagement bar.
 */
export default function PostCard({ post, currentUserId, onUpdate }) {
    const { showToast } = useToast();
    const [liked, setLiked] = useState(post.isLikedByCurrentUser || false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const [likeAnim, setLikeAnim] = useState(false);

    const badgeConfig = {
        HACKATHON_WIN: { label: '🏆 Hackathon Win', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
        HACKATHON_PARTICIPATION: { label: '🎯 Hackathon', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
        CERTIFICATE: { label: '📜 Certificate', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        PROJECT_COMPLETION: { label: '🚀 Project', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' },
        INTERNSHIP: { label: '💼 Internship', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
        RESEARCH_PAPER: { label: '📄 Research Paper', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
        OTHER: { label: '✨ Achievement', bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/20' },
    };

    const verificationColors = {
        VERIFIED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: '✔' },
        REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20', icon: '✗' },
        PENDING: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: '⏳' },
    };

    const badge = badgeConfig[post.achievementType] || badgeConfig.OTHER;
    const vBadge = verificationColors[post.verificationStatus] || verificationColors.PENDING;

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleLike = async () => {
        if (!currentUserId) return;
        try {
            if (liked) {
                await api.delete(`/api/posts/${post.id}/like?userId=${currentUserId}`);
                setLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                await api.post(`/api/posts/${post.id}/like?userId=${currentUserId}`);
                setLiked(true);
                setLikeCount(prev => prev + 1);
                setLikeAnim(true);
                setTimeout(() => setLikeAnim(false), 600);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };

    return (
        <article className="glass-card hover:glass-card-hover p-4 sm:p-5 transition-all duration-300 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <Link to={`/profile/${post.userId}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-sm font-bold text-white">
                        {post.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/profile/${post.userId}`}
                            className="font-semibold text-[var(--color-text-primary)] text-sm hover:text-[var(--color-accent-primary)] transition-colors">
                            {post.username}
                        </Link>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{timeAgo(post.createdAt)}</p>
                </div>
                <div className="shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20">
                    <span className="text-xs sm:text-sm font-bold text-[var(--color-accent-primary)]">+{post.xpAwarded} XP</span>
                </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mb-1.5">{post.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">{post.description}</p>

            {/* Image */}
            {post.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-3 border border-[var(--color-border-default)]">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-40 sm:h-48 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
            )}

            {/* Verification Badge */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-3">
                <span className={`text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full border ${vBadge.bg} ${vBadge.text} ${vBadge.border}`}>
                    {vBadge.icon} {post.verificationStatus === 'VERIFIED'
                        ? `Verified by ${post.verifiedByName || 'Faculty'}`
                        : post.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                </span>
                {post.certificateUrl && (
                    <a href={post.certificateUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[var(--color-accent-tertiary)] hover:underline flex items-center gap-1">
                        📎 Certificate
                    </a>
                )}
            </div>

            {/* ═══ ENGAGEMENT BAR ═══ */}
            <div className="flex items-center gap-1 pt-2 border-t border-[var(--color-border-default)]">
                {/* Like Button */}
                <button onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${liked
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] border border-transparent'
                        } ${likeAnim ? 'scale-110' : 'scale-100'}`}>
                    <span className={`text-lg transition-transform ${likeAnim ? 'scale-125' : ''}`}>
                        {liked ? '❤️' : '🤍'}
                    </span>
                    <span>{likeCount > 0 ? likeCount : ''}</span>
                    <span className="hidden sm:inline">{liked ? 'Liked' : 'Like'}</span>
                </button>

                {/* Comment Button */}
                <button onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${showComments
                            ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] border border-transparent'
                        }`}>
                    <span className="text-lg">💬</span>
                    <span>{commentCount > 0 ? commentCount : ''}</span>
                    <span className="hidden sm:inline">Comment</span>
                </button>
            </div>

            {/* ═══ COMMENT SECTION (toggled) ═══ */}
            {showComments && (
                <CommentSection
                    postId={post.id}
                    currentUserId={currentUserId}
                    onCountChange={(count) => setCommentCount(count)}
                />
            )}
        </article>
    );
}
