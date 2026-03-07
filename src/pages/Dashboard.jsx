import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0, totalChallenges: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            // Fetch all data in parallel
            const [usersRes, projectsRes, challengesRes] = await Promise.all([
                api.get('/api/users'),
                api.get('/api/projects'),
                api.get('/api/challenges'),
            ]);

            // Find current user's full profile
            const currentUser = usersRes.data.find(u => u.email === user?.email);
            setProfile(currentUser);

            setStats({
                totalUsers: usersRes.data.length,
                totalProjects: projectsRes.data.length,
                totalChallenges: challengesRes.data.length,
            });
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div>;
    }

    const statCards = [
        { label: 'Total XP', value: profile?.xp || 0, icon: '⚡', color: 'var(--color-accent-primary)' },
        { label: 'Level', value: profile?.level || 0, icon: '🎯', color: 'var(--color-accent-secondary)' },
        { label: 'Coins', value: profile?.coins || 0, icon: '🪙', color: 'var(--color-accent-warning)' },
        { label: 'Users', value: stats.totalUsers, icon: '👥', color: 'var(--color-accent-tertiary)' },
        { label: 'Projects', value: stats.totalProjects, icon: '📁', color: 'var(--color-accent-success)' },
        { label: 'Challenges', value: stats.totalChallenges, icon: '🏆', color: 'var(--color-accent-danger)' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                    Dashboard
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Track your progress and level up, <span className="text-[var(--color-accent-primary)] font-semibold">{profile?.name || user?.name}</span>
                </p>
            </div>

            {/* XP Progress Banner */}
            <div className="glass-card p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-accent-primary)] rounded-full opacity-[0.06] blur-[60px]" />
                <div className="relative flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Level {profile?.level || 0}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                            {profile?.xp || 0} XP — {100 - ((profile?.xp || 0) % 100)} XP to next level
                        </p>
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-[var(--color-bg-glass)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full transition-all duration-500"
                                style={{ width: `${(profile?.xp || 0) % 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {statCards.map((card, i) => (
                    <div
                        key={card.label}
                        className="glass-card hover:glass-card-hover p-5 cursor-default"
                        style={{ animationDelay: `${i * 0.08}s` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{card.icon}</span>
                            <span
                                className="text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{ background: `${card.color}15`, color: card.color }}
                            >
                                {card.label}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {card.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Info */}
            <div className="glass-card p-6 mt-8">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Quick Info</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoItem label="Department" value={profile?.department || 'N/A'} />
                    <InfoItem label="Year" value={profile?.year || 'N/A'} />
                    <InfoItem label="Email" value={profile?.email || 'N/A'} />
                    <InfoItem label="Role" value={profile?.role || 'USER'} />
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{value}</p>
        </div>
    );
}
