/**
 * PostCard — displays a single achievement in the feed.
 * Features: avatar, achievement badge, XP badge, timestamp, optional image, hover animation.
 */
export default function PostCard({ post }) {
    const badgeConfig = {
        HACKATHON_WIN: { label: '🏆 Hackathon Win', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
        HACKATHON_PARTICIPATION: { label: '🎯 Hackathon', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
        CERTIFICATE: { label: '📜 Certificate', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        PROJECT_COMPLETION: { label: '🚀 Project', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' },
        INTERNSHIP: { label: '💼 Internship', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
        RESEARCH_PAPER: { label: '📄 Research Paper', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
        OTHER: { label: '✨ Achievement', bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/20' },
    };

    const badge = badgeConfig[post.achievementType] || badgeConfig.OTHER;

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <article className="glass-card hover:glass-card-hover p-5 transition-all duration-300 animate-fade-in">
            {/* Header: Avatar + Username + Badge + Time */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {post.username?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                            {post.username}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {timeAgo(post.createdAt)}
                    </p>
                </div>

                {/* XP Badge */}
                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20">
                    <span className="text-sm font-bold text-[var(--color-accent-primary)]">
                        +{post.xpAwarded} XP
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1.5">
                {post.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                {post.description}
            </p>

            {/* Optional Image */}
            {post.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-3 border border-[var(--color-border-default)]">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
        </article>
    );
}
