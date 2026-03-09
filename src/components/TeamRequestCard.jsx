import { useToast } from './Toast';

/**
 * TeamRequestCard — shows a team request with skills, members, join button.
 */
export default function TeamRequestCard({ team, currentUserId, onJoin }) {
    const { showToast } = useToast();
    const isMember = team.members?.some(m => m.userId === currentUserId);
    const isLeader = team.createdById === currentUserId;
    const isFull = team.currentMembers >= team.maxMembers;
    const isClosed = team.status === 'CLOSED';

    const handleJoin = async () => {
        if (onJoin) onJoin(team.id);
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className={`glass-card p-5 hover:glass-card-hover transition-all duration-300 animate-fade-in ${isClosed ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">{team.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span>by {team.createdByName || 'Unknown'}</span>
                        <span>•</span>
                        <span>{timeAgo(team.createdAt)}</span>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${isClosed
                        ? 'bg-red-500/15 text-red-400 border-red-500/20'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    }`}>
                    {isClosed ? '🔒 Closed' : '🟢 Open'}
                </span>
            </div>

            {/* Description */}
            {team.description && (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3 line-clamp-2">
                    {team.description}
                </p>
            )}

            {/* Required Skills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {(team.requiredSkills || []).map(skill => (
                    <span key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                        {skill}
                    </span>
                ))}
            </div>

            {/* Members Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
                    <span>👥 Members</span>
                    <span className="font-medium">{team.currentMembers}/{team.maxMembers}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--color-bg-glass)] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isFull
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]'
                            }`}
                        style={{ width: `${Math.min(100, (team.currentMembers / team.maxMembers) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Member Avatars */}
            {team.members?.length > 0 && (
                <div className="flex -space-x-2 mb-4">
                    {team.members.slice(0, 5).map(m => (
                        <div key={m.id}
                            title={`${m.userName} (${m.role})`}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[var(--color-bg-primary)] ${m.role === 'LEADER'
                                    ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                                    : 'bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]'
                                }`}>
                            {m.userName?.charAt(0)?.toUpperCase()}
                        </div>
                    ))}
                    {team.members.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-[var(--color-bg-glass)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)] border-2 border-[var(--color-bg-primary)]">
                            +{team.members.length - 5}
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            {!isClosed && !isLeader && !isMember && !isFull && (
                <button onClick={handleJoin}
                    className="w-full btn-primary hover:btn-primary-hover text-xs py-2.5 cursor-pointer">
                    🤝 Join Team
                </button>
            )}
            {isMember && !isLeader && (
                <div className="text-xs text-center text-emerald-400 font-medium py-2">
                    ✓ You're a member
                </div>
            )}
            {isLeader && (
                <div className="text-xs text-center text-amber-400 font-medium py-2">
                    👑 You're the leader
                </div>
            )}
            {isFull && !isMember && !isLeader && !isClosed && (
                <div className="text-xs text-center text-[var(--color-text-muted)] py-2">
                    Team is full
                </div>
            )}
        </div>
    );
}
