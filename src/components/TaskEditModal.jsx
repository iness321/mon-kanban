// src/components/TaskEditModal.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskEditModal({ task, onClose, onUpdated }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(task.category_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est obligatoire.'); return; }
    setLoading(true);
    const { error } = await supabase.from('tasks').update({
      title: title.trim(),
      description: description.trim() || null,
      status, priority,
      category_id: categoryId || null,
      due_date: dueDate || null,
    }).eq('id', task.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    onUpdated();
    onClose();
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '12px',
        padding: '2rem', width: '500px', maxWidth: '90vw' }}>
        <h3 style={{ marginTop: 0, color: '#1A8C82' }}>✏️ Modifier la tâche</h3>
        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Titre</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={inputStyle} required />

          <label style={labelStyle}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={labelStyle}>Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option value='todo'>📋 À faire</option>
                <option value='in_progress'>⚙ En cours</option>
                <option value='review'>👀 Validation</option>
                <option value='done'>✅ Terminée</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priorité</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                <option value='low'>🟢 Basse</option>
                <option value='medium'>🟡 Moyenne</option>
                <option value='high'>🔴 Haute</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Catégorie</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value=''>— Aucune —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Échéance</label>
              <input type='date' value={dueDate}
                onChange={e => setDueDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type='submit' disabled={loading}
              style={{ background: '#1A8C82', color: 'white', border: 'none',
                padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', flex: 1 }}>
              {loading ? 'Enregistrement...' : '💾 Sauvegarder'}
            </button>
            <button type='button' onClick={onClose}
              style={{ background: '#E2E8F0', color: '#1E293B', border: 'none',
                padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1',
  borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem',
  fontWeight: 600, color: '#64748B' };