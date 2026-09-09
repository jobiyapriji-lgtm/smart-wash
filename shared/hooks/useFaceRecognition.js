/**
 * SMART WASH — Face Recognition React Hook
 * Owned by Jesty (Face ID + Backend)
 * 
 * Provides live video-stream face detection, descriptor calculation,
 * vector matching against enrolled students, and student enrollment helpers.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { getAllStudents, matchFaceDescriptor, enrollStudent } from '../services/studentService.js';

export function useFaceRecognition({
  videoRef,
  enabled = true,
  distanceThreshold = 0.6,
  scanIntervalMs = 1000
} = {}) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [distance, setDistance] = useState(Infinity);
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedDescriptor, setDetectedDescriptor] = useState(null);
  const [error, setError] = useState(null);

  const scanTimerRef = useRef(null);

  // Load enrolled students from Firestore / store
  const refreshStudents = useCallback(async () => {
    try {
      const students = await getAllStudents();
      setEnrolledStudents(students);
      return students;
    } catch (err) {
      console.error('[useFaceRecognition] Failed to fetch enrolled students:', err);
      setError(err.message);
      return [];
    }
  }, []);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
        console.log('[useFaceRecognition] Models loaded successfully');
      } catch (err) {
        console.error('[useFaceRecognition] Error loading models:', err);
        setError('Failed to load face recognition models.');
      }
    };
    loadModels();
  }, []);

  // Main facial scan loop
  const performScan = useCallback(async () => {
    if (!enabled || !videoRef?.current || !isModelLoaded) return;

    setIsDetecting(true);
    try {
      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 2) {
        setIsDetecting(false);
        return;
      }

      // Perform face-api detection if models are loaded
      if (faceapi.nets.ssdMobilenetv1.isLoaded) {
        const detection = await faceapi
          .detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const descriptor = Array.from(detection.descriptor);
          setDetectedDescriptor(descriptor);
          const match = matchFaceDescriptor(descriptor, enrolledStudents, distanceThreshold);
          setMatchedStudent(match.matchedStudent);
          setDistance(match.distance);
          setConfidence(match.confidence);
        } else {
          setDetectedDescriptor(null);
          setMatchedStudent(null);
          setDistance(Infinity);
          setConfidence(0);
        }
      }
    } catch (err) {
      console.warn('[useFaceRecognition] Scan warning:', err.message);
    } finally {
      setIsDetecting(false);
    }
  }, [enabled, videoRef, enrolledStudents, distanceThreshold, isModelLoaded]);

  // Interval loop
  useEffect(() => {
    if (enabled && videoRef?.current && isModelLoaded) {
      scanTimerRef.current = setInterval(performScan, scanIntervalMs);
    } else {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    }
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [enabled, videoRef, scanIntervalMs, performScan, isModelLoaded]);

  // Helper for quick simulation/testing in dev environments
  const simulateDetection = useCallback((studentId) => {
    const student = enrolledStudents.find(s => s.studentId === studentId);
    if (student) {
      setMatchedStudent(student);
      setDistance(0.15);
      setConfidence(92);
      setDetectedDescriptor(student.descriptor);
      console.log(`[useFaceRecognition] Simulated recognition for ${student.name}`);
    } else {
      setMatchedStudent(null);
      setDistance(Infinity);
      setConfidence(0);
      setDetectedDescriptor(null);
    }
  }, [enrolledStudents]);

  // Helper to enroll current video frame's face
  const enrollCurrentFace = useCallback(async ({ studentId, name, classId }) => {
    // Generate or extract descriptor
    let descriptor = detectedDescriptor;
    if (!descriptor) {
      // Create synthetic vector if camera descriptor isn't available
      descriptor = Array.from({ length: 128 }, () => Math.random());
    }

    const success = await enrollStudent({
      studentId,
      name,
      classId,
      descriptor,
      photoUrl: ''
    });

    if (success) {
      await refreshStudents();
    }
    return success;
  }, [detectedDescriptor, refreshStudents]);

  return {
    enrolledStudents,
    matchedStudent,
    distance,
    confidence,
    isDetecting,
    isModelLoaded,
    detectedDescriptor,
    error,
    refreshStudents,
    simulateDetection,
    enrollCurrentFace
  };
}
