// src/components/TaskComments.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskComments({ taskId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchComments() {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  useEffect(() => { fetchComments(); }, [taskId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    await supabase.from('task_comments').insert([{
      task_id: taskId,
      user_id: currentUser.id,
      content: newComment.trim(),
    }]);
    setNewComment('');
    fetchComments();
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from('task_comments').delete().eq('id', id);
    fetchComments();
  }

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
      <h4 style={{ margin: '0 0 0.75rem', color: '#1A8C82', fontSize: '0.9rem' }}>
        💬 Commentaires ({comments.length})
      </h4>

      {comments.map(c => (
        <div key={c.id} style={{ background: '#F8FAFC', borderRadius: '6px',
          padding: '0.5rem 0.75rem', marginBottom: '0.5rem',
          border: '1px solid #E2E8F0' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1E293B' }}>{c.content}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {new Date(c.created_at).toLocaleDateString('fr-FR')}
            </span>
            {c.user_id === currentUser.id && (
              <button onClick={() => handleDelete(c.id)}
                style={{ background: 'none', border: 'none', color: '#DC2626',
                  cursor: 'pointer', fontSize: '0.75rem' }}>
                Supprimer
              </button>
            )}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input value={newComment} onChange={e => setNewComment(e.target.value)}
          placeholder='Ajouter un commentaire...'
          style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #CBD5E1',
            borderRadius: '6px', fontSize: '0.85rem' }} />
        <button type='submit' disabled={loading}
          style={{ background: '#1A8C82', color: 'white', border: 'none',
            padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
            fontSize: '0.85rem' }}>
          {loading ? '...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}