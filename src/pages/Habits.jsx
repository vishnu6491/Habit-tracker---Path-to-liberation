import React, { useState } from 'react';
import { generateId } from '../utils/helpers';
import { DIFFICULTY_TYPES, FREQUENCY_TYPES, WEEK_DAYS } from '../data/constants';

const Habits = ({ state, actions }) => {
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    difficulty: 'Important', 
    xp: 10,
    frequency: 'daily',
    selectedDays: []
  });

  const handleXpChange = (val) => {
    const max = DIFFICULTY_TYPES[form.difficulty].max;
    let num = parseInt(val) || 0;
    if (num > max) num = max;
    if (num < 0) num = 0;
    setForm({...form, xp: num});
  };

  const toggleDay = (dayValue) => {
    const days = form.selectedDays.includes(dayValue)
      ? form.selectedDays.filter(d => d !== dayValue)
      : [...form.selectedDays, dayValue];
    setForm({...form, selectedDays: days});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.frequency !== 'daily' && form.selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }
    actions.addHabit(form);
    setForm({ name: '', description: '', difficulty: 'Important', xp: 10, frequency: 'daily', selectedDays: [] });
    setShowForm(false);
  };

  const filteredHabits = state.habits.filter(h => showArchived ? !h.active : h.active);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 className="gold-text" style={{fontSize: '20px'}}>Habits</h2>
        <button className="btn" style={{ width: 'auto', margin: 0 }} onClick={() => setShowForm(true)}>+ Add</button>
      </div>
      <button className="btn btn-outline" style={{ marginBottom: '12px', fontSize: '12px' }} onClick={() => setShowArchived(!showArchived)}>
        {showArchived ? 'Show Active' : 'Show Archived'}
      </button>

      {filteredHabits.map(habit => (
        <div key={habit.id} className="card" style={{padding: '12px'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{fontSize: '15px'}}>{habit.name}</h3>
            <span className="badge" style={{background: 'var(--theme-primary)', color: 'white'}}>{habit.difficulty}</span>
          </div>
          <p style={{ color: '#888', fontSize: '12px' }}>{habit.description}</p>
          <p style={{ fontSize: '11px', color: 'var(--theme-secondary)' }}>
            {habit.xp} XP • {FREQUENCY_TYPES[habit.frequency].name}
            {habit.frequency !== 'daily' && habit.selectedDays && ` • ${habit.selectedDays.map(d => WEEK_DAYS.find(w => w.value === d)?.label).join(', ')}`}
          </p>
          <p style={{ fontSize: '11px', color: '#888' }}>Streak: {habit.currentStreak} days 🔥</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1, fontSize: '12px' }} onClick={() => actions.toggleHabitArchive(habit.id)}>
              {habit.active ? 'Archive' : 'Restore'}
            </button>
            <button className="btn btn-danger" style={{ flex: 1, fontSize: '12px' }} onClick={() => actions.deleteHabit(habit.id)}>Delete</button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="gold-text" style={{fontSize: '18px'}}>New Habit</h3>
            <form onSubmit={handleSubmit}>
              <input className="input" placeholder="Habit Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <textarea className="textarea" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              
              <select className="select" value={form.difficulty} onChange={e => {
                const max = DIFFICULTY_TYPES[e.target.value].max;
                setForm({...form, difficulty: e.target.value, xp: max});
              }}>
                <option>Important</option>
                <option>Less Important</option>
              </select>
              
              <label style={{ fontSize: '12px', color: '#888' }}>XP Reward (Max: {DIFFICULTY_TYPES[form.difficulty].max})</label>
              <input type="number" className="input" value={form.xp} onChange={e => handleXpChange(e.target.value)} max={DIFFICULTY_TYPES[form.difficulty].max} min="0" />
              
              <label style={{ fontSize: '12px', color: '#888' }}>Frequency</label>
              <select className="select" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value, selectedDays: []})}>
                {Object.entries(FREQUENCY_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}              </select>

              {form.frequency !== 'daily' && form.frequency !== 'monthly' && (
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Select Days</label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {WEEK_DAYS.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        className={`btn ${form.selectedDays.includes(day.value) ? '' : 'btn-outline'}`}
                        style={{ flex: '1 0 30px', padding: '8px 4px', fontSize: '11px', minWidth: '35px' }}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
