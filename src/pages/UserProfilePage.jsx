import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import PostCard from '../components/PostCard';

export default function UserProfilePage() {
    const { userId } = useParams();
    const { user: authUser } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/api/users');
            const me = usersRes.data.find(u => u.email === authUser?.email);
            setMyId(me?.id);
            const res = await api.get(`/api/users/profile/${userId}${me ? `?viewerId=${me.id}` : ''}`);
            setProfile(res.data);
        } catch (err) {
            showToast('Failed to load profile', 'error');
        } finally { setLoading(false); }
    };

    const handleFollow = async () => {
        if (!myId) return;
        try {
            if (profile.isFollowing) {
                await api.delete(`/api/follows/${userId}?followerId=${myId}`);
                showToast('Unfollowed', 'info');
            } else {
                await api.post(`/api/follows/${userId}?followerId=${myId}`);
                showToast('Following! 🎉', 'success');
            }
            loadProfile();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handleConnect = async () => {
        if (!myId) return;
        try {
            await api.post(`/api/connections/request?requesterId=${myId}&receiverId=${userId}`);
            showToast('Connection request sent! 🤝', 'success');
            loadProfile();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    if (!profile) return <p className="text-center text-[var(--color-text-muted)] py-10">Profile not found.</p>;

    const isMe = myId && String(myId) === String(userId);

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            {/* Profile Header */}
            <div className="glass-card p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Avatar */}
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-accent-primary)]/30" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-3xl font-bold text-white shrink-0">
                            {profile.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{profile.name}</h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                            {profile.department || 'Student'} {profile.year ? `• Year ${profile.year}` : ''}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{profile.email}</p>

                        {/* Action Buttons */}
                        {!isMe && (
                            <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                                <button onClick={handleFollow}
                                    className={`text-sm px-5 py-2 rounded-xl font-medium cursor-pointer transition-all ${profile.isFollowing
                                            ? 'bg-[var(--color-bg-glass)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-red-500/30 hover:text-red-400'
                                            : 'btn-primary hover:btn-primary-hover'
                                        }`}>
                                    {profile.isFollowing ? '✓ Following' : '+ Follow'}
                                </button>
                                {profile.connectionStatus === 'NONE' && (
                                    <button onClick={handleConnect}
                                        className="text-sm px-5 py-2 rounded-xl font-medium cursor-pointer bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20 hover:bg-[var(--color-accent-secondary)]/25 transition-all">
                                        🤝 Connect
                                    </button>
                                )}
                                {profile.connectionStatus === 'PENDING' && (
                                    <span className="text-sm px-5 py-2 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">⏳ Pending</span>
                                )}
                                {profile.connectionStatus === 'ACCEPTED' && (
                                    <span className="text-sm px-5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">✔ Connected</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
                    {[
                        { label: 'XP', value: profile.xp, icon: '⚡' },
                        { label: 'Level', value: profile.level, icon: '🎮' },
                        { label: 'Posts', value: profile.totalPosts, icon: '📝' },
                        { label: 'Verified', value: profile.verifiedPosts, icon: '✔' },
                        { label: 'Followers', value: profile.followersCount, icon: '👥' },
                        { label: 'Connections', value: profile.connectionsCount, icon: '🤝' },
                    ].map(stat => (
                        <div key={stat.label} className="text-center p-3 rounded-xl bg-[var(--color-bg-glass)] border border-[var(--color-border-default)]">
                            <p className="text-lg">{stat.icon}</p>
                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{stat.value || 0}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
                <div className="glass-card p-5 mb-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">⚡ Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                            <span key={skill} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Posts */}
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">📝 Recent Achievements</h3>
                {profile.recentPosts?.length > 0 ? (
                    <div className="space-y-4">
                        {profile.recentPosts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                ) : (
                    <div className="glass-card p-8 text-center">
                        <p className="text-2xl mb-2">📝</p>
                        <p className="text-[var(--color-text-muted)]">No achievements posted yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
