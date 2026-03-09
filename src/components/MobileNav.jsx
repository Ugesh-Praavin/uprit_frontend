import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../context/AuthContext';

/**
 * MobileNav — bottom navigation for mobile screens.
 * Features a center floating action button (FAB) for posting.
 */
export default function MobileNav() {
    const { user } = useAuth();
    const [showPost, setShowPost] = useState(false);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: '🔥', label: 'Feed' },
        { path: '/teams', icon: '👥', label: 'Teams' },
        { path: '/notifications', icon: '🔔', label: 'Notifs' },
        { path: '/profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border-t border-[var(--color-border-default)] z-50 flex items-center justify-around px-2 py-1 safe-area-pb">
                {navItems.slice(0, 2).map(item => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center py-2 px-3 rounded-xl text-xs transition-all ${isActive
                                ? 'text-[var(--color-accent-primary)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            }`
                        }>
                        <span className="text-xl mb-0.5">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}

                {/* Center FAB — Post Achievement */}
                <button
                    onClick={() => setShowPost(true)}
                    className="relative -top-4 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white text-2xl shadow-lg shadow-[var(--color-accent-primary)]/30 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    +
                </button>

                {navItems.slice(2).map(item => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center py-2 px-3 rounded-xl text-xs transition-all ${isActive
                                ? 'text-[var(--color-accent-primary)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            }`
                        }>
                        <span className="text-xl mb-0.5">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {showPost && (
                <CreatePostModal
                    userId={user?.id}
                    onClose={() => setShowPost(false)}
                    onPostCreated={() => { setShowPost(false); navigate('/'); }}
                />
            )}
        </>
    );
}
