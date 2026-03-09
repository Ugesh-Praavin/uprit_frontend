import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import Spinner from './Spinner';
import api from '../services/api';

/**
 * CreateTeamModal — form to create a new team request.
 */
export default function CreateTeamModal({ userId, onClose, onCreated }) {
    const { showToast } = useToast();
    const [form, setForm] = useState({
        title: '', description: '', requiredSkills: '', maxMembers: 4, eventId: '',
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !skills.includes(s)) {
            setSkills([...skills, s]);
        }
        setSkillInput('');
    };

    const removeSkill = (skill) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) { showToast('User not loaded', 'error'); return; }
        if (skills.length === 0) { showToast('Add at least one skill', 'error'); return; }
        setSubmitting(true);
        try {
            const res = await api.post(`/api/team-requests?userId=${userId}`, {
                title: form.title,
                description: form.description,
                requiredSkills: skills.join(','),
                maxMembers: parseInt(form.maxMembers, 10),
                eventId: form.eventId ? parseInt(form.eventId, 10) : null,
            });
            showToast('Team request created! 🎉', 'success');
            onCreated(res.data);
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create team', 'error');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--color-bg-modal)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-lg animate-fade-in shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">👥 Create Team Request</h2>
                    <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xl cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange}
                            placeholder="e.g., Looking for ML teammates for SIH"
                            required className="input-field focus:input-field-focus" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange}
                            placeholder="Describe what you're building and who you need..."
                            rows={3} className="input-field focus:input-field-focus resize-none" />
                    </div>

                    {/* Skill Chips Input */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            Required Skills
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {skills.map(s => (
                                <span key={s}
                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 flex items-center gap-1">
                                    {s}
                                    <button type="button" onClick={() => removeSkill(s)}
                                        className="text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer ml-0.5">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a skill and press Enter"
                                className="input-field focus:input-field-focus flex-1" />
                            <button type="button" onClick={addSkill}
                                className="btn-secondary text-xs px-3 cursor-pointer shrink-0">
                                + Add
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                Max Members
                            </label>
                            <input type="number" name="maxMembers" value={form.maxMembers} onChange={handleChange}
                                min={2} max={20} required className="input-field focus:input-field-focus" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                Event ID <span className="text-[var(--color-text-muted)]">(optional)</span>
                            </label>
                            <input type="number" name="eventId" value={form.eventId} onChange={handleChange}
                                placeholder="e.g., 1" className="input-field focus:input-field-focus" />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full btn-primary hover:btn-primary-hover disabled:opacity-60 py-3 flex items-center justify-center gap-2 cursor-pointer">
                        {submitting ? <Spinner size="sm" /> : '🚀 Create Team Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
