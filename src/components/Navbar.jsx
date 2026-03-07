import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Top navigation bar — shows user info and logout button.
 */
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--color-border-default)] flex items-center justify-between px-8 z-30">
            <div>
                <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Welcome back,{' '}
                    <span className="text-[var(--color-text-primary)] font-semibold">
                        {user?.name || 'Student'}
                    </span>
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* User badge */}
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-accent-primary)]">
                        {user?.role || 'USER'}
                    </span>
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    className="btn-secondary hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
