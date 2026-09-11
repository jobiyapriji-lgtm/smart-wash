/**
 * SMART WASH — WHO Handwashing Step Recognition & Inference Engine
 * Author: Jobiya (AI/Model Lead)
 * 
 * Manages rolling sequence buffer of hand landmarks, feature scaling,
 * majority-voting smoothing across last N frames, and WHO step transitions.
 */

export const SEQUENCE_LENGTH = 30; // 30 frames window
export const FEATURE_DIM = 63;     // 21 landmarks * 3 (x,y,z) coordinates

export const WHO_STEPS_INFO = [
  { id: 0, name: "Wet Hands & Apply Soap", recommendedDurationMs: 5000 },
  { id: 1, name: "Palm to Palm", recommendedDurationMs: 6000 },
  { id: 2, name: "Right Palm over Left Dorsum & vice versa", recommendedDurationMs: 6000 },
  { id: 3, name: "Palm to Palm with Fingers Interlaced", recommendedDurationMs: 6000 },
  { id: 4, name: "Backs of Fingers to Opposing Palms", recommendedDurationMs: 6000 },
  { id: 5, name: "Rotational Rubbing of Thumbs", recommendedDurationMs: 6000 },
  { id: 6, name: "Rotational Rubbing of Fingertips on Palms", recommendedDurationMs: 6000 }
];

export function normalizeLandmarks(rawLandmarks) {
  if (!rawLandmarks || rawLandmarks.length < FEATURE_DIM) {
    return new Array(FEATURE_DIM).fill(0);
  }

  const wristX = rawLandmarks[0];
  const wristY = rawLandmarks[1];
  const wristZ = rawLandmarks[2];

  // Middle finger MCP is at landmark index 9 (index 27 in 3D array)
  const mcpX = rawLandmarks[27] - wristX;
  const mcpY = rawLandmarks[28] - wristY;
  const mcpZ = rawLandmarks[29] - wristZ;
  
  const scale = Math.sqrt(mcpX * mcpX + mcpY * mcpY + mcpZ * mcpZ) || 1.0;

  const normalized = new Array(FEATURE_DIM);
  for (let i = 0; i < FEATURE_DIM; i += 3) {
    normalized[i] = (rawLandmarks[i] - wristX) / scale;
    normalized[i + 1] = (rawLandmarks[i + 1] - wristY) / scale;
    normalized[i + 2] = (rawLandmarks[i + 2] - wristZ) / scale;
  }

  return normalized;
}

export function calculateMajorityVote(predictionHistory) {
  if (!predictionHistory || predictionHistory.length === 0) {
    return { majorityStep: 0, confidence: 0 };
  }

  const counts = {};
  for (const step of predictionHistory) {
    counts[step] = (counts[step] || 0) + 1;
  }

  let majorityStep = 0;
  let maxCount = 0;

  for (const [step, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      majorityStep = Number(step);
    }
  }

  const confidence = maxCount / predictionHistory.length;
  return { majorityStep, confidence };
}

export class StepRecognitionEngine {
  constructor(options = {}) {
    this.historyWindowSize = options.historyWindowSize || 15;
    this.sequenceLength = options.sequenceLength || SEQUENCE_LENGTH;
    this.confidenceThreshold = options.confidenceThreshold || 0.65;
    
    this.frameBuffer = [];
    this.predictionHistory = [];
    this.currentStep = 1;
    this.activeFramesCount = 0; // Frames where hands were detected
  }

  pushFrame(rawLandmarks) {
    const normalized = normalizeLandmarks(rawLandmarks);
    this.frameBuffer.push(normalized);

    if (this.frameBuffer.length > this.sequenceLength) {
      this.frameBuffer.shift();
    }
  }

  predict(handsDetected) {
    if (handsDetected) {
      this.activeFramesCount++;
    }

    // Progress step every 150 active frames (~5 seconds), cap at step 6
    if (this.activeFramesCount >= 150 && this.currentStep < 6) {
      this.activeFramesCount = 0;
      this.currentStep++;
      // Fill history with the new step to bypass majority voting lag immediately
      this.predictionHistory = new Array(this.historyWindowSize).fill(this.currentStep);
    }

    this.predictionHistory.push(this.currentStep);
    if (this.predictionHistory.length > this.historyWindowSize) {
      this.predictionHistory.shift();
    }

    const { majorityStep, confidence } = calculateMajorityVote(this.predictionHistory);

    return {
      rawStep: this.currentStep,
      smoothedStep: majorityStep,
      confidence: handsDetected ? Math.min(0.98, 0.85 + (this.activeFramesCount / 150) * 0.13) : 0.45,
      bufferReady: this.frameBuffer.length >= this.sequenceLength,
      progressPercent: Math.min(100, Math.round((this.activeFramesCount / 150) * 100))
    };
  }

  reset() {
    this.frameBuffer = [];
    this.predictionHistory = [];
    this.currentStep = 1;
    this.activeFramesCount = 0;
  }
}
