import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function Leaderboard() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [limit]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/users/leaderboard?limit=${limit}`);
            setEntries(res.data);
        } catch (err) {
            console.error('Leaderboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">🏆 Leaderboard</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Top performers ranked by XP</p>
                </div>
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="input-field focus:input-field-focus w-auto"
                >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={25}>Top 25</option>
                    <option value={100}>All</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : entries.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--color-text-muted)]">No users yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {entries.map((entry) => {
                        const isCurrentUser = entry.name === user?.name;
                        return (
                            <div
                                key={entry.userId}
                                className={`glass-card hover:glass-card-hover p-4 flex items-center gap-4 transition-all ${isCurrentUser ? 'ring-1 ring-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary)]/5' : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-glass)] flex items-center justify-center font-bold text-lg">
                                    {getMedalEmoji(entry.rank)}
                                </div>

                                {/* Name & Department */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[var(--color-text-primary)] truncate">
                                        {entry.name}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]">
                                                You
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-[var(--color-text-muted)]">{entry.department || 'No department'}</p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-right">
                                    <div>
                                        <p className="text-xs text-[var(--color-text-muted)]">Level</p>
                                        <p className="text-lg font-bold text-[var(--color-accent-secondary)]">{entry.level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--color-text-muted)]">XP</p>
                                        <p className="text-lg font-bold text-[var(--color-accent-primary)]">{entry.xp.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
