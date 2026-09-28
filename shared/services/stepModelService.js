/**
 * SMART WASH — WHO Handwashing Step Recognition Engine (YOLOv11 Integration)
 * Author: Jobiya (AI/Model Lead)
 * 
 * Manages sequence buffer of YOLO classifications, majority-voting,
 * temporal accumulation, and progression of WHO handwashing steps.
 */

export const WHO_STEPS_INFO = [
  { 
    id: 0, 
    name: "Wet Hands & Apply Soap", 
    instruction: "Wet hands with water and apply sufficient soap to cover all hand surfaces.",
    cue: "Wet & Soap",
    icon: "🧼",
    recommendedDurationMs: 5000 
  },
  { 
    id: 1, 
    name: "Palm to Palm", 
    instruction: "Rub your palms together firmly in circular motions.",
    cue: "Rub palms in circles",
    icon: "🤲",
    recommendedDurationMs: 6000 
  },
  { 
    id: 2, 
    name: "Right Palm over Left Dorsum & vice versa", 
    instruction: "Place right palm over back of left hand with fingers interlaced, rub well, then swap hands.",
    cue: "Rub backs of hands",
    icon: "🖐️",
    recommendedDurationMs: 6000 
  },
  { 
    id: 3, 
    name: "Palm to Palm with Fingers Interlaced", 
    instruction: "Interlace your fingers palm-to-palm and rub back and forth in between fingers.",
    cue: "Interlace fingers & rub",
    icon: "🤝",
    recommendedDurationMs: 6000 
  },
  { 
    id: 4, 
    name: "Backs of Fingers to Opposing Palms", 
    instruction: "Clasp backs of fingers against opposing palms with fingers interlocked and rub side-to-side.",
    cue: "Interlock backs of fingers",
    icon: "✊",
    recommendedDurationMs: 6000 
  },
  { 
    id: 5, 
    name: "Rotational Rubbing of Thumbs", 
    instruction: "Clasp your left thumb in your right palm and rub rotationally, then switch hands.",
    cue: "Rotate thumbs in palms",
    icon: "👍",
    recommendedDurationMs: 6000 
  },
  { 
    id: 6, 
    name: "Rotational Rubbing of Fingertips on Palms", 
    instruction: "Rub the fingertips of your right hand circularly in the left palm, then swap sides.",
    cue: "Rub fingertips in circles",
    icon: "💅",
    recommendedDurationMs: 6000 
  }
];

export function calculateMajorityVote(predictionHistory) {
  if (!predictionHistory || predictionHistory.length === 0) {
    return { majorityClass: "background", confidence: 0 };
  }

  const counts = {};
  for (const p of predictionHistory) {
    counts[p] = (counts[p] || 0) + 1;
  }

  let majorityClass = "background";
  let maxCount = 0;

  for (const [cls, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      majorityClass = cls;
    }
  }

  const confidence = maxCount / predictionHistory.length;
  return { majorityClass, confidence };
}

export class StepRecognitionEngine {
  constructor(options = {}) {
    this.historyWindowSize = options.historyWindowSize || 8;
    this.confidenceThreshold = options.confidenceThreshold !== undefined ? options.confidenceThreshold : 0.20;
    this.consecutiveFramesRequired = options.consecutiveFramesRequired || 12;
    this.stepTimeoutSeconds = options.stepTimeoutSeconds || 30;
    
    this.predictionHistory = [];
    this.currentStep = 1;
    this.completedSteps = [];
    this.missedSteps = [];
    this.activeTimeMs = 0;
    this.lastActiveTime = null;
    this.stepStartTime = performance.now();
  }

  mapStepToYoloClass(stepId) {
    // Return arrays of accepted granular YOLO classes per step
    if (stepId === 1) return ["Step_1"];
    if (stepId === 2) return ["Step_2_Left", "Step_2_Right"];
    if (stepId === 3) return ["Step_3"];
    if (stepId === 4) return ["Step_4_Left", "Step_4_Right", "Step_4"]; // Safely include base if exists
    if (stepId === 5) return ["Step_5_Left", "Step_5_Right"];
    if (stepId === 6) return ["Step_6_Left", "Step_6_Right", "Step_7_Left", "Step_7_Right"]; // Fallback for last steps
    return ["background"];
  }

  getYoloClassStep(yoloClass) {
    for (let i = 1; i <= 6; i++) {
      if (this.mapStepToYoloClass(i).includes(yoloClass)) return i;
    }
    return -1;
  }

