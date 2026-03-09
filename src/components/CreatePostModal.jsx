import { useState } from 'react';
import { useToast } from './Toast';
import Spinner from './Spinner';
import api from '../services/api';

const ACHIEVEMENT_TYPES = [
    { value: 'HACKATHON_WIN', label: '🏆 Hackathon Win' },
    { value: 'HACKATHON_PARTICIPATION', label: '🎯 Hackathon Participation' },
    { value: 'CERTIFICATE', label: '📜 Certificate' },
    { value: 'PROJECT_COMPLETION', label: '🚀 Project Completion' },
    { value: 'INTERNSHIP', label: '💼 Internship' },
    { value: 'RESEARCH_PAPER', label: '📄 Research Paper' },
    { value: 'OTHER', label: '✨ Other' },
];

export default function CreatePostModal({ userId, onClose, onPostCreated }) {
    const { showToast } = useToast();
    const [form, setForm] = useState({
        title: '', description: '', achievementType: 'HACKATHON_WIN',
        imageUrl: '', certificateUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) { showToast('User not loaded yet', 'error'); return; }
        setSubmitting(true);
        try {
            const res = await api.post(`/api/posts?userId=${userId}`, {
                title: form.title, description: form.description,
                achievementType: form.achievementType,
                imageUrl: form.imageUrl || null,
                certificateUrl: form.certificateUrl || null,
            });
            showToast(`Achievement posted! +${res.data.xpAwarded} XP earned 🎉`, 'success');
            onPostCreated(res.data);
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create post', 'error');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--color-bg-modal)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-lg animate-fade-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">🎯 Post Achievement</h2>
                    <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xl cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange}
                            placeholder="e.g., Won Smart India Hackathon" required className="input-field focus:input-field-focus" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange}
                            placeholder="Describe your achievement..." required rows={3}
                            className="input-field focus:input-field-focus resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Achievement Type</label>
                        <select name="achievementType" value={form.achievementType} onChange={handleChange}
                            className="input-field focus:input-field-focus">
                            {ACHIEVEMENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            Certificate URL <span className="text-[var(--color-text-muted)]">(recommended)</span>
                        </label>
                        <input type="url" name="certificateUrl" value={form.certificateUrl} onChange={handleChange}
                            placeholder="https://example.com/certificate.pdf" className="input-field focus:input-field-focus" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            Image URL <span className="text-[var(--color-text-muted)]">(optional)</span>
                        </label>
                        <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange}
                            placeholder="https://example.com/image.jpg" className="input-field focus:input-field-focus" />
                    </div>
                    <button type="submit" disabled={submitting}
                        className="w-full btn-primary hover:btn-primary-hover disabled:opacity-60 py-3 flex items-center justify-center gap-2">
                        {submitting ? <Spinner size="sm" /> : '🚀 Post Achievement'}
                    </button>
                </form>
            </div>
        </div>
    );
}
