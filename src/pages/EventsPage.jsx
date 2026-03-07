import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const EVENT_TYPE_LABELS = {
    COLLEGE_EVENT: '🏫 College Event',
    INTERCOLLEGE_EVENT: '🌐 Inter-College',
    WORKSHOP: '🔧 Workshop',
    HACKATHON: '💻 Hackathon',
    SEMINAR: '🎤 Seminar',
    OTHER: '📌 Other',
};

const EVENT_TYPE_COLORS = {
    COLLEGE_EVENT: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    INTERCOLLEGE_EVENT: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    WORKSHOP: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    HACKATHON: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    SEMINAR: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    OTHER: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

export default function EventsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', organizerName: '', organizerEmail: '',
        organizerContact: '', eventType: 'COLLEGE_EVENT', registrationLink: '',
        eventDate: '', location: '', imageUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const isFaculty = user?.role === 'FACULTY' || user?.role === 'ADMIN';

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const [eventsRes, usersRes] = await Promise.all([
                api.get('/api/events/upcoming'),
                api.get('/api/users'),
            ]);
            setEvents(eventsRes.data);
            const me = usersRes.data.find(u => u.email === user?.email);
            setProfile(me);
        } catch (err) {
            console.error('Events load error:', err);
        } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!profile) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/api/events?facultyId=${profile.id}`, {
                ...form,
                eventDate: form.eventDate ? form.eventDate + ':00' : null,
            });
            showToast('Event created successfully! 🎉', 'success');
            setEvents([res.data, ...events].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
            setShowCreate(false);
            setForm({
                title: '', description: '', organizerName: '', organizerEmail: '',
                organizerContact: '', eventType: 'COLLEGE_EVENT', registrationLink: '',
                eventDate: '', location: '', imageUrl: '',
            });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create event', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (eventId) => {
        try {
            await api.delete(`/api/events/${eventId}`);
            setEvents(prev => prev.filter(e => e.id !== eventId));
            showToast('Event deleted', 'success');
        } catch (err) {
            showToast('Failed to delete event', 'error');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
            + ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">📅 Campus Events</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Discover upcoming events and opportunities</p>
                </div>
                {isFaculty && (
                    <button onClick={() => setShowCreate(!showCreate)}
                        className="btn-primary hover:btn-primary-hover cursor-pointer">
                        {showCreate ? 'Cancel' : '+ Create Event'}
                    </button>
                )}
            </div>

            {/* Create Event Form (Faculty Only) */}
            {showCreate && (
                <form onSubmit={handleCreate} className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Create Event</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Event Title *" required value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}
                            className="input-field focus:input-field-focus">
                            {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <input placeholder="Organizer Name *" required value={form.organizerName}
                            onChange={e => setForm({ ...form, organizerName: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <input placeholder="Organizer Email" value={form.organizerEmail}
                            onChange={e => setForm({ ...form, organizerEmail: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <input placeholder="Organizer Contact" value={form.organizerContact}
                            onChange={e => setForm({ ...form, organizerContact: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <input placeholder="Location" value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <input type="datetime-local" required value={form.eventDate}
                            onChange={e => setForm({ ...form, eventDate: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <input placeholder="Registration Link" value={form.registrationLink}
                            onChange={e => setForm({ ...form, registrationLink: e.target.value })}
                            className="input-field focus:input-field-focus" />
                        <textarea placeholder="Description" rows={2} value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="input-field focus:input-field-focus resize-none md:col-span-2" />
                    </div>
                    <button type="submit" disabled={submitting}
                        className="btn-primary hover:btn-primary-hover mt-4 flex items-center gap-2 cursor-pointer">
                        {submitting ? <Spinner size="sm" /> : '🚀 Create Event'}
                    </button>
                </form>
            )}

            {/* Event Cards */}
            {events.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-[var(--color-text-secondary)] font-medium">No upcoming events</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {isFaculty ? 'Create your first event!' : 'Check back later for events.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {events.map(event => (
                        <div key={event.id} className="glass-card hover:glass-card-hover p-5 transition-all duration-300">
                            {/* Event Type Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.OTHER}`}>
                                    {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                                </span>
                                {isFaculty && (
                                    <button onClick={() => handleDelete(event.id)}
                                        className="text-xs text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer">🗑️</button>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{event.title}</h3>
                            {event.description && (
                                <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{event.description}</p>
                            )}

                            <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
                                <p>📅 {formatDate(event.eventDate)}</p>
                                {event.location && <p>📍 {event.location}</p>}
                                <p>👤 {event.organizerName}</p>
                                {event.organizerEmail && <p>✉️ {event.organizerEmail}</p>}
                            </div>

                            {event.registrationLink && (
                                <a href={event.registrationLink} target="_blank" rel="noopener noreferrer"
                                    className="mt-4 block text-center btn-primary hover:btn-primary-hover text-sm">
                                    🚀 Register Now
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
