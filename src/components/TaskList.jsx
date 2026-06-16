// src/components/TaskList.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const COLUMNS = [
  { key: 'todo',        label: '📋 À faire',    color: '#64748B' },
  { key: 'in_progress', label: '⚙ En cours',    color: '#3B82F6' },
  { key: 'review',      label: '👀 Validation',  color: '#F59E0B' },
  { key: 'done',        label: '✅ Terminée',    color: '#16A34A' },
];

const PRIORITIES = ['all', 'high', 'medium', 'low'];
const PRIORITY_LABELS = { all: 'Toutes', high: '🔴 Haute', medium: '🟡 Moyenne', low: '🟢 Basse' };

// Colonne droppable
function DroppableColumn({ col, tasks, onDelete, onRefresh }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div ref={setNodeRef} style={{
      background: isOver ? '#E0F2FE' : '#F1F5F9',
      borderRadius: '10px', padding: '1rem', minHeight: '300px',
      transition: 'background 0.2s',
      border: isOver ? '2px dashed #3B82F6' : '2px solid transparent'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: col.color }}>{col.label}</h3>
        <span style={{ background: col.color, color: 'white',
          borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
          {tasks.length}
        </span>
      </div>
      {tasks.map(task => (
        <DraggableTask key={task.id} task={task} onDelete={onDelete} onRefresh={onRefresh} />
      ))}
      {tasks.length === 0 && (
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>
          Aucune tâche
        </p>
      )}
    </div>
  );
}

// Tâche draggable
function DraggableTask({ task, onDelete, onRefresh }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grabbing',
  } : { cursor: 'grab' };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onDelete={onDelete} onRefresh={onRefresh} />
    </div>
  );
}

export default function TaskList({ boardId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTask, setActiveTask] = useState(null);

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

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => { fetchTasks(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [boardId]);

  async function handleDelete(taskId) {
    if (!confirm('Supprimer cette tâche ?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchTasks();
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const taskId = active.id;
    const newStatus = over.id;
    if (!COLUMNS.find(c => c.key === newStatus)) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    // Mise à jour optimiste
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    // Mise à jour en BDD
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  }

  function handleDragStart(event) {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
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

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.key}
              col={col}
              tasks={filteredTasks.filter(t => t.status === col.key)}
              onDelete={handleDelete}
              onRefresh={fetchTasks}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onDelete={() => {}} onRefresh={() => {}} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}