import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-[var(--color-bg-secondary)]/80 backdrop-blur-md border-b border-[var(--color-border-default)] flex items-center justify-between px-4 sm:px-8 z-30">
            <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] truncate">
                    Welcome, {user?.name || 'Student'} 👋
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                    {user?.role === 'FACULTY' ? '🎓 Faculty Member' : user?.role === 'ADMIN' ? '🛡️ Admin' : '🎯 Student'}
                </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] font-medium border border-[var(--color-accent-primary)]/20">
                    {user?.role || 'USER'}
                </span>

                <NotificationBell />
                <ThemeToggle />

                <button onClick={logout}
                    className="btn-secondary hover:bg-[var(--color-bg-glass-hover)] cursor-pointer text-xs sm:text-sm px-3 sm:px-4">
                    Logout
                </button>
            </div>
        </header>
    );
}
