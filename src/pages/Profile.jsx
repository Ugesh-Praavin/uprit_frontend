import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

export default function Profile() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [xpAmount, setXpAmount] = useState(50);
    const [addingXp, setAddingXp] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const usersRes = await api.get('/api/users');
            const currentUser = usersRes.data.find(u => u.email === user?.email);
            setProfile(currentUser);

            if (currentUser) {
                const [skillsRes, postsRes] = await Promise.all([
                    api.get(`/api/skills/users/${currentUser.id}`),
                    api.get(`/api/posts/user/${currentUser.id}`),
                ]);
                setSkills(skillsRes.data);
                setUserPosts(postsRes.data);
            }
        } catch (err) {
            console.error('Profile load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddXp = async () => {
        if (!profile) return;
        setAddingXp(true);
        try {
            const res = await api.post(`/api/users/${profile.id}/xp`, { xp: xpAmount });
            setProfile(res.data);
            showToast(`+${xpAmount} XP added! You're now level ${res.data.level}`, 'success');
        } catch (err) {
            showToast('Failed to add XP', 'error');
        } finally {
            setAddingXp(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-fade-in max-w-3xl">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">👤 Profile</h1>

            {/* Profile Card */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-2xl font-bold text-white">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{profile?.name}</h2>
                        <p className="text-sm text-[var(--color-text-secondary)]">{profile?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="XP" value={profile?.xp} icon="⚡" />
                    <StatBox label="Level" value={profile?.level} icon="🎯" />
                    <StatBox label="Coins" value={profile?.coins} icon="🪙" />
                    <StatBox label="Posts" value={userPosts.length} icon="📝" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Department</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{profile?.department || 'Not set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Role</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{profile?.role || 'USER'}</p>
                    </div>
                </div>
            </div>

            {/* Add XP Section */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">⚡ Add XP (Testing)</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                        min="1"
                        className="input-field focus:input-field-focus w-32"
                    />
                    <button
                        onClick={handleAddXp}
                        disabled={addingXp}
                        className="btn-primary hover:btn-primary-hover disabled:opacity-60 flex items-center gap-2"
                    >
                        {addingXp ? <Spinner size="sm" /> : `Add ${xpAmount} XP`}
                    </button>
                </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">🧠 My Skills</h3>
                {skills.length === 0 ? (
                    <p className="text-[var(--color-text-muted)] text-sm">No skills assigned yet. Go to the Skills page to add some!</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {skills.map(skill => (
                            <div key={skill.id} className="glass-card px-4 py-2 flex items-center gap-2">
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{skill.skillName}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]">
                                    {skill.proficiencyLevel}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User Posts */}
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">📝 My Achievements</h3>
                {userPosts.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <p className="text-[var(--color-text-muted)] text-sm">No achievements posted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, icon }) {
    return (
        <div className="bg-[var(--color-bg-glass)] rounded-xl p-3 text-center">
            <span className="text-lg">{icon}</span>
            <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">{value ?? 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        </div>
    );
}
