import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user } = useAuth();
    const isFaculty = user?.role === 'FACULTY' || user?.role === 'ADMIN';

    const studentNav = [
        { path: '/', label: 'Feed', icon: '🔥' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/skills', label: 'Skills', icon: '⚡' },
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/events', label: 'Events', icon: '📅' },
    ];

    const facultyNav = [
        { path: '/faculty', label: 'Faculty Portal', icon: '🎓' },
    ];

    const navItems = isFaculty ? [...studentNav, ...facultyNav] : studentNav;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] flex flex-col z-40">
            <div className="p-6 border-b border-[var(--color-border-default)]">
                <h1 className="text-2xl font-bold gradient-text tracking-tight">⚡ UpRit</h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Campus Achievement Platform</p>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-text-primary)]'
                            }`
                        }>
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-[var(--color-border-default)]">
                <p className="text-xs text-[var(--color-text-muted)] text-center">UpRit v3.0 — 2026</p>
            </div>
        </aside>
    );
}
