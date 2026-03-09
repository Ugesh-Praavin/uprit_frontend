import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SimilarStudentCard from '../components/SimilarStudentCard';
import Spinner from '../components/Spinner';

/**
 * SkillGraphPage — discover students with similar skills.
 * Route: /network
 */
export default function SkillGraphPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const usersRes = await api.get('/api/users');
            const me = usersRes.data.find(u => u.email === user?.email);
            setProfile(me);
            if (me) {
                const res = await api.get(`/api/skills/similar/${me.id}?limit=20`);
                setStudents(res.data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">🔗 Skill Network</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        Students who share your skills
                    </p>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-[var(--color-text-secondary)] font-medium">No similar students found</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Add skills to your profile to discover peers with matching expertise
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(s => (
                        <SimilarStudentCard key={s.userId} student={s} />
                    ))}
                </div>
            )}
        </div>
    );
}
