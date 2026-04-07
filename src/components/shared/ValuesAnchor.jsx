import { useState } from 'react';

export default function ValuesAnchor({ profile, onProfileUpdate, mode = 'display' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [letter, setLetter] = useState(profile?.valuesAnchor?.letter || '');
  const [goals, setGoals] = useState(profile?.valuesAnchor?.goals || ['', '', '']);

  const valuesAnchor = profile?.valuesAnchor || { letter: '', goals: ['', '', ''] };

  const handleSave = () => {
    onProfileUpdate({
      valuesAnchor: {
        letter: letter.trim(),
        goals: goals.map(g => g.trim()).filter(g => g),
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLetter(valuesAnchor.letter || '');
    setGoals(valuesAnchor.goals || ['', '', '']);
    setIsEditing(false);
  };

  const handleGoalChange = (idx, value) => {
    const updated = [...goals];
    updated[idx] = value;
    setGoals(updated);
  };

  // Display Mode
  if (mode === 'display') {
    return (
      <div style={{ padding: '18px', maxWidth: '430px', margin: '0 auto' }}>
        <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>
          A letter from me
        </h3>

        {valuesAnchor.letter ? (
          <div
            style={{
              background: 'var(--card)',
              border: '2px solid var(--primary)',
              borderRadius: 16,
              padding: '16px',
              marginBottom: '16px',
              lineHeight: 1.6,
              color: 'var(--text)',
              fontSize: '14px',
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            "{valuesAnchor.letter}"
          </div>
        ) : (
          <div
            style={{
              background: 'var(--primary-light)',
              borderRadius: 14,
              padding: '14px',
              marginBottom: '16px',
              color: 'var(--text)',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            You haven't written a letter to yourself yet. When you have a good day, write one.
            <br />
            Future-you will need it. 💚
          </div>
        )}

        {valuesAnchor.goals && valuesAnchor.goals.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 600, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Three things I'm working toward
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {valuesAnchor.goals.map((goal, idx) => (
                goal && (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--accent-light)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: 'var(--text)',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>✓</span>
                    {goal}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Setup Mode
  return (
    <div style={{ padding: '18px', maxWidth: '430px', margin: '0 auto' }}>
      <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>
        Your Values
      </h3>

      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          Write a letter to yourself
        </label>
        <p
          style={{
            color: 'var(--text-light)',
            fontSize: '12px',
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}
        >
          On a hard day, what do you want future-you to know?
        </p>
        <textarea
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          placeholder="Write what your heart needs to hear..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid #E8E8E8',
            borderRadius: 12,
            fontFamily: 'Nunito, sans-serif',
            fontSize: '13px',
            color: 'var(--text)',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '10px',
          }}
        >
          Three things I'm working toward
        </label>
        {goals.map((goal, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Goal ${idx + 1}`}
            value={goal}
            onChange={(e) => handleGoalChange(idx, e.target.value)}
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #E8E8E8',
              borderRadius: 10,
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              color: 'var(--text)',
              marginBottom: idx < 2 ? '8px' : 0,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '13px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: '13px',
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid #E8E8E8',
            borderRadius: 12,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
