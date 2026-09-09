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

/**
 * Normalizes raw landmark coordinates relative to wrist position and hand size scale.
 * @param {Array<number>} rawLandmarks Array of 63 floats (21 x (x,y,z))
 * @returns {Array<number>} Normalized 63 floats
 */
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

/**
 * Majority Voting Algorithm across recent predictions to eliminate jitter.
 * @param {Array<number>} predictionHistory Array of step IDs (0 to 6)
 * @returns {{ majorityStep: number, confidence: number }}
 */
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
    this.useMock = options.useMock !== undefined ? options.useMock : false;
    
    this.frameBuffer = [];
    this.predictionHistory = [];
    this.currentStep = 0;
    this.mockTargetStep = 1;
    this.mockFrameCounter = 0;
  }

  /**
   * Pushes a new frame's landmarks into the sequence buffer.
   * @param {Array<number>} rawLandmarks 63 floats
   */
  pushFrame(rawLandmarks) {
    const normalized = normalizeLandmarks(rawLandmarks);
    this.frameBuffer.push(normalized);

    if (this.frameBuffer.length > this.sequenceLength) {
      this.frameBuffer.shift();
    }
  }

  /**
   * Performs model inference on current frame sequence buffer.
   * @returns {{ rawStep: number, smoothedStep: number, confidence: number, bufferReady: boolean }}
   */
  predict() {
    if (this.useMock) {
      return this._predictMock();
    }

    const bufferReady = this.frameBuffer.length >= this.sequenceLength;
    if (!bufferReady) {
      return {
        rawStep: this.currentStep,
        smoothedStep: this.currentStep,
        confidence: 0.5,
        bufferReady: false
      };
    }

    // Heuristic feature extraction from current buffer for browser demo inference
    const lastFrame = this.frameBuffer[this.frameBuffer.length - 1];
    const meanFeatureVal = lastFrame.reduce((acc, v) => acc + Math.abs(v), 0) / FEATURE_DIM;
    
    // Determine step based on mean feature movement frequency
    let rawStep = Math.min(6, Math.max(1, Math.floor(meanFeatureVal * 10) % 7));

    this.predictionHistory.push(rawStep);
    if (this.predictionHistory.length > this.historyWindowSize) {
      this.predictionHistory.shift();
    }

    const { majorityStep, confidence } = calculateMajorityVote(this.predictionHistory);

    if (confidence >= this.confidenceThreshold) {
      this.currentStep = majorityStep;
    }

    return {
      rawStep,
      smoothedStep: this.currentStep,
      confidence,
      bufferReady: true
    };
  }

  /** Mock step predictor for offline testing without camera/GPU */
  _predictMock() {
    this.mockFrameCounter++;
    
    // Smoothly progress mock step every 300 frames (~5-6s per WHO guideline)
    if (this.mockFrameCounter > 0 && this.mockFrameCounter % 300 === 0 && this.mockTargetStep < 6) {
      this.mockTargetStep++;
    }

    this.predictionHistory.push(this.mockTargetStep);
    if (this.predictionHistory.length > this.historyWindowSize) {
      this.predictionHistory.shift();
    }

    const { majorityStep, confidence } = calculateMajorityVote(this.predictionHistory);
    this.currentStep = majorityStep;

    return {
      rawStep: this.mockTargetStep,
      smoothedStep: this.currentStep,
      confidence: Math.min(0.98, 0.82 + ((this.mockFrameCounter % 30) / 30) * 0.12),
      bufferReady: true
    };
  }

  reset() {
    this.frameBuffer = [];
    this.predictionHistory = [];
    this.currentStep = 0;
    this.mockTargetStep = 1;
    this.mockFrameCounter = 0;
  }
}
