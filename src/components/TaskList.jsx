// src/components/TaskList.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const COLUMNS = [
  { key: 'todo',        label: '📋 À faire',    color: '#64748B' },
  { key: 'in_progress', label: '⚙ En cours',    color: '#3B82F6' },
  { key: 'review',      label: '👀 Validation',  color: '#F59E0B' },
  { key: 'done',        label: '✅ Terminée',    color: '#16A34A' },
];

const PRIORITIES = ['all', 'high', 'medium', 'low'];
const PRIORITY_LABELS = { all: 'Toutes', high: '🔴 Haute', medium: '🟡 Moyenne', low: '🟢 Basse' };

export default function TaskList({ boardId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, categories(*)')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });
    if (!error) setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, [boardId]);

  async function handleDelete(taskId) {
    if (!confirm('Supprimer cette tâche ?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchTasks();
  }

  const filteredTasks = tasks.filter(t => {
    const byPriority = filterPriority === 'all' || t.priority === filterPriority;
    const byStatus = filterStatus === 'all' || t.status === filterStatus;
    return byPriority && byStatus;
  });

  if (loading) return <p>Chargement des tâches...</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#1A8C82', color: 'white', border: 'none',
          padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem'
        }}>
          {showForm ? '✕ Fermer' : '➕ Nouvelle tâche'}
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '0.8rem',
              background: filterPriority === p ? '#1A8C82' : '#E2E8F0',
              color: filterPriority === p ? 'white' : '#1E293B',
              fontWeight: filterPriority === p ? 700 : 400,
            }}>{PRIORITY_LABELS[p]}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', ...COLUMNS.map(c => c.key)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '0.8rem',
              background: filterStatus === s ? '#1A8C82' : '#E2E8F0',
              color: filterStatus === s ? 'white' : '#1E293B',
              fontWeight: filterStatus === s ? 700 : 400,
            }}>{s === 'all' ? 'Tous statuts' : COLUMNS.find(c => c.key === s)?.label}</button>
          ))}
        </div>
      </div>

      {showForm && (
        <TaskForm boardId={boardId} onCreated={() => { fetchTasks(); setShowForm(false); }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={{
              background: '#F1F5F9', borderRadius: '10px', padding: '1rem', minHeight: '300px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: col.color }}>{col.label}</h3>
                <span style={{ background: col.color, color: 'white',
                  borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
                  {colTasks.length}
                </span>
              </div>
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} onDelete={handleDelete} onRefresh={fetchTasks} />
              ))}
              {colTasks.length === 0 && (
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>
                  Aucune tâche
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}