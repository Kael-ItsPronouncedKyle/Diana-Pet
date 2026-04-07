import { useState } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E',
  primaryLight: '#E8F4F1',
  accent: '#E8907E',
  text: '#3D3535',
  textLight: '#8A7F7F',
  green: '#6BBF8A',
  greenBg: '#E6F7EC',
  card: '#FFFFFF',
}

const card = {
  background: C.card,
  borderRadius: 20,
  padding: '18px',
  boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
  marginBottom: 14,
}

function ProgressBar({ done, total }) {
  const percentage = total > 0 ? (done / total) * 100 : 0
  return (
    <div
      style={{
        width: '100%',
        height: 8,
        background: '#E8E8E8',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 10,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          background: C.green,
          transition: 'width 0.2s ease',
        }}
      />
    </div>
  )
}

function GoalTracker({ profile, onProfileUpdate, fromHome, onGoHome }) {
  const goals = profile?.goals || []
  const [expandedGoalId, setExpandedGoalId] = useState(null)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newStepText, setNewStepText] = useState('')
  const [tempSteps, setTempSteps] = useState([])

  const toggleStep = (goalId, stepId) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        return {
          ...goal,
          steps: goal.steps.map((step) =>
            step.id === stepId ? { ...step, done: !step.done } : step
          ),
        }
      }
      return goal
    })
    onProfileUpdate({ goals: updatedGoals })
  }

  const addGoal = () => {
    if (!newGoalTitle.trim() || tempSteps.length === 0) return

    const newGoal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      steps: tempSteps,
      createdAt: new Date().toISOString(),
    }

    onProfileUpdate({ goals: [...goals, newGoal] })
    setIsAddingGoal(false)
    setNewGoalTitle('')
    setTempSteps([])
    setNewStepText('')
  }

  const addStepToTemp = () => {
    if (!newStepText.trim()) return
    const newStep = {
      id: Date.now().toString(),
      text: newStepText.trim(),
      done: false,
    }
    setTempSteps([...tempSteps, newStep])
    setNewStepText('')
  }

  const removeGoal = (goalId) => {
    const updatedGoals = goals.filter((g) => g.id !== goalId)
    onProfileUpdate({ goals: updatedGoals })
  }

  if (goals.length === 0 && !isAddingGoal) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

        <div style={{ ...card, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>💚</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 6,
            }}
          >
            What are you working toward?
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.textLight,
              marginBottom: 14,
              lineHeight: 1.4,
            }}
          >
            Even small goals count. Breaking them into tiny steps makes them feel real.
          </div>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: C.primary,
            color: 'white',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          Add a goal
        </button>
      </div>
    )
  }

  if (isAddingGoal) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

        <div style={card}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
            }}
          >
            What's your goal?
          </div>
          <input
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Example: Exercise 3 times a week"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 14,
              border: '2px solid #F0E8E0',
              fontSize: 14,
              fontWeight: 600,
              background: 'white',
              color: C.text,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 16,
            }}
          />

          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
            }}
          >
            What are the steps?
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.textLight,
              marginBottom: 10,
            }}
          >
            Add one step at a time. Make them small and doable.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder="One step..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addStepToTemp()
                }
              }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 14,
                border: '2px solid #F0E8E0',
                fontSize: 14,
                fontWeight: 600,
                background: 'white',
                color: C.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={addStepToTemp}
              disabled={!newStepText.trim()}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: newStepText.trim() ? C.primary : '#E0E0E0',
                color: 'white',
                fontSize: 13,
                fontWeight: 800,
                cursor: newStepText.trim() ? 'pointer' : 'not-allowed',
                minHeight: 44,
                opacity: newStepText.trim() ? 1 : 0.6,
              }}
            >
              Add
            </button>
          </div>

          {tempSteps.length > 0 && (
            <div
              style={{
                background: C.primaryLight,
                padding: '12px 14px',
                borderRadius: 12,
                marginBottom: 14,
              }}
            >
              {tempSteps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span>✓</span>
                  {step.text}
                </div>
              ))}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textLight,
                  marginTop: 8,
                }}
              >
                {tempSteps.length} steps
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={addGoal}
              disabled={!newGoalTitle.trim() || tempSteps.length === 0}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background:
                  newGoalTitle.trim() && tempSteps.length > 0
                    ? C.primary
                    : '#E0E0E0',
                color: 'white',
                fontSize: 15,
                fontWeight: 800,
                cursor:
                  newGoalTitle.trim() && tempSteps.length > 0
                    ? 'pointer'
                    : 'not-allowed',
                minHeight: 44,
                opacity:
                  newGoalTitle.trim() && tempSteps.length > 0 ? 1 : 0.6,
              }}
            >
              Create goal
            </button>
            <button
              onClick={() => {
                setIsAddingGoal(false)
                setNewGoalTitle('')
                setTempSteps([])
                setNewStepText('')
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: '#F0E8E0',
                color: C.textLight,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

      {goals.map((goal) => {
        const doneSteps = goal.steps.filter((s) => s.done).length
        const isComplete = doneSteps === goal.steps.length && goal.steps.length > 0
        const isExpanded = expandedGoalId === goal.id

        return (
          <div key={goal.id} style={card}>
            <button
              onClick={() =>
                setExpandedGoalId(isExpanded ? null : goal.id)
              }
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: isComplete ? C.green : C.text,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {isComplete && '🎉 '}
                  {goal.title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.textLight,
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
              <ProgressBar done={doneSteps} total={goal.steps.length} />
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textLight,
                  marginTop: 6,
                }}
              >
                {doneSteps} of {goal.steps.length} done
              </div>
            </button>

            {isExpanded && (
              <div style={{ paddingTop: 12, borderTop: '1px solid #E8E8E8' }}>
                {isComplete && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: C.greenBg,
                      borderRadius: 12,
                      marginBottom: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.green,
                      textAlign: 'center',
                    }}
                  >
                    You did it! This goal is complete! 🎉
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {goal.steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => toggleStep(goal.id, step.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: `2px solid ${
                          step.done ? C.green : '#F0E8E0'
                        }`,
                        background: step.done ? C.greenBg : 'white',
                        color: step.done ? C.green : C.text,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minHeight: 44,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {step.done ? '✓' : '○'}
                      </span>
                      <span
                        style={{
                          textDecoration: step.done
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => removeGoal(goal.id)}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#F5E8E8',
                    color: '#8A7F7F',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  Remove goal
                </button>
              </div>
            )}
          </div>
        )
      })}

      {goals.length < 3 && (
        <button
          onClick={() => setIsAddingGoal(true)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: '2px solid ' + C.primary,
            background: 'transparent',
            color: C.primary,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          + Add a goal
        </button>
      )}
    </div>
  )
}

export default GoalTracker
