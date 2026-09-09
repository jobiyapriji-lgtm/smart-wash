import { describe, it, expect } from 'vitest';
import { calculateHandwashScore, calculateStreak } from '../shared/services/scoringService.js';

describe("Rahul's Module — Scoring Logic & Dashboard", () => {
  describe('calculateHandwashScore()', () => {
    it('returns 0 score for empty or null steps array', () => {
      const result = calculateHandwashScore([]);
      expect(result.totalScore).toBe(0);
      expect(result.grade).toBe('Needs Improvement');
    });

    it('calculates perfect 100 score for full 6-step completion at target duration', () => {
      const perfectSteps = Array.from({ length: 6 }, (_, i) => ({
        stepNumber: i + 1,
        durationMs: 6000,
        avgConfidence: 1.0,
        completed: true
      }));

      const result = calculateHandwashScore(perfectSteps);
      expect(result.totalScore).toBe(100);
      expect(result.completionScore).toBe(50);
      expect(result.durationScore).toBe(30);
      expect(result.confidenceScore).toBe(20);
      expect(result.grade).toBe('Excellent');
    });

    it('applies penalties for partial step completion and short durations', () => {
      const partialSteps = [
        { stepNumber: 1, durationMs: 6000, avgConfidence: 0.9, completed: true },
        { stepNumber: 2, durationMs: 3000, avgConfidence: 0.8, completed: true }, // half duration
        { stepNumber: 3, durationMs: 1000, avgConfidence: 0.7, completed: false } // incomplete
      ];

      const result = calculateHandwashScore(partialSteps);
      expect(result.totalScore).toBeLessThan(75);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('clamps final score strictly between 0 and 100', () => {
      const overachievingSteps = Array.from({ length: 6 }, (_, i) => ({
        stepNumber: i + 1,
        durationMs: 12000,
        avgConfidence: 1.5,
        completed: true
      }));

      const result = calculateHandwashScore(overachievingSteps);
      expect(result.totalScore).toBe(100);
    });
  });

  describe('calculateStreak()', () => {
    it('returns 0 streak for empty history', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('counts consecutive sessions with score >= 70 as streak', () => {
      const history = [
        { score: 95 },
        { score: 85 },
        { score: 72 },
        { score: 50 }, // broken streak
        { score: 90 }
      ];

      expect(calculateStreak(history)).toBe(3);
    });
  });
});
