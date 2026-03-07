import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', department: '', year: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.department, form.year);
            showToast('Registration successful! Welcome to UpRit!', 'success');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.errors
                ? Object.values(err.response?.data?.errors || {}).join(', ')
                : 'Registration failed';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--color-accent-tertiary)] rounded-full opacity-[0.07] blur-[100px]" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[var(--color-accent-primary)] rounded-full opacity-[0.07] blur-[100px]" />
            </div>

            <div className="glass-card p-8 w-full max-w-md animate-fade-in relative">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">⚡ Join UpRit</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">Create your account and start leveling up</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
                        <input
                            type="text" name="name" value={form.name} onChange={handleChange}
                            placeholder="John Doe" required
                            className="input-field focus:input-field-focus"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
                        <input
                            type="email" name="email" value={form.email} onChange={handleChange}
                            placeholder="you@example.com" required
                            className="input-field focus:input-field-focus"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Password</label>
                        <input
                            type="password" name="password" value={form.password} onChange={handleChange}
                            placeholder="Min 6 characters" required minLength={6}
                            className="input-field focus:input-field-focus"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Department</label>
                            <input
                                type="text" name="department" value={form.department} onChange={handleChange}
                                placeholder="CSE"
                                className="input-field focus:input-field-focus"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Year</label>
                            <input
                                type="number" name="year" value={form.year} onChange={handleChange}
                                placeholder="3" min="1" max="5"
                                className="input-field focus:input-field-focus"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full btn-primary hover:btn-primary-hover disabled:opacity-60 py-3 mt-2 flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner size="sm" /> : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[var(--color-accent-primary)] hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
