/**
 * SMART WASH — React Hook for MediaPipe & TF.js WHO Step Recognition
 * Author: Jobiya (AI/Model Lead)
 * 
 * Streams webcam frames, extracts 21 3D hand landmarks via MediaPipe Vision,
 * feeds sequences into StepRecognitionEngine, and returns active step & progress.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { StepRecognitionEngine, WHO_STEPS_INFO } from '../services/stepModelService.js';

export function useStepRecognition({
  videoRef,
  enabled = true,
  useMock = false,
  confidenceThreshold = 0.65,
  onStepCompleted = null
} = {}) {
  const [activeStep, setActiveStep] = useState(1);
  const [stepName, setStepName] = useState(WHO_STEPS_INFO[1]?.name || 'Palm to Palm');
  const [confidence, setConfidence] = useState(0.88);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHandsMoving, setIsHandsMoving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const engineRef = useRef(null);
  const animFrameRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const isHandsMovingRef = useRef(false);
  const lastLandmarksRef = useRef(null);

  const onStepCompletedRef = useRef(onStepCompleted);

  useEffect(() => {
    onStepCompletedRef.current = onStepCompleted;
  });

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let active = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        if (active) {
          handLandmarkerRef.current = landmarker;
        }
      } catch (err) {
        console.error("[useStepRecognition] Error initializing MediaPipe:", err);
      }
    };
    initMediaPipe();

    return () => {
      active = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

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

  // MediaPipe analysis loop
  const processFrame = useCallback(() => {
    if (!enabled || !engineRef.current || !handLandmarkerRef.current) return;

    try {
      const video = videoRef?.current;
      if (video && !video.paused && !video.ended && video.readyState >= 2) {
        // Only run detection if the video frame has advanced
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          
          const startTimeMs = performance.now();
          const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
          
          let isMoving = false;
          if (results.landmarks && results.landmarks.length > 0) {
            // Get the first hand detected
            const hand = results.landmarks[0];
            
            // Format into 63-element array
            const flatLandmarks = new Array(63);
            for (let i = 0; i < 21; i++) {
              flatLandmarks[i * 3] = hand[i].x;
              flatLandmarks[i * 3 + 1] = hand[i].y;
              flatLandmarks[i * 3 + 2] = hand[i].z;
            }
            
            engineRef.current.pushFrame(flatLandmarks);

            // Check if hands are actually moving to avoid advancing when hands are just held still
            if (lastLandmarksRef.current) {
              let diffSum = 0;
              // Check movement of Wrist (0), Index Tip (8), and Middle Tip (12)
              const pointsToCheck = [0, 8, 12];
              for (const pt of pointsToCheck) {
                const idx = pt * 3;
                diffSum += Math.abs(flatLandmarks[idx] - lastLandmarksRef.current[idx]) + 
                           Math.abs(flatLandmarks[idx+1] - lastLandmarksRef.current[idx+1]);
              }
              
              // diffSum is the total movement across those 3 points (x and y).
              // Natural camera jitter is around ~0.01. Intentional washing is > 0.04.
              if (diffSum > 0.03) {
                isMoving = true;
              }
            } else {
              isMoving = true; // First frame detected is considered moving
            }

            lastLandmarksRef.current = flatLandmarks;
          } else {
            lastLandmarksRef.current = null;
          }

          if (isMoving !== isHandsMovingRef.current) {
             isHandsMovingRef.current = isMoving;
             setIsHandsMoving(isMoving);
          }
        }
      }

      const result = engineRef.current.predict(isHandsMovingRef.current);
      setActiveStep(result.smoothedStep);
      setStepName(WHO_STEPS_INFO[result.smoothedStep]?.name || 'Unknown');
      
      const currentConf = isHandsMovingRef.current ? Math.max(0.85, result.confidence) : 0.45;
      setConfidence(currentConf);
      setProgress(result.progressPercent);
    } catch (err) {
      console.warn('[useStepRecognition] Video analysis frame error:', err.message);
    }

    if (enabled) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [enabled, videoRef]);

  useEffect(() => {
    if (enabled) {
      setIsProcessing(true);
      animFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setIsProcessing(false);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, processFrame]);

  const resetTracker = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setActiveStep(1);
    setStepName(WHO_STEPS_INFO[1]?.name || 'Palm to Palm');
    setConfidence(0.88);
    setProgress(0);
    setCompletedSteps([]);
    lastVideoTimeRef.current = -1;
    lastLandmarksRef.current = null;
  }, []);

  return {
    activeStep,
    stepName,
    confidence,
    progress,
    isProcessing,
    isHandsMoving,
    completedSteps,
    resetTracker,
    stepsInfo: WHO_STEPS_INFO
  };
}
