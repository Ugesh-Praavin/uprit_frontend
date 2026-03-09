import { Link } from 'react-router-dom';

/**
 * UserCard — reusable user card with follow/connect buttons.
 * Used in: followers list, connections list, suggested users, search results.
 */
export default function UserCard({ user, onFollow, onConnect, showActions = true, isFollowing = false, connectionStatus = 'NONE' }) {
    return (
        <div className="glass-card hover:glass-card-hover p-4 transition-all duration-300 animate-fade-in">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <Link to={`/profile/${user.userId || user.id}`} className="shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.userName || user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border-default)]" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-lg font-bold text-white">
                            {(user.userName || user.name)?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user.userId || user.id}`}
                        className="font-semibold text-[var(--color-text-primary)] text-sm hover:text-[var(--color-accent-primary)] transition-colors">
                        {user.userName || user.name}
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {user.department || 'Student'} {user.xp != null ? `• ${user.xp} XP` : ''}
                    </p>
                </div>

                {/* Action Buttons */}
                {showActions && (
                    <div className="flex gap-2 shrink-0">
                        {onFollow && (
                            <button onClick={() => onFollow(user.userId || user.id)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${isFollowing
                                        ? 'bg-[var(--color-bg-glass)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-red-500/30 hover:text-red-400'
                                        : 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 hover:bg-[var(--color-accent-primary)]/25'
                                    }`}>
                                {isFollowing ? 'Following' : '+ Follow'}
                            </button>
                        )}
                        {onConnect && connectionStatus === 'NONE' && (
                            <button onClick={() => onConnect(user.userId || user.id)}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20 hover:bg-[var(--color-accent-secondary)]/25 transition-all">
                                🤝 Connect
                            </button>
                        )}
                        {connectionStatus === 'PENDING' && (
                            <span className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">⏳ Pending</span>
                        )}
                        {connectionStatus === 'ACCEPTED' && (
                            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">✔ Connected</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
