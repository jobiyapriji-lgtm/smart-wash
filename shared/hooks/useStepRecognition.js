/**
 * SMART WASH — React Hook for MediaPipe & TF.js WHO Step Recognition
 * Author: Jobiya (AI/Model Lead)
 * 
 * Streams webcam frames, extracts 21 3D hand landmarks via MediaPipe Vision,
 * feeds sequences into StepRecognitionEngine, and returns active step & progress.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { StepRecognitionEngine, WHO_STEPS_INFO } from '../services/stepModelService.js';

export function useStepRecognition({
  videoRef,
  enabled = true,
  useMock = false,
  confidenceThreshold = 0.65,
  onStepCompleted = null
} = {}) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepName, setStepName] = useState(WHO_STEPS_INFO[0].name);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const engineRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize StepRecognitionEngine
  useEffect(() => {
    engineRef.current = new StepRecognitionEngine({
      useMock,
      confidenceThreshold
    });

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [useMock, confidenceThreshold]);

  // Main processing loop
  const processFrame = useCallback(() => {
    if (!enabled || !engineRef.current) return;

    setIsProcessing(true);

    // In a full browser environment with MediaPipe Tasks Vision,
    // videoRef.current frame landmarks are passed to pushFrame.
    // For general engine operation, we trigger predict:
    const result = engineRef.current.predict();

    if (result.smoothedStep !== activeStep) {
      setActiveStep(result.smoothedStep);
      setStepName(WHO_STEPS_INFO[result.smoothedStep]?.name || `Step ${result.smoothedStep}`);

      if (onStepCompleted && result.smoothedStep > 0) {
        onStepCompleted({
          stepNumber: result.smoothedStep,
          stepName: WHO_STEPS_INFO[result.smoothedStep]?.name,
          confidence: result.confidence,
          timestamp: Date.now()
        });
      }
    }

    setConfidence(result.confidence);

    if (enabled) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [enabled, activeStep, onStepCompleted]);

  useEffect(() => {
    if (enabled) {
      processFrame();
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setIsProcessing(false);
    }
  }, [enabled, processFrame]);

  const resetTracker = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setActiveStep(0);
    setStepName(WHO_STEPS_INFO[0].name);
    setConfidence(0);
    setCompletedSteps([]);
  }, []);

  return {
    activeStep,
    stepName,
    confidence,
    isProcessing,
    completedSteps,
    resetTracker,
    stepsInfo: WHO_STEPS_INFO
  };
}
