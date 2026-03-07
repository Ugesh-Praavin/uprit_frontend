import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            showToast('Login successful!', 'success');
            navigate('/');
        } catch (err) {
            showToast(err.response?.data?.message || 'Invalid email or password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-accent-primary)] rounded-full opacity-[0.07] blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-accent-secondary)] rounded-full opacity-[0.07] blur-[100px]" />
            </div>

            <div className="glass-card p-8 w-full max-w-md animate-fade-in relative">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">⚡ UpRit</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">Sign in to continue your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="input-field focus:input-field-focus"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="input-field focus:input-field-focus"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary hover:btn-primary-hover disabled:opacity-60 py-3 flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner size="sm" /> : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[var(--color-accent-primary)] hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
