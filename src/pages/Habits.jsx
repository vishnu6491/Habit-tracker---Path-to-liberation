import React, { useState } from 'react';
import { generateId } from '../utils/helpers';

const Habits = ({ state, actions }) => {
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'Health', difficulty: 'Medium', reminderTime: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    actions.addHabit(form);
    setForm({ name: '', description: '', category: 'Health', difficulty: 'Medium', reminderTime: '' });
    setShowForm(false);
  };

  const filteredHabits = state.habits.filter(h => showArchived ? !h.active : h.active);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="gold-text">Habits</h2>
        <button className="btn" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      <button className="btn btn-outline" style={{ marginBottom: '16px' }} onClick={() => setShowArchived(!showArchived)}>
        {showArchived ? 'Show Active' : 'Show Archived'}
      </button>

      {filteredHabits.map(habit => (
        <div key={habit.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>{habit.name}</h3>
            <span className="badge">{habit.difficulty}</span>
          </div>
          <p style={{ color: '#888', fontSize: '14px' }}>{habit.description}</p>
          <p style={{ fontSize: '12px' }}>Category: {habit.category} | Reminder: {habit.reminderTime || 'None'}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => actions.toggleHabitArchive(habit.id)}>
              {habit.active ? 'Archive' : 'Restore'}
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => actions.deleteHabit(habit.id)}>Delete</button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="gold-text">New Habit</h3>
            <form onSubmit={handleSubmit}>
              <input className="input" placeholder="Habit Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <textarea className="textarea" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <select className="select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Health</option><option>Mind</option><option>Learning</option><option>Spiritual</option><option>Other</option>
              </select>
              <select className="select" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
              <label style={{ fontSize: '14px', color: '#888' }}>Reminder Time</label>
              <input type="time" className="input" value={form.reminderTime} onChange={e => setForm({...form, reminderTime: e.target.value})} />
              <button type="submit" className="btn">Create Habit</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
