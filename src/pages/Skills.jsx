import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function Skills() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSkill, setNewSkill] = useState('');
    const [creating, setCreating] = useState(false);

    // Assign modal state
    const [showAssign, setShowAssign] = useState(false);
    const [assignSkillId, setAssignSkillId] = useState('');
    const [proficiency, setProficiency] = useState('BEGINNER');
    const [assigning, setAssigning] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [skillsRes, usersRes] = await Promise.all([
                api.get('/api/skills'),
                api.get('/api/users'),
            ]);
            setSkills(skillsRes.data);
            const current = usersRes.data.find(u => u.email === user?.email);
            if (current) setCurrentUserId(current.id);
        } catch (err) {
            console.error('Skills load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        setCreating(true);
        try {
            const res = await api.post('/api/skills', { skillName: newSkill.trim() });
            setSkills([...skills, res.data]);
            setNewSkill('');
            showToast(`Skill "${res.data.skillName}" created!`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create skill', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/skills/${id}`);
            setSkills(skills.filter(s => s.id !== id));
            showToast('Skill deleted', 'success');
        } catch (err) {
            showToast('Failed to delete skill', 'error');
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!currentUserId || !assignSkillId) return;
        setAssigning(true);
        try {
            await api.post(`/api/skills/users/${currentUserId}`, {
                skillId: parseInt(assignSkillId),
                proficiencyLevel: proficiency,
            });
            showToast('Skill assigned successfully!', 'success');
            setShowAssign(false);
            setAssignSkillId('');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to assign skill', 'error');
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">⚡ Skills</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage platform skills</p>
                </div>
                <button
                    onClick={() => setShowAssign(!showAssign)}
                    className="btn-secondary hover:bg-[var(--color-bg-glass-hover)] cursor-pointer"
                >
                    {showAssign ? 'Close' : '+ Assign Skill to Me'}
                </button>
            </div>

            {/* Assign Skill Panel */}
            {showAssign && (
                <div className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Assign Skill</h3>
                    <form onSubmit={handleAssign} className="flex items-end gap-3 flex-wrap">
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Skill</label>
                            <select
                                value={assignSkillId}
                                onChange={(e) => setAssignSkillId(e.target.value)}
                                required
                                className="input-field focus:input-field-focus w-48"
                            >
                                <option value="">Select skill</option>
                                {skills.map(s => (
                                    <option key={s.id} value={s.id}>{s.skillName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Proficiency</label>
                            <select
                                value={proficiency}
                                onChange={(e) => setProficiency(e.target.value)}
                                className="input-field focus:input-field-focus w-44"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                            </select>
                        </div>
                        <button type="submit" disabled={assigning} className="btn-primary hover:btn-primary-hover disabled:opacity-60">
                            {assigning ? <Spinner size="sm" /> : 'Assign'}
                        </button>
                    </form>
                </div>
            )}

            {/* Create Skill */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Create New Skill</h3>
                <form onSubmit={handleCreate} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., React, Java, Machine Learning"
                        required
                        className="input-field focus:input-field-focus flex-1"
                    />
                    <button type="submit" disabled={creating} className="btn-primary hover:btn-primary-hover disabled:opacity-60">
                        {creating ? <Spinner size="sm" /> : 'Create'}
                    </button>
                </form>
            </div>

            {/* Skills Grid */}
            {skills.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--color-text-muted)]">No skills created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map(skill => (
                        <div key={skill.id} className="glass-card hover:glass-card-hover p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center text-lg">
                                    ⚡
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--color-text-primary)]">{skill.skillName}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">ID: {skill.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(skill.id)}
                                className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
