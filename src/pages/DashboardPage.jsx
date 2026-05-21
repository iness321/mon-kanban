import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Styles modernisés
  const containerStyle = {
    minHeight: '100vh',
    background: '#F1F5F9', // Gris très clair et doux pour le fond
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  };

  const headerStyle = {
    background: '#1A8C82',
    color: 'white',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const mainStyle = {
    padding: '2.5rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: '#FFFFFF',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '1.5rem'
  };

  const logoutBtnStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.025em' }}>
          KanbanRT <span style={{ fontWeight: '300', opacity: 0.9 }}>Dashboard</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.95rem', opacity: 0.95, fontWeight: '500' }}>{session.user.email}</span>
          <button 
            onClick={handleLogout} 
            style={logoutBtnStyle}
            onMouseOver={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#1A8C82'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.15)'; e.target.style.color = 'white'; }}
          >
            Déconnexion
          </button>
        </div>
      </header>
      
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Utilisateurs inscrits</h2>
          {loading ? (
            <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>Chargement des profils...</p>
          ) : (
            <UserTable users={users} onRefresh={fetchUsers} />
          )}
        </div>
      </main>
    </div>
  );
}