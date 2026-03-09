import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import UserCard from '../components/UserCard';

/**
 * ConnectionsPage — 3 sections:
 * 1) Pending Requests
 * 2) My Connections
 * 3) Suggested Students (same department/year, not followed/connected)
 */
export default function ConnectionsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [pending, setPending] = useState([]);
    const [connections, setConnections] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [activeTab, setActiveTab] = useState('connections');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const usersRes = await api.get('/api/users');
            const me = usersRes.data.find(u => u.email === user?.email);
            if (!me) return;
            setProfile(me);

            const [pendRes, connRes, followerRes, followingRes] = await Promise.all([
                api.get(`/api/connections/requests?userId=${me.id}`),
                api.get(`/api/connections/list?userId=${me.id}`),
                api.get(`/api/follows/followers/${me.id}`),
                api.get(`/api/follows/following/${me.id}`),
            ]);

            setPending(pendRes.data);
            setConnections(connRes.data);
            setFollowers(followerRes.data);
            setFollowing(followingRes.data);

            // Suggested: same department/year, not me, not already connected
            const connectedIds = new Set([
                ...connRes.data.map(c => c.userId),
                ...followingRes.data.map(f => f.userId),
                me.id,
            ]);
            const sug = usersRes.data
                .filter(u => !connectedIds.has(u.id))
                .filter(u => u.department === me.department || u.year === me.year)
                .slice(0, 10);
            setSuggested(sug);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleAccept = async (connId) => {
        try {
            await api.post(`/api/connections/accept/${connId}`);
            showToast('Connection accepted! 🤝', 'success');
            loadData();
        } catch (err) { showToast('Failed', 'error'); }
    };

    const handleReject = async (connId) => {
        try {
            await api.post(`/api/connections/reject/${connId}`);
            showToast('Request rejected', 'info');
            loadData();
        } catch (err) { showToast('Failed', 'error'); }
    };

    const handleFollow = async (targetId) => {
        if (!profile) return;
        try {
            const isFollowed = following.some(f => f.userId === targetId);
            if (isFollowed) {
                await api.delete(`/api/follows/${targetId}?followerId=${profile.id}`);
                showToast('Unfollowed', 'info');
            } else {
                await api.post(`/api/follows/${targetId}?followerId=${profile.id}`);
                showToast('Following! 🎉', 'success');
            }
            loadData();
        } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
    };

    const handleConnect = async (targetId) => {
        if (!profile) return;
        try {
            await api.post(`/api/connections/request?requesterId=${profile.id}&receiverId=${targetId}`);
            showToast('Request sent! 🤝', 'success');
            loadData();
        } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
    };

    const tabs = [
        { key: 'connections', label: '🤝 Connections', count: connections.length },
        { key: 'pending', label: '📬 Requests', count: pending.length },
        { key: 'followers', label: '👥 Followers', count: followers.length },
        { key: 'following', label: '➡️ Following', count: following.length },
        { key: 'suggested', label: '💡 Suggested', count: suggested.length },
    ];

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">🤝 Connections</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key
                                ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] border border-transparent'
                            }`}>
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs font-bold">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* CONNECTIONS TAB */}
            {activeTab === 'connections' && (
                <div className="space-y-3">
                    {connections.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">🤝</p>
                            <p className="text-[var(--color-text-secondary)]">No connections yet. Start connecting!</p>
                        </div>
                    ) : connections.map(conn => (
                        <UserCard key={conn.id} user={conn} showActions={false} />
                    ))}
                </div>
            )}

            {/* PENDING TAB */}
            {activeTab === 'pending' && (
                <div className="space-y-3">
                    {pending.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">📬</p>
                            <p className="text-[var(--color-text-secondary)]">No pending requests.</p>
                        </div>
                    ) : pending.map(req => (
                        <div key={req.id} className="glass-card p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-sm font-bold text-white shrink-0">
                                {req.userName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[var(--color-text-primary)] text-sm">{req.userName}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{req.department || 'Student'} • {req.xp} XP</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleAccept(req.id)}
                                    className="btn-success text-xs cursor-pointer">✔ Accept</button>
                                <button onClick={() => handleReject(req.id)}
                                    className="btn-danger text-xs cursor-pointer">✗ Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FOLLOWERS TAB */}
            {activeTab === 'followers' && (
                <div className="space-y-3">
                    {followers.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">👥</p>
                            <p className="text-[var(--color-text-secondary)]">No followers yet.</p>
                        </div>
                    ) : followers.map(f => (
                        <UserCard key={f.id} user={f}
                            onFollow={handleFollow}
                            isFollowing={following.some(ff => ff.userId === f.userId)}
                            onConnect={handleConnect} connectionStatus="NONE" />
                    ))}
                </div>
            )}

            {/* FOLLOWING TAB */}
            {activeTab === 'following' && (
                <div className="space-y-3">
                    {following.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">➡️</p>
                            <p className="text-[var(--color-text-secondary)]">Not following anyone yet.</p>
                        </div>
                    ) : following.map(f => (
                        <UserCard key={f.id} user={f}
                            onFollow={handleFollow} isFollowing={true}
                            showActions={true} />
                    ))}
                </div>
            )}

            {/* SUGGESTED TAB */}
            {activeTab === 'suggested' && (
                <div className="space-y-3">
                    {suggested.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">💡</p>
                            <p className="text-[var(--color-text-secondary)]">No suggestions available.</p>
                        </div>
                    ) : suggested.map(s => (
                        <UserCard key={s.id} user={s}
                            onFollow={handleFollow} onConnect={handleConnect}
                            isFollowing={false} connectionStatus="NONE" />
                    ))}
                </div>
            )}
        </div>
    );
}
