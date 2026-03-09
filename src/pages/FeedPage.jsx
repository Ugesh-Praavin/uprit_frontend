import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import Spinner from '../components/Spinner';

/**
 * FeedPage — main page with 3-column layout.
 * Now passes currentUserId to PostCard for like/comment features.
 */
export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            const [feedRes, lbRes, usersRes] = await Promise.all([
                api.get('/api/posts/feed?limit=20'),
                api.get('/api/users/leaderboard?limit=5'),
                api.get('/api/users'),
            ]);
            setPosts(feedRes.data);
            setLeaderboard(lbRes.data);
            const currentUser = usersRes.data.find(u => u.email === user?.email);
            setProfile(currentUser);
        } catch (err) {
            console.error('Feed load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
        api.get('/api/users').then(res => {
            const currentUser = res.data.find(u => u.email === user?.email);
            setProfile(currentUser);
        });
        api.get('/api/users/leaderboard?limit=5').then(res => setLeaderboard(res.data));
    };

    const getMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex gap-6">

                {/* CENTER: Feed */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Achievement Feed</h1>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">See what your peers are achieving ⚡</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary hover:btn-primary-hover cursor-pointer flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Post Achievement
                        </button>
                    </div>

                    {posts.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <p className="text-4xl mb-3">🏆</p>
                            <p className="text-[var(--color-text-secondary)] font-medium">No achievements yet</p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">Be the first to post!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUserId={profile?.id}
                                    onUpdate={loadFeed}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div className="w-80 shrink-0 hidden lg:block space-y-5">
                    {profile && (
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-lg font-bold text-white">
                                    {profile.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--color-text-primary)]">{profile.name}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{profile.department || 'Student'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <StatMini label="XP" value={profile.xp} />
                                <StatMini label="Level" value={profile.level} />
                                <StatMini label="Coins" value={profile.coins} />
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                                    <span>Level {profile.level}</span>
                                    <span>{100 - (profile.xp % 100)} XP to next</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--color-bg-glass)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full transition-all duration-500"
                                        style={{ width: `${profile.xp % 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">🏆 Top Players</h3>
                        <div className="space-y-2.5">
                            {leaderboard.map(entry => (
                                <div key={entry.userId} className="flex items-center gap-2.5">
                                    <span className="text-sm w-6 text-center">{getMedal(entry.rank)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                            {entry.name}
                                            {entry.name === user?.name && (
                                                <span className="ml-1 text-[10px] text-[var(--color-accent-primary)]">(you)</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-[var(--color-accent-primary)]">{entry.xp} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">⚡ XP Guide</h3>
                        <div className="space-y-1.5 text-xs">
                            <XpRule emoji="📄" label="Research Paper" xp={150} />
                            <XpRule emoji="💼" label="Internship" xp={120} />
                            <XpRule emoji="🏆" label="Hackathon Win" xp={100} />
                            <XpRule emoji="🚀" label="Project" xp={70} />
                            <XpRule emoji="🎯" label="Hackathon Participation" xp={50} />
                            <XpRule emoji="📜" label="Certificate" xp={30} />
                            <XpRule emoji="✨" label="Other" xp={10} />
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <CreatePostModal
                    userId={profile?.id}
                    onClose={() => setShowModal(false)}
                    onPostCreated={handlePostCreated}
                />
            )}
        </div>
    );
}

function StatMini({ label, value }) {
    return (
        <div className="text-center bg-[var(--color-bg-glass)] rounded-lg py-2">
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{value ?? 0}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
        </div>
    );
}

function XpRule({ emoji, label, xp }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">{emoji} {label}</span>
            <span className="font-bold text-[var(--color-accent-primary)]">+{xp}</span>
        </div>
    );
}
