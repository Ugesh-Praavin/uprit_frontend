import { Link } from 'react-router-dom';

/**
 * SimilarStudentCard — shows a student with common skills highlighted.
 */
export default function SimilarStudentCard({ student }) {
    return (
        <div className="glass-card p-5 hover:glass-card-hover transition-all duration-300 animate-fade-in flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-accent-primary)]/30" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-lg font-bold text-white">
                        {student.name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <Link to={`/profile/${student.userId}`}
                        className="font-semibold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors truncate block">
                        {student.name}
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)]">{student.department || 'Student'}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-3">
                <div className="text-center bg-[var(--color-bg-glass)] rounded-lg py-1.5 px-3">
                    <p className="text-sm font-bold text-[var(--color-accent-primary)]">{student.xp || 0}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">XP</p>
                </div>
                <div className="text-center bg-[var(--color-bg-glass)] rounded-lg py-1.5 px-3">
                    <p className="text-sm font-bold text-[var(--color-accent-secondary)]">Lv.{student.level || 1}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Level</p>
                </div>
                <div className="text-center bg-emerald-500/10 rounded-lg py-1.5 px-3">
                    <p className="text-sm font-bold text-emerald-400">{student.commonSkillCount || 0}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Match</p>
                </div>
            </div>

            {/* Common Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                {(student.commonSkills || []).map(skill => (
                    <span key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        ✦ {skill}
                    </span>
                ))}
            </div>

            {/* Action */}
            <Link to={`/profile/${student.userId}`}
                className="btn-secondary text-xs text-center py-2 block hover:bg-[var(--color-bg-glass-hover)]">
                View Profile →
            </Link>
        </div>
    );
}
