import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function Projects() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Create form
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Team modal
    const [teamModal, setTeamModal] = useState(null); // project id
    const [teamMembers, setTeamMembers] = useState([]);
    const [newMemberId, setNewMemberId] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                api.get('/api/projects'),
                api.get('/api/users'),
            ]);
            setProjects(projectsRes.data);
            const current = usersRes.data.find(u => u.email === user?.email);
            if (current) setCurrentUserId(current.id);
        } catch (err) {
            console.error('Projects load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!currentUserId) return;
        setCreating(true);
        try {
            const res = await api.post(`/api/projects?userId=${currentUserId}`, { title, description });
            setProjects([...projects, res.data]);
            setTitle('');
            setDescription('');
            setShowCreate(false);
            showToast(`Project "${res.data.title}" created!`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create project', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
            showToast('Project deleted', 'success');
        } catch (err) {
            showToast('Failed to delete project', 'error');
        }
    };

    const openTeam = async (projectId) => {
        setTeamModal(projectId);
        try {
            const res = await api.get(`/api/projects/${projectId}/teams`);
            setTeamMembers(res.data);
        } catch {
            setTeamMembers([]);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!teamModal || !newMemberId) return;
        setAddingMember(true);
        try {
            const res = await api.post(`/api/projects/${teamModal}/teams`, { userId: parseInt(newMemberId) });
            setTeamMembers([...teamMembers, res.data]);
            setNewMemberId('');
            showToast('Team member added!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add member', 'error');
        } finally {
            setAddingMember(false);
        }
    };

    const statusColors = {
        OPEN: 'bg-emerald-500/15 text-emerald-400',
        IN_PROGRESS: 'bg-amber-500/15 text-amber-400',
        COMPLETED: 'bg-indigo-500/15 text-indigo-400',
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">📁 Projects</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage your projects and teams</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="btn-primary hover:btn-primary-hover cursor-pointer"
                >
                    {showCreate ? 'Cancel' : '+ New Project'}
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Create Project</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Title</label>
                            <input
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Project title" required
                                className="input-field focus:input-field-focus"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Description</label>
                            <textarea
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your project..."
                                rows={3}
                                className="input-field focus:input-field-focus resize-none"
                            />
                        </div>
                        <button type="submit" disabled={creating} className="btn-primary hover:btn-primary-hover disabled:opacity-60">
                            {creating ? <Spinner size="sm" /> : 'Create Project'}
                        </button>
                    </form>
                </div>
            )}

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--color-text-muted)]">No projects yet. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {projects.map(project => (
                        <div key={project.id} className="glass-card hover:glass-card-hover p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{project.title}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                                        {project.description || 'No description'}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-3 ${statusColors[project.status] || ''}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border-default)]">
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    by <span className="text-[var(--color-text-secondary)]">{project.createdByName}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openTeam(project.id)}
                                        className="text-xs text-[var(--color-accent-primary)] hover:underline cursor-pointer"
                                    >
                                        👥 Team
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Team Modal */}
            {teamModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setTeamModal(null)}>
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">👥 Team Members</h3>
                            <button onClick={() => setTeamModal(null)} className="text-[var(--color-text-muted)] hover:text-white text-lg cursor-pointer">✕</button>
                        </div>

                        {/* Add member */}
                        <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
                            <input
                                type="number" value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)}
                                placeholder="User ID" required min="1"
                                className="input-field focus:input-field-focus flex-1"
                            />
                            <button type="submit" disabled={addingMember} className="btn-primary hover:btn-primary-hover disabled:opacity-60">
                                {addingMember ? <Spinner size="sm" /> : 'Add'}
                            </button>
                        </form>

                        {/* Members list */}
                        {teamMembers.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-muted)]">No team members yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {teamMembers.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-glass)] rounded-lg">
                                        <span className="text-sm text-[var(--color-text-primary)]">{m.userName}</span>
                                        <span className="text-xs text-[var(--color-text-muted)]">ID: {m.userId}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
