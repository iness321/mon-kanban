// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [boardId, setBoardId] = useState(null);
  const [stats, setStats] = useState({ todo: 0, in_progress: 0, review: 0, done: 0 });

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function fetchStats(bid) {
    const { data } = await supabase
      .from('tasks')
      .select('status')
      .eq('board_id', bid);
    if (data) {
      const s = { todo: 0, in_progress: 0, review: 0, done: 0 };
      data.forEach(t => { if (s[t.status] !== undefined) s[t.status]++; });
      setStats(s);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    supabase.from('boards').select('id').limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setBoardId(data[0].id);
          fetchStats(data[0].id);
        }
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main style={{ padding: '2rem' }}>

        {/* Compteurs par statut */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', marginBottom: '2rem' }}>
          {[
            { key: 'todo',        label: '📋 À faire',    color: '#64748B', bg: '#F1F5F9' },
            { key: 'in_progress', label: '⚙ En cours',    color: '#3B82F6', bg: '#EFF6FF' },
            { key: 'review',      label: '👀 Validation',  color: '#F59E0B', bg: '#FFFBEB' },
            { key: 'done',        label: '✅ Terminée',    color: '#16A34A', bg: '#F0FDF4' },
          ].map(s => (
            <div key={s.key} style={{ background: s.bg, borderRadius: '10px',
              padding: '1rem', textAlign: 'center', border: `2px solid ${s.color}22` }}>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: s.color }}>
                {stats[s.key]}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: s.color }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[['tasks', '📋 Tâches'], ['users', '👥 Utilisateurs']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: tab === key ? '#1A8C82' : '#E2E8F0',
              color: tab === key ? 'white' : '#1E293B',
              fontWeight: tab === key ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>

        {tab === 'tasks' && boardId && <TaskList boardId={boardId} />}
        {tab === 'tasks' && !boardId && (
          <p style={{ color: '#94A3B8' }}>Aucun tableau trouvé.</p>
        )}
        {tab === 'users' && (
          loading ? <p>Chargement...</p> : <UserTable users={users} onRefresh={fetchUsers} />
        )}
      </main>
    </div>
  );
}