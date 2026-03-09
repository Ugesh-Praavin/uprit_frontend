import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

/**
 * NotificationsPage — full-page notification list.
 */
export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const usersRes = await api.get('/api/users');
            const me = usersRes.data.find(u => u.email === user?.email);
            if (me) {
                setUserId(me.id);
                const res = await api.get(`/api/notifications?userId=${me.id}`);
                setNotifications(res.data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        if (!userId) return;
        try {
            await api.put(`/api/notifications/read-all?userId=${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) { console.error(err); }
    };

    const typeIcon = (type) => {
        const map = { LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤', CONNECTION_REQUEST: '🤝', POST_VERIFIED: '✔️', EVENT_CREATED: '📅' };
        return map[type] || '🔔';
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

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">🔔 Notifications</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead}
                        className="btn-secondary text-xs cursor-pointer">
                        ✓ Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">🔔</p>
                    <p className="text-[var(--color-text-secondary)] font-medium">No notifications yet</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">They'll appear here when people interact with your posts</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <div key={n.id}
                            onClick={() => !n.read && markRead(n.id)}
                            className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-all hover:glass-card-hover ${!n.read ? 'border-l-2 border-l-[var(--color-accent-primary)]' : 'opacity-75'
                                }`}>
                            <span className="text-xl shrink-0">{typeIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.read ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                                    {n.actorName && <span className="font-semibold">{n.actorName} </span>}
                                    {n.message.replace(n.actorName || '', '').trim()}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.read && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-primary)] shrink-0 mt-2"></span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
