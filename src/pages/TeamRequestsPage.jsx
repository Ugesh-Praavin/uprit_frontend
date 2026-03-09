import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TeamRequestCard from '../components/TeamRequestCard';
import CreateTeamModal from '../components/CreateTeamModal';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';

/**
 * TeamRequestsPage — browse open team requests, view my teams, create new ones.
 * Route: /teams
 */
export default function TeamRequestsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState('open');
    const [openRequests, setOpenRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [openRes, usersRes] = await Promise.all([
                api.get('/api/team-requests'),
                api.get('/api/users'),
            ]);
            const me = usersRes.data.find(u => u.email === user?.email);
            setProfile(me);
            setOpenRequests(openRes.data);
            if (me) {
                const myRes = await api.get(`/api/team-requests/user/${me.id}`);
                setMyRequests(myRes.data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleJoin = async (requestId) => {
        if (!profile) return;
        try {
            await api.post(`/api/team-requests/${requestId}/join?userId=${profile.id}`);
            showToast('Joined team! 🎉', 'success');
            load(); // refresh
        } catch (err) {
            showToast(err.response?.data?.message || 'Cannot join', 'error');
        }
    };

    const handleCreated = () => {
        load();
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    const displayedRequests = tab === 'open' ? openRequests : myRequests;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">👥 Team Formation</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        Find teammates for hackathons & projects
                    </p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="btn-primary hover:btn-primary-hover cursor-pointer flex items-center gap-2">
                    <span className="text-lg">+</span> Create Team
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[var(--color-bg-glass)] rounded-xl p-1 mb-6 w-fit">
                <button onClick={() => setTab('open')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${tab === 'open'
                            ? 'bg-[var(--color-accent-primary)] text-white shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}>
                    🟢 Open Requests ({openRequests.length})
                </button>
                <button onClick={() => setTab('mine')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${tab === 'mine'
                            ? 'bg-[var(--color-accent-primary)] text-white shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}>
                    👑 My Teams ({myRequests.length})
                </button>
            </div>

            {/* Team Cards */}
            {displayedRequests.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-[var(--color-text-secondary)] font-medium">
                        {tab === 'open' ? 'No open team requests yet' : 'You haven\'t created any teams'}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {tab === 'open' ? 'Be the first to create one!' : 'Create a team request to find teammates'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedRequests.map(team => (
                        <TeamRequestCard
                            key={team.id}
                            team={team}
                            currentUserId={profile?.id}
                            onJoin={handleJoin}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <CreateTeamModal
                    userId={profile?.id}
                    onClose={() => setShowModal(false)}
                    onCreated={handleCreated}
                />
            )}
        </div>
    );
}
