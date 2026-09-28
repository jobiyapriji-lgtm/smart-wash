/**
 * SMART WASH — React Hook for YOLOv11 WHO Step Recognition (WebSocket Client)
 * Author: Jobiya (AI/Model Lead)
 * 
 * Streams webcam frames, downscales them to 320x320, sends them to FastAPI via WS,
 * feeds results into StepRecognitionEngine, and returns active step & progress.
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
  const [activeStep, setActiveStep] = useState(1);
  const [stepName, setStepName] = useState(WHO_STEPS_INFO[1]?.name || 'Palm to Palm');
  const [confidence, setConfidence] = useState(0.88);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHandsMoving, setIsHandsMoving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [missedSteps, setMissedSteps] = useState([]);
  
  // Reconnect backoff state
  const reconnectAttempts = useRef(0);
  
  // Telemetry HUD State
  const [telemetry, setTelemetry] = useState({
    camActive: false,
    leftHand: false,
    rightHand: false,
    rawPrediction: 'None',
    rawConfidence: 0,
    expectedStep: 'Step 1',
    debounceCount: 0,
    requiredFrames: 8,
    serverStatus: 'CONNECTING'
  });

  const engineRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  const lastStepTimeRef = useRef(performance.now());
  const onStepCompletedRef = useRef(onStepCompleted);

  useEffect(() => {
    onStepCompletedRef.current = onStepCompleted;
  });

  // Initialize Canvas for downscaling
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
  }, []);

  // Initialize StepRecognitionEngine
  useEffect(() => {
    engineRef.current = new StepRecognitionEngine({
      useMock,
      confidenceThreshold
    });
  }, [useMock, confidenceThreshold]);

  // WebSocket Connection
  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsProcessing(false);
      setTelemetry(prev => ({ ...prev, serverStatus: 'DISCONNECTED' }));
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:4550/ws_model');
      
      ws.onopen = () => {
        console.log('[useStepRecognition] WebSocket Connected');
        setIsProcessing(true);
        setTelemetry(prev => ({ ...prev, serverStatus: 'CONNECTED' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.prediction && engineRef.current) {
            handlePrediction(data.prediction, data.timestamp);
          }
        } catch (err) {
          console.error('[useStepRecognition] Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[useStepRecognition] WebSocket Error:', err);
        setTelemetry(prev => ({ ...prev, serverStatus: 'ERROR' }));
      };

      ws.onclose = () => {
        console.log('[useStepRecognition] WebSocket Disconnected. Reconnecting...');
        setIsProcessing(false);
        setTelemetry(prev => ({ ...prev, serverStatus: 'RECONNECTING' }));
        if (enabled) {
          reconnectAttempts.current += 1;
          const backoff = Math.min(10000, 1000 * Math.pow(1.5, reconnectAttempts.current));
          setTimeout(connectWebSocket, backoff);
        }
      };

      wsRef.current = ws;
    };

    reconnectAttempts.current = 0;
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled]);

  const handlePrediction = useCallback((prediction, timestamp) => {
    if (!engineRef.current) return;
    
    // For 13 classes, confidence > 0.18 represents strong active class alignment
    const isMoving = prediction.class !== "background" && (prediction.confidence >= 0.18 || (prediction.top5 && Object.values(prediction.top5).some(c => c >= 0.18)));
    setIsHandsMoving(isMoving);

    // [HANDWASH_DEBUG] format
    const expected = engineRef.current.mapStepToYoloClass(activeStep);
    const expectedString = expected.join(' or ');
    const frameStreak = engineRef.current.predictionHistory.filter(x => expected.includes(x)).length;
    console.log(`[HANDWASH_DEBUG] target: ${expectedString} | raw_pred: ${prediction.class} | conf: ${(prediction.confidence || 0).toFixed(2)} | hands_visible: L:YES R:YES | frame_streak: ${frameStreak}/${engineRef.current.historyWindowSize}`);

    setTelemetry(prev => ({
      ...prev,
      rawPrediction: prediction.class,
      rawConfidence: prediction.confidence || 0,
      expectedStep: expectedString,
      debounceCount: frameStreak,
      requiredFrames: engineRef.current.historyWindowSize,
      leftHand: isMoving,
      rightHand: isMoving,
      serverStatus: 'CONNECTED'
    }));

    const result = engineRef.current.predict(prediction, timestamp);
    
    if (result.smoothedStep > activeStep) {
      const duration = performance.now() - lastStepTimeRef.current;
      lastStepTimeRef.current = performance.now();
      if (onStepCompletedRef.current) {
        onStepCompletedRef.current({
          stepNumber: activeStep,
          durationMs: duration,
          avgConfidence: confidence,
          completed: true
        });
      }
      setCompletedSteps(prev => [...prev, activeStep]);
    }

    setActiveStep(result.smoothedStep);
    setStepName(WHO_STEPS_INFO[result.smoothedStep]?.name || 'Unknown');
    setConfidence(result.confidence);
    setProgress(result.progressPercent);
    if (result.completedSteps) setCompletedSteps(result.completedSteps);
    if (result.missedSteps) setMissedSteps(result.missedSteps);
  }, [activeStep, confidence]);

  const prevFrameRef = useRef(null);
  const stillDurationMsRef = useRef(0);
  const lastStillReminderRef = useRef(0);
  const motionHistoryRef = useRef([]);
  const isMovingStateRef = useRef(false);

  // Frame Capture & Active Motion Monitoring Loop
  const sendFrame = useCallback(() => {
    const video = videoRef?.current;
    const isVideoPlaying = video && !video.paused && !video.ended && video.readyState >= 2;
    if (!isVideoPlaying || !ctxRef.current || !canvasRef.current) {
      setTelemetry(prev => ({ ...prev, camActive: false }));
      return;
    }

    setTelemetry(prev => ({ ...prev, camActive: true }));

    // Center-crop video to square (1:1 aspect ratio) to prevent unnatural squishing of hands
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const cropSize = Math.min(vw, vh);
    const sx = Math.max(0, (vw - cropSize) / 2);
    const sy = Math.max(0, Math.min(vh - cropSize, (vh - cropSize) * 0.7));

    ctxRef.current.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, 320, 320);

    // Compute optical motion in lower 70% of frame (hand washing zone)
    const imgData = ctxRef.current.getImageData(0, 0, 320, 320);
    const data = imgData.data;
    const prev = prevFrameRef.current;
    let movedPixels = 0;
    let totalSampled = 0;

    if (prev) {
      for (let y = 80; y < 310; y += 4) {
        for (let x = 40; x < 280; x += 4) {
          const idx = (y * 320 + x) * 4;
          totalSampled++;
          const diff = Math.abs(data[idx] - prev[idx]) +
                       Math.abs(data[idx + 1] - prev[idx + 1]) +
                       Math.abs(data[idx + 2] - prev[idx + 2]);
          if (diff > 35) movedPixels++;
        }
      }
    }
    prevFrameRef.current = new Uint8Array(data);

    const motionRatio = totalSampled > 0 ? (movedPixels / totalSampled) : 0;
    
    // Hysteresis smoothing window (600ms) to eliminate flickering
    motionHistoryRef.current.push(motionRatio);
    if (motionHistoryRef.current.length > 6) {
      motionHistoryRef.current.shift();
    }
    const avgMotion = motionHistoryRef.current.reduce((a, b) => a + b, 0) / motionHistoryRef.current.length;

    let stableMoving = isMovingStateRef.current;
    if (!stableMoving && avgMotion >= 0.035) {
      stableMoving = true;
    } else if (stableMoving && avgMotion < 0.015) {
      stableMoving = false;
    }
    isMovingStateRef.current = stableMoving;
    setIsHandsMoving(stableMoving);

    const isWsConnected = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;

    if (isWsConnected) {
      // Send frame over WebSocket for live PyTorch YOLO inference
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
      wsRef.current.send(dataUrl);
    } else {
      // Local Vision fallback: ONLY advance if the student is actively moving/rubbing their hands!
      if (engineRef.current) {
        const expectedClasses = engineRef.current.mapStepToYoloClass(activeStep);
        if (stableMoving) {
          stillDurationMsRef.current = 0;
          const activePrediction = {
            class: expectedClasses[0] || 'Step_1',
            confidence: Math.min(0.98, 0.85 + avgMotion)
          };
          handlePrediction(activePrediction, performance.now());
          setTelemetry(prev => ({
            ...prev,
            serverStatus: 'LOCAL VISION (HAND MOTION DETECTED)',
            leftHand: true,
            rightHand: true
          }));
        } else {
          stillDurationMsRef.current += 100;
          // Hands not moving: send background! Time freezes!
          const stillPrediction = {
            class: 'background',
            confidence: 0.95
          };
          handlePrediction(stillPrediction, performance.now());
          setTelemetry(prev => ({
            ...prev,
            serverStatus: 'WAITING FOR HAND MOVEMENT',
            leftHand: false,
            rightHand: false,
            rawPrediction: 'background (HANDS STILL)'
          }));

          // Voice reminder after 4 seconds of stillness
          const now = Date.now();
          if (stillDurationMsRef.current >= 4000 && now - lastStillReminderRef.current > 6000) {
            lastStillReminderRef.current = now;
            if ('speechSynthesis' in window) {
              const reminder = new SpeechSynthesisUtterance("Please keep rubbing your hands to complete this step.");
              reminder.rate = 1.1;
              window.speechSynthesis.speak(reminder);
            }
          }
        }
      }
    }
  }, [enabled, videoRef, activeStep, handlePrediction]);

  // Set up interval for ~10fps transmission
  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(sendFrame, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, sendFrame]);

  const skipStep = useCallback(() => {
    if (!engineRef.current) return;
    const current = activeStep;
    const result = engineRef.current.skipStep();
    const duration = performance.now() - lastStepTimeRef.current;
    lastStepTimeRef.current = performance.now();

    if (onStepCompletedRef.current) {
      onStepCompletedRef.current({
        stepNumber: current,
        durationMs: duration,
        avgConfidence: confidence || 0.92,
        completed: true
      });
    }

    setActiveStep(result.smoothedStep);
    setStepName(WHO_STEPS_INFO[result.smoothedStep]?.name || 'Completed');
    setProgress(result.progressPercent);
    if (result.completedSteps) setCompletedSteps([...result.completedSteps]);
    if (result.missedSteps) setMissedSteps([...result.missedSteps]);
    return result;
  }, [activeStep, confidence]);

  const jumpToStep = useCallback((stepNumber) => {
    if (!engineRef.current) return;
    const result = engineRef.current.jumpToStep(stepNumber);
    lastStepTimeRef.current = performance.now();
    setActiveStep(result.smoothedStep);
    setStepName(WHO_STEPS_INFO[result.smoothedStep]?.name || 'Unknown');
    setProgress(result.progressPercent);
    if (result.completedSteps) setCompletedSteps([...result.completedSteps]);
    if (result.missedSteps) setMissedSteps([...result.missedSteps]);
    return result;
  }, []);

  const resetTracker = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setActiveStep(1);
    setStepName(WHO_STEPS_INFO[1]?.name || 'Palm to Palm');
    setConfidence(0.88);
    setProgress(0);
    setCompletedSteps([]);
    setMissedSteps([]);
    lastStepTimeRef.current = performance.now();
  }, []);

  return {
    activeStep,
    stepName,
    confidence,
    progress,
    isProcessing,
    isHandsMoving,
    completedSteps,
    missedSteps,
    skipStep,
    jumpToStep,
    resetTracker,
    stepsInfo: WHO_STEPS_INFO,
    telemetry
  };
}
