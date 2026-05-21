import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UserTable({ users, onRefresh }) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .insert([{ email: newEmail, full_name: newName, role: 'member' }]);

    if (error) {
      setError(error.message);
    } else {
      setNewEmail('');
      setNewName('');
      onRefresh();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (!error) onRefresh();
  }

  const thStyle = { padding: '0.75rem 1rem', textAlign: 'left' };
  const tdStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid #E2E8F0' };
  const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', marginRight: '0.5rem' };
  const btnStyle = { padding: '0.5rem 1rem', background: '#1A8C82', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };

  return (
    <div>
      <form onSubmit={handleCreate} style={{ display: 'flex', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={inputStyle} />
        <input placeholder="Nom complet" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? '...' : '+ Ajouter'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1A8C82', color: 'white' }}>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>Rôle</th>
            <th style={thStyle}>Créé le</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.id} style={{ background: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>{u.full_name || '-'}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(u.id)} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '1rem' }}>Aucun utilisateur pour l'instant.</p>}
    </div>
  );
}