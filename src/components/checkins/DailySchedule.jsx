import { useState } from 'react';

const DEFAULT_WEEKDAY = [
  { time: '7:00 AM', label: 'Wake up' },
  { time: '8:00 AM', label: 'Morning meds' },
  { time: '10:00 AM', label: 'Training time' },
  { time: '12:00 PM', label: 'Lunch' },
  { time: '2:00 PM', label: 'Free time' },
  { time: '6:00 PM', label: 'Dinner' },
  { time: '8:00 PM', label: 'Evening meds' },
  { time: '10:00 PM', label: 'Bedtime' },
];

const DEFAULT_WEEKEND = [
  { time: '8:00 AM', label: 'Wake up' },
  { time: '9:00 AM', label: 'Morning meds' },
  { time: '10:00 AM', label: 'Dog time' },
  { time: '12:00 PM', label: 'Lunch' },
  { time: '2:00 PM', label: 'Rest time' },
  { time: '6:00 PM', label: 'Dinner' },
  { time: '8:00 PM', label: 'Evening meds' },
  { time: '10:30 PM', label: 'Bedtime' },
];

export default function DailySchedule({ profile, onProfileUpdate, fromHome, onGoHome }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSchedule, setTempSchedule] = useState(null);

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const luisShift = profile?.luisShift || { workDays: [4, 5, 6, 0] };
  const isLuisWorkDay = luisShift.workDays.includes(dayOfWeek);

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const currentSchedule = profile?.schedule || { weekday: DEFAULT_WEEKDAY, weekend: DEFAULT_WEEKEND };
  const todaySchedule = isWeekend ? (currentSchedule.weekend || DEFAULT_WEEKEND) : (currentSchedule.weekday || DEFAULT_WEEKDAY);

  // Find current/next time block
  const getCurrentBlock = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < todaySchedule.length; i++) {
      const block = todaySchedule[i];
      const blockTime = parseTime(block.time);
      const nextBlock = i + 1 < todaySchedule.length ? parseTime(todaySchedule[i + 1].time) : 1440;

      if (currentMinutes >= blockTime && currentMinutes < nextBlock) {
        return i;
      }
    }
    return 0;
  };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const currentBlockIndex = getCurrentBlock();

  const handleEdit = () => {
    setTempSchedule(JSON.parse(JSON.stringify(todaySchedule)));
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedSchedule = {
      ...currentSchedule,
      [isWeekend ? 'weekend' : 'weekday']: tempSchedule,
    };
    onProfileUpdate({ schedule: updatedSchedule });
    setIsEditing(false);
    setTempSchedule(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempSchedule(null);
  };

  const handleAddBlock = () => {
    setTempSchedule([...tempSchedule, { time: '12:00 PM', label: 'New time' }]);
  };

  const handleRemoveBlock = (idx) => {
    setTempSchedule(tempSchedule.filter((_, i) => i !== idx));
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newSchedule = [...tempSchedule];
    [newSchedule[idx], newSchedule[idx - 1]] = [newSchedule[idx - 1], newSchedule[idx]];
    setTempSchedule(newSchedule);
  };

  const handleMoveDown = (idx) => {
    if (idx === tempSchedule.length - 1) return;
    const newSchedule = [...tempSchedule];
    [newSchedule[idx], newSchedule[idx + 1]] = [newSchedule[idx + 1], newSchedule[idx]];
    setTempSchedule(newSchedule);
  };

  const handleChangeTime = (idx, newTime) => {
    const updated = [...tempSchedule];
    updated[idx].time = newTime;
    setTempSchedule(updated);
  };

  const handleChangeLabel = (idx, newLabel) => {
    const updated = [...tempSchedule];
    updated[idx].label = newLabel;
    setTempSchedule(updated);
  };

  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

  return (
    <div style={{ padding: '18px', maxWidth: '430px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>
          Your Day
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: 0 }}>
          {dayName}'s plan
        </p>
      </div>

      {/* Luis Work Day Banner */}
      {isLuisWorkDay && (
        <div
          style={{
            background: 'var(--blue-bg)',
            border: '1px solid var(--blue)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '14px',
            color: 'var(--text)',
            fontWeight: 500,
          }}
        >
          ✓ Luis is at work today
        </div>
      )}

      {/* Display Mode */}
      {!isEditing && (
        <>
          {todaySchedule.map((block, idx) => (
            <div
              key={idx}
              style={{
                background: idx === currentBlockIndex ? 'var(--primary-light)' : 'var(--card)',
                border: idx === currentBlockIndex ? '2px solid var(--primary)' : '1px solid #E8E8E8',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: idx === currentBlockIndex ? '0 2px 8px rgba(107,168,158,0.15)' : '0 1px 4px rgba(61,53,53,0.05)',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  minWidth: '70px',
                }}
              >
                {block.time}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--text)',
                  fontWeight: 500,
                  flex: 1,
                  marginLeft: '12px',
                }}
              >
                {block.label}
              </span>
              {idx === currentBlockIndex && (
                <span style={{ fontSize: '16px', marginLeft: '8px' }}>→</span>
              )}
            </div>
          ))}

          <button
            onClick={handleEdit}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '18px',
              minHeight: '44px',
            }}
          >
            Edit Schedule
          </button>

          {fromHome && (
            <button
              onClick={onGoHome}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--text-light)',
                border: 'none',
                borderRadius: 12,
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '12px',
              }}
            >
              Back
            </button>
          )}
        </>
      )}

      {/* Edit Mode */}
      {isEditing && tempSchedule && (
        <>
          <div style={{ marginBottom: '18px' }}>
            {tempSchedule.map((block, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  border: '1px solid #E8E8E8',
                  borderRadius: 14,
                  padding: '14px',
                  marginBottom: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="time"
                    value={block.time.replace(' AM', '').replace(' PM', '')}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':');
                      let hours = parseInt(h);
                      const minutes = parseInt(m);
                      const period = hours >= 12 ? 'PM' : 'AM';
                      if (hours > 12) hours -= 12;
                      if (hours === 0) hours = 12;
                      handleChangeTime(idx, `${hours}:${String(minutes).padStart(2, '0')} ${period}`);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: '1px solid #E8E8E8',
                      borderRadius: 8,
                      fontSize: '13px',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="What's happening?"
                  value={block.label}
                  onChange={(e) => handleChangeLabel(idx, e.target.value)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #E8E8E8',
                    borderRadius: 8,
                    fontSize: '13px',
                    fontFamily: 'Nunito, sans-serif',
                    color: 'var(--text)',
                  }}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: idx === 0 ? '#E8E8E8' : 'var(--primary-light)',
                      color: idx === 0 ? 'var(--text-light)' : 'var(--primary)',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '12px',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    ↑ Up
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === tempSchedule.length - 1}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: idx === tempSchedule.length - 1 ? '#E8E8E8' : 'var(--primary-light)',
                      color: idx === tempSchedule.length - 1 ? 'var(--text-light)' : 'var(--primary)',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '12px',
                      cursor: idx === tempSchedule.length - 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 5,
                    }}
                  >
                    ↓ Down
                  </button>
                  <button
                    onClick={() => handleRemoveBlock(idx)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'var(--red-bg)',
                      color: 'var(--red)',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddBlock}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: 'none',
              borderRadius: 12,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '12px',
              minHeight: '44px',
            }}
          >
            + Add Time Block
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: '14px',
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
                padding: '14px',
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid #E8E8E8',
                borderRadius: 12,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
