import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeLandmarks,
  calculateMajorityVote,
  StepRecognitionEngine,
  WHO_STEPS_INFO
} from '../shared/services/stepModelService.js';

describe("Jobiya's Module — Hand Landmark & WHO Step Recognition", () => {
  describe('normalizeLandmarks()', () => {
    it('handles empty or incomplete landmark arrays gracefully', () => {
      const result = normalizeLandmarks([]);
      expect(result).toHaveLength(63);
      expect(result.every(val => val === 0)).toBe(true);
    });

    it('translates wrist (landmark 0) to origin (0,0,0)', () => {
      // 21 points * 3 = 63 floats
      const rawLandmarks = new Array(63).fill(0);
      // Set wrist at (10, 20, 30)
      rawLandmarks[0] = 10;
      rawLandmarks[1] = 20;
      rawLandmarks[2] = 30;

      // Set Middle finger MCP (landmark 9 -> indices 27, 28, 29) to (13, 24, 30) => distance = 5
      rawLandmarks[27] = 13;
      rawLandmarks[28] = 24;
      rawLandmarks[29] = 30;

      const normalized = normalizeLandmarks(rawLandmarks);
      expect(normalized[0]).toBe(0);
      expect(normalized[1]).toBe(0);
      expect(normalized[2]).toBe(0);
      expect(normalized[27]).toBeCloseTo(0.6, 5); // (13-10)/5
      expect(normalized[28]).toBeCloseTo(0.8, 5); // (24-20)/5
    });
  });

  describe('calculateMajorityVote()', () => {
    it('returns step 0 and 0 confidence for empty array', () => {
      const result = calculateMajorityVote([]);
      expect(result).toEqual({ majorityStep: 0, confidence: 0 });
    });

    it('correctly identifies majority step and calculates confidence', () => {
      const predictions = [1, 1, 1, 2, 1, 3, 1, 1, 2, 1]; // 7 out of 10 are step 1
      const result = calculateMajorityVote(predictions);
      expect(result.majorityStep).toBe(1);
      expect(result.confidence).toBe(0.7);
    });

    it('resolves ties deterministically', () => {
      const predictions = [2, 2, 3, 3];
      const result = calculateMajorityVote(predictions);
      expect([2, 3]).toContain(result.majorityStep);
      expect(result.confidence).toBe(0.5);
    });
  });

  describe('StepRecognitionEngine', () => {
    let engine;

    beforeEach(() => {
      engine = new StepRecognitionEngine({ useMock: true, confidenceThreshold: 0.6 });
    });

    it('initializes with default options and WHO step metadata', () => {
      expect(WHO_STEPS_INFO).toHaveLength(7);
      expect(engine.sequenceLength).toBe(30);
      expect(engine.currentStep).toBe(0);
    });

    it('manages frame buffer size without exceeding sequence length', () => {
      const rawLandmarks = new Array(63).fill(0.1);
      for (let i = 0; i < 50; i++) {
        engine.pushFrame(rawLandmarks);
      }
      expect(engine.frameBuffer.length).toBe(30);
    });

    it('progresses steps in mock prediction mode', () => {
      const pred1 = engine.predict();
      expect(pred1.bufferReady).toBe(true);
      expect(pred1.confidence).toBeGreaterThan(0.6);
      expect(pred1.smoothedStep).toBeGreaterThanOrEqual(1);
    });

    it('resets buffer and state correctly', () => {
      for (let i = 0; i < 25; i++) {
        engine.predict();
      }
      engine.reset();
      expect(engine.frameBuffer).toHaveLength(0);
      expect(engine.predictionHistory).toHaveLength(0);
      expect(engine.currentStep).toBe(0);
    });
  });
});
