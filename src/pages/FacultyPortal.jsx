import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

/**
 * FacultyPortal — tabbed dashboard for faculty:
 * 1) Pending Verifications
 * 2) Reports
 * 3) Talent Discovery
 */
export default function FacultyPortal() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('verify');
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState([]);
    const [reports, setReports] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ department: '', year: '', xpMin: '', xpMax: '', verifiedOnly: false });
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadFacultyData();
    }, []);

    const loadFacultyData = async () => {
        try {
            const [pendingRes, reportsRes, usersRes] = await Promise.all([
                api.get('/api/faculty/pending'),
                api.get('/api/faculty/reports'),
                api.get('/api/users'),
            ]);
            setPending(pendingRes.data);
            setReports(reportsRes.data);
            const me = usersRes.data.find(u => u.email === user?.email);
            setProfile(me);
        } catch (err) {
            console.error('Faculty load error:', err);
        } finally { setLoading(false); }
    };

    const handleVerify = async (postId, status) => {
        if (!profile) return;
        try {
            await api.post(`/api/faculty/verify/${postId}?facultyId=${profile.id}`, {
                status, comment: status === 'VERIFIED' ? 'Looks good!' : 'Could not verify this achievement.',
            });
            showToast(`Post ${status.toLowerCase()} successfully`, 'success');
            setPending(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            showToast(err.response?.data?.message || 'Verification failed', 'error');
        }
    };

    const handleUpdateReport = async (reportId, status) => {
        try {
            await api.put(`/api/faculty/reports/${reportId}?status=${status}`);
            showToast(`Report ${status.toLowerCase()}`, 'success');
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
        } catch (err) {
            showToast('Failed to update report', 'error');
        }
    };

    const handleSearchStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.department) params.append('department', filters.department);
            if (filters.year) params.append('year', filters.year);
            if (filters.xpMin) params.append('xpMin', filters.xpMin);
            if (filters.xpMax) params.append('xpMax', filters.xpMax);
            if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
            const res = await api.get(`/api/faculty/students?${params.toString()}`);
            setStudents(res.data);
            showToast(`Found ${res.data.length} students`, 'info');
        } catch (err) {
            showToast('Search failed', 'error');
        }
    };

    const tabs = [
        { key: 'verify', label: '✔ Verification', count: pending.length },
        { key: 'reports', label: '🚩 Reports', count: reports.filter(r => r.status === 'OPEN').length },
        { key: 'students', label: '🔍 Talent Discovery', count: null },
    ];

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">🎓 Faculty Portal</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key
                                ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] border border-transparent'
                            }`}>
                        {tab.label}
                        {tab.count != null && tab.count > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[var(--color-accent-danger)]/20 text-[var(--color-accent-danger)] text-xs font-bold">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ═══════════════════ VERIFICATION TAB ═══════════════════ */}
            {activeTab === 'verify' && (
                <div className="space-y-4">
                    {pending.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">✅</p>
                            <p className="text-[var(--color-text-secondary)]">All caught up! No pending verifications.</p>
                        </div>
                    ) : (
                        pending.map(post => (
                            <div key={post.id} className="glass-card p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-sm font-bold text-white shrink-0">
                                        {post.username?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-semibold text-[var(--color-text-primary)]">{post.username}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">{post.achievementType?.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-[var(--color-accent-primary)] font-bold">+{post.xpAwarded} XP</span>
                                        </div>
                                        <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">{post.title}</h4>
                                        <p className="text-sm text-[var(--color-text-secondary)] mb-3">{post.description}</p>
                                        {post.certificateUrl && (
                                            <a href={post.certificateUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-[var(--color-accent-tertiary)] hover:underline mb-3 inline-block">📎 View Certificate</a>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handleVerify(post.id, 'VERIFIED')}
                                                className="btn-success hover:opacity-90 cursor-pointer">✔ Verify</button>
                                            <button onClick={() => handleVerify(post.id, 'REJECTED')}
                                                className="btn-danger hover:opacity-90 cursor-pointer">✗ Reject</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ═══════════════════ REPORTS TAB ═══════════════════ */}
            {activeTab === 'reports' && (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <div className="glass-card p-10 text-center">
                            <p className="text-3xl mb-2">🛡️</p>
                            <p className="text-[var(--color-text-secondary)]">No reports yet.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <div key={report.id} className="glass-card p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Report #{report.id}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${report.status === 'OPEN' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                                                    report.status === 'REVIEWED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                                                        'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            <strong>Post:</strong> {report.postTitle} | <strong>Reason:</strong> {report.reason?.replace(/_/g, ' ')}
                                        </p>
                                        {report.details && <p className="text-xs text-[var(--color-text-muted)] mt-1">{report.details}</p>}
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">By: {report.facultyName}</p>
                                    </div>
                                    {report.status === 'OPEN' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleUpdateReport(report.id, 'REVIEWED')}
                                                className="btn-success text-xs hover:opacity-90 cursor-pointer">Reviewed</button>
                                            <button onClick={() => handleUpdateReport(report.id, 'DISMISSED')}
                                                className="btn-secondary text-xs hover:opacity-90 cursor-pointer">Dismiss</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ═══════════════════ TALENT DISCOVERY TAB ═══════════════════ */}
            {activeTab === 'students' && (
                <div>
                    {/* Filters */}
                    <div className="glass-card p-5 mb-6">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">🔍 Filter Students</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <input placeholder="Department" value={filters.department}
                                onChange={e => setFilters({ ...filters, department: e.target.value })}
                                className="input-field focus:input-field-focus text-sm" />
                            <input placeholder="Year" type="number" value={filters.year}
                                onChange={e => setFilters({ ...filters, year: e.target.value })}
                                className="input-field focus:input-field-focus text-sm" />
                            <input placeholder="Min XP" type="number" value={filters.xpMin}
                                onChange={e => setFilters({ ...filters, xpMin: e.target.value })}
                                className="input-field focus:input-field-focus text-sm" />
                            <input placeholder="Max XP" type="number" value={filters.xpMax}
                                onChange={e => setFilters({ ...filters, xpMax: e.target.value })}
                                className="input-field focus:input-field-focus text-sm" />
                            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                                <input type="checkbox" checked={filters.verifiedOnly}
                                    onChange={e => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                                    className="rounded cursor-pointer" /> Verified Only
                            </label>
                        </div>
                        <button onClick={handleSearchStudents}
                            className="btn-primary hover:btn-primary-hover mt-4 cursor-pointer">Search Students</button>
                    </div>

                    {/* Results */}
                    {students.length > 0 && (
                        <div className="space-y-3">
                            {students.map((s, idx) => (
                                <div key={s.id} className="glass-card p-4 flex items-center gap-4">
                                    <span className="text-lg w-8 text-center font-bold text-[var(--color-text-muted)]">#{idx + 1}</span>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-sm font-bold text-white shrink-0">
                                        {s.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[var(--color-text-primary)] text-sm">{s.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{s.department || 'N/A'} • Year {s.year || '?'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-[var(--color-accent-primary)]">{s.xp} XP</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Lvl {s.level} • {s.verifiedPosts}/{s.totalPosts} verified</p>
                                    </div>
                                    {s.skills?.length > 0 && (
                                        <div className="flex gap-1 flex-wrap max-w-40">
                                            {s.skills.slice(0, 3).map(skill => (
                                                <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-glass)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
