import { describe, it, expect } from 'vitest';
import { kioskReducer, INITIAL_KIOSK_STATE, KIOSK_STATES } from '../apps/student-app/src/kioskStateMachine.js';

describe("Joel's Module — Kiosk App State Machine", () => {
  it('starts in IDLE state', () => {
    expect(INITIAL_KIOSK_STATE.currentState).toBe(KIOSK_STATES.IDLE);
    expect(INITIAL_KIOSK_STATE.student).toBeNull();
  });

  it('transitions from IDLE to IDENTIFYING on START_IDENTIFICATION', () => {
    const nextState = kioskReducer(INITIAL_KIOSK_STATE, { type: 'START_IDENTIFICATION' });
    expect(nextState.currentState).toBe(KIOSK_STATES.IDENTIFYING);
    expect(nextState.startTime).toBeGreaterThan(0);
  });

  it('transitions from IDENTIFYING to WASHING on STUDENT_IDENTIFIED', () => {
    const startState = kioskReducer(INITIAL_KIOSK_STATE, { type: 'START_IDENTIFICATION' });
    const studentPayload = { studentId: 'STU_789', name: 'Joel Tech' };
    
    const nextState = kioskReducer(startState, {
      type: 'STUDENT_IDENTIFIED',
      payload: { student: studentPayload, sessionId: 'session_123' }
    });

    expect(nextState.currentState).toBe(KIOSK_STATES.WASHING);
    expect(nextState.student).toEqual(studentPayload);
    expect(nextState.sessionId).toBe('session_123');
  });

  it('records STEP_COMPLETED actions into completedSteps array', () => {
    let state = kioskReducer(INITIAL_KIOSK_STATE, { type: 'START_IDENTIFICATION' });
    state = kioskReducer(state, {
      type: 'STUDENT_IDENTIFIED',
      payload: { student: { studentId: 'STU_100', name: 'Test' } }
    });

    const step1 = { stepNumber: 1, durationMs: 6000, avgConfidence: 0.9, completed: true };
    state = kioskReducer(state, { type: 'STEP_COMPLETED', payload: step1 });

    expect(state.completedSteps).toHaveLength(1);
    expect(state.completedSteps[0]).toEqual(step1);
  });

  it('transitions to SCORING and FEEDBACK with final score', () => {
    let state = kioskReducer(INITIAL_KIOSK_STATE, { type: 'START_IDENTIFICATION' });
    state = kioskReducer(state, { type: 'START_SCORING' });
    expect(state.currentState).toBe(KIOSK_STATES.SCORING);

    state = kioskReducer(state, {
      type: 'SCORING_COMPLETE',
      payload: { score: 92, steps: [] }
    });

    expect(state.currentState).toBe(KIOSK_STATES.FEEDBACK);
    expect(state.finalScore).toBe(92);
  });

  it('resets state to IDLE on RESET_TO_IDLE', () => {
    let state = kioskReducer(INITIAL_KIOSK_STATE, { type: 'START_IDENTIFICATION' });
    state = kioskReducer(state, { type: 'RESET_TO_IDLE' });
    expect(state).toEqual(INITIAL_KIOSK_STATE);
  });
});
