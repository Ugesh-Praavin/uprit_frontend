import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * NotificationBell — top-right nav icon with unread badge + dropdown panel.
 */
export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const ref = useRef();

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/api/users');
                const me = res.data.find(u => u.email === user?.email);
                if (me) {
                    setUserId(me.id);
                    const countRes = await api.get(`/api/notifications/unread-count?userId=${me.id}`);
                    setUnread(countRes.data.count || 0);
                }
            } catch (err) { console.error(err); }
        };
        init();
        const interval = setInterval(init, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const togglePanel = async () => {
        if (!open && userId) {
            try {
                const res = await api.get(`/api/notifications?userId=${userId}`);
                setNotifications(res.data.slice(0, 10));
            } catch (err) { console.error(err); }
        }
        setOpen(!open);
    };

    const markRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        if (!userId) return;
        try {
            await api.put(`/api/notifications/read-all?userId=${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnread(0);
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
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={togglePanel}
                className="relative p-2 rounded-xl hover:bg-[var(--color-bg-glass-hover)] transition-colors cursor-pointer">
                <span className="text-xl">🔔</span>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full px-1 animate-pulse">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--color-bg-dropdown)] border border-[var(--color-border-default)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-default)]">
                        <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Notifications</h4>
                        <div className="flex gap-2">
                            {unread > 0 && (
                                <button onClick={markAllRead}
                                    className="text-xs text-[var(--color-accent-primary)] hover:underline cursor-pointer">
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => { setOpen(false); navigate('/notifications'); }}
                                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer">
                                View all
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-2xl mb-1">🔔</p>
                                <p className="text-sm text-[var(--color-text-muted)]">No notifications yet</p>
                            </div>
                        ) : notifications.map(n => (
                            <div key={n.id}
                                onClick={() => !n.read && markRead(n.id)}
                                className={`flex gap-3 px-4 py-3 hover:bg-[var(--color-bg-glass-hover)] transition-colors cursor-pointer border-b border-[var(--color-border-default)] last:border-0 ${!n.read ? 'bg-[var(--color-accent-primary)]/5' : ''
                                    }`}>
                                <span className="text-lg shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!n.read ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shrink-0 mt-2"></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
