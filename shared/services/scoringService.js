/**
 * SMART WASH — WHO Handwashing Scoring Engine
 * Author: Rahul (Scoring & Dashboard Lead)
 * 
 * Calculates an explainable 0-100 handwashing compliance score based on:
 * 1. Step Completion Rate (50% weight)
 * 2. Duration Accuracy vs WHO Target 5s-6s per step (30% weight)
 * 3. ML Landmark Model Confidence (20% weight)
 */

export const TARGET_STEP_DURATION_MS = 6000; // 6 seconds per WHO step

/**
 * Computes handwash score for a session.
 * @param {Array<{stepNumber: number, durationMs: number, avgConfidence: number, completed: boolean}>} steps 
 * @returns {{ totalScore: number, completionScore: number, durationScore: number, confidenceScore: number, grade: string, feedbackMessage: string }}
 */
export function calculateHandwashScore(steps = []) {
  if (!steps || steps.length === 0) {
    return {
      totalScore: 0,
      completionScore: 0,
      durationScore: 0,
      confidenceScore: 0,
      grade: 'Needs Improvement',
      feedbackMessage: 'No handwashing steps recorded.'
    };
  }

  // 1. Completion Score (0 - 50 points)
  const completedCount = steps.filter(s => s.completed !== false).length;
  const completionRatio = Math.min(1.0, completedCount / 6);
  const completionScore = completionRatio * 50;

  // 2. Duration Score (0 - 30 points)
  let totalDurationCloseness = 0;
  steps.forEach(step => {
    const duration = step.durationMs || 0;
    // Ratio of actual duration vs target (capped at 1.0)
    const ratio = Math.min(1.0, duration / TARGET_STEP_DURATION_MS);
    totalDurationCloseness += ratio;
  });
  const avgDurationRatio = steps.length > 0 ? totalDurationCloseness / steps.length : 0;
  const durationScore = avgDurationRatio * 30;

  // 3. ML Confidence Score (0 - 20 points)
  const avgConfidence = steps.reduce((sum, s) => sum + (s.avgConfidence || 0.8), 0) / steps.length;
  const confidenceScore = Math.min(1.0, avgConfidence) * 20;

  // Total Score (0 - 100)
  const rawTotal = Math.round(completionScore + durationScore + confidenceScore);
  const totalScore = Math.min(100, Math.max(0, rawTotal));

  // Determine Grade & Feedback Message
  let grade = 'Needs Improvement';
  let feedbackMessage = 'Try to complete all 6 WHO steps for at least 5 seconds each!';

  if (totalScore >= 90) {
    grade = 'Excellent';
    feedbackMessage = 'Outstanding handwashing technique! Full WHO compliance achieved!';
  } else if (totalScore >= 75) {
    grade = 'Good';
    feedbackMessage = 'Great job! Keep practicing step duration for a perfect score.';
  } else if (totalScore >= 60) {
    grade = 'Satisfactory';
    feedbackMessage = 'Good effort! Make sure to cover all WHO steps thoroughly.';
  }

  return {
    totalScore,
    completionScore: Math.round(completionScore),
    durationScore: Math.round(durationScore),
    confidenceScore: Math.round(confidenceScore),
    grade,
    feedbackMessage
  };
}

/**
 * Calculates student streak based on past session scores.
 * @param {Array<{score: number}>} sessionHistory 
 * @returns {number} Streak count
 */
export function calculateStreak(sessionHistory = []) {
  if (!sessionHistory || sessionHistory.length === 0) return 0;
  
  let streak = 0;
  for (const session of sessionHistory) {
    if ((session.score || 0) >= 70) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
