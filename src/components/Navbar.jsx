import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-[var(--color-bg-secondary)]/80 backdrop-blur-md border-b border-[var(--color-border-default)] flex items-center justify-between px-8 z-30">
            <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Welcome, {user?.name || 'Student'} 👋
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {user?.role === 'FACULTY' ? '🎓 Faculty Member' : user?.role === 'ADMIN' ? '🛡️ Admin' : '🎯 Student'}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Role badge */}
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] font-medium border border-[var(--color-accent-primary)]/20">
                    {user?.role || 'USER'}
                </span>

                <ThemeToggle />

                <button onClick={logout}
                    className="btn-secondary hover:bg-[var(--color-bg-glass-hover)] cursor-pointer text-sm">
                    Logout
                </button>
            </div>
        </header>
    );
}