  predict(prediction, timestamp) {
    const now = timestamp || performance.now();
    const expectedClasses = this.mapStepToYoloClass(this.currentStep);

    // Evaluate effective class, checking if the expected step is confirmed directly or via top5
    let effectiveClass = prediction.class || "background";
    let effectiveConfidence = prediction.confidence || 0;

    if (prediction.top5) {
      for (const exp of expectedClasses) {
        if (prediction.top5[exp] !== undefined && prediction.top5[exp] >= 0.16) {
          effectiveClass = exp;
          effectiveConfidence = prediction.top5[exp];
          break;
        }
      }
    }

    // Add to rolling history buffer
    if (effectiveConfidence >= this.confidenceThreshold) {
      this.predictionHistory.push(effectiveClass);
    } else {
      this.predictionHistory.push("background");
    }

    if (this.predictionHistory.length > this.historyWindowSize) {
      this.predictionHistory.shift();
    }

    const { majorityClass, confidence } = calculateMajorityVote(this.predictionHistory);
    
    // Check timeout
    if ((now - this.stepStartTime) > this.stepTimeoutSeconds * 1000 && this.currentStep <= 6) {
        this.missedSteps.push(this.currentStep);
        this.currentStep++;
        this.stepStartTime = now;
        this.activeTimeMs = 0;
        this.predictionHistory = new Array(this.historyWindowSize).fill(this.mapStepToYoloClass(this.currentStep)[0]);
        return this._getOutput(confidence);
    }
    
    // Sequence Violation Policy: check if step K+1 persists over required consecutive frames
    const detectedStep = this.getYoloClassStep(majorityClass);
    if (detectedStep > this.currentStep) {
        // High confidence streak for K+1
        const streak = this.predictionHistory.filter(c => this.getYoloClassStep(c) === detectedStep).length;
        if (streak >= this.consecutiveFramesRequired) {
            // Mark step K as MISSED, advance to K+1
            this.missedSteps.push(this.currentStep);
            this.currentStep = detectedStep;
            this.activeTimeMs = 0;
            this.stepStartTime = now;
            // Bypass majority lag
            this.predictionHistory = new Array(this.historyWindowSize).fill(this.mapStepToYoloClass(this.currentStep)[0]);
            return this._getOutput(confidence);
        }
    }

    // If the majority prediction matches our expected current step, accumulate time
    if (expectedClasses.includes(majorityClass) || (expectedClasses.includes(effectiveClass) && effectiveConfidence >= this.confidenceThreshold)) {
      if (this.lastActiveTime) {
        this.activeTimeMs += (now - this.lastActiveTime);
      }
      this.lastActiveTime = now;
    } else {
      this.lastActiveTime = null;
    }

    const targetMs = WHO_STEPS_INFO[this.currentStep]?.recommendedDurationMs || 6000;
    
    // Progress to next step if duration reached
    if (this.activeTimeMs >= targetMs && this.currentStep <= 6) {
      this.completedSteps.push(this.currentStep);
      this.activeTimeMs = 0;
      this.currentStep++;
      this.stepStartTime = now;
      if (this.currentStep <= 6) {
          // Bypass majority lag immediately (fill with first accepted variant)
          this.predictionHistory = new Array(this.historyWindowSize).fill(this.mapStepToYoloClass(this.currentStep)[0]);
      }
    }

    return this._getOutput(confidence);
  }
  
  _getOutput(confidence = 0) {
      const targetMs = WHO_STEPS_INFO[this.currentStep]?.recommendedDurationMs || 6000;
      return {
          rawStep: this.currentStep,
          smoothedStep: this.currentStep > 6 ? 6 : this.currentStep,
          confidence: confidence,
          progressPercent: Math.min(100, Math.round((this.activeTimeMs / targetMs) * 100)),
          completedSteps: this.completedSteps,
          missedSteps: this.missedSteps
      };
  }

  skipStep() {
    if (this.currentStep <= 6) {
      if (!this.completedSteps.includes(this.currentStep)) {
        this.completedSteps.push(this.currentStep);
      }
      this.currentStep++;
      this.activeTimeMs = 0;
      this.lastActiveTime = null;
      this.stepStartTime = performance.now();
      if (this.currentStep <= 6) {
        this.predictionHistory = new Array(this.historyWindowSize).fill(this.mapStepToYoloClass(this.currentStep)[0]);
      }
    }
    return this._getOutput(0.95);
  }

  jumpToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 6) return this._getOutput();
    while (this.currentStep < stepNumber) {
      if (!this.completedSteps.includes(this.currentStep) && !this.missedSteps.includes(this.currentStep)) {
        this.missedSteps.push(this.currentStep);
      }
      this.currentStep++;
    }
    this.currentStep = stepNumber;
    this.activeTimeMs = 0;
    this.lastActiveTime = null;
    this.stepStartTime = performance.now();
    this.predictionHistory = new Array(this.historyWindowSize).fill(this.mapStepToYoloClass(this.currentStep)[0]);
    return this._getOutput(0.95);
  }

  reset() {
    this.predictionHistory = [];
    this.currentStep = 1;
    this.completedSteps = [];
    this.missedSteps = [];
    this.activeTimeMs = 0;
    this.lastActiveTime = null;
    this.stepStartTime = performance.now();
  }
}
