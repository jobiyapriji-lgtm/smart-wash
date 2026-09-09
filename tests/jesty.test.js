import { describe, it, expect } from 'vitest';
import { createDefaultSession, validateSessionContract, WHO_STEPS } from '../shared/types.js';
import { calculateEuclideanDistance, matchFaceDescriptor, getAllStudents } from '../shared/services/studentService.js';
import { createSession, updateSession, getSession } from '../shared/services/sessionService.js';

describe("Jesty's Backend & Face ID Module", () => {
  
  describe("Shared Data Contract (types.js)", () => {
    it("should initialize default session with 6 WHO steps", () => {
      const session = createDefaultSession("STU_101", "Alex River");
      expect(session.studentId).toBe("STU_101");
      expect(session.studentName).toBe("Alex River");
      expect(session.steps.length).toBe(6);
      expect(session.score).toBe(0);
      expect(session.status).toBe('in-progress');
    });

    it("should validate valid session schema", () => {
      const session = createDefaultSession("STU_101", "Alex River");
      expect(validateSessionContract(session)).toBe(true);
    });

    it("should reject invalid session objects", () => {
      expect(validateSessionContract(null)).toBe(false);
      expect(validateSessionContract({ studentId: 123 })).toBe(false);
    });
  });

  describe("Face Descriptor Matching (studentService.js)", () => {
    it("should calculate exact 0 Euclidean distance for identical vectors", () => {
      const vec = [0.1, 0.5, 0.9, 0.2];
      const dist = calculateEuclideanDistance(vec, vec);
      expect(dist).toBe(0);
    });

    it("should calculate correct Euclidean distance for distinct vectors", () => {
      const vecA = [0, 0, 0];
      const vecB = [3, 4, 0];
      const dist = calculateEuclideanDistance(vecA, vecB);
      expect(dist).toBe(5);
    });

    it("should match input vector to enrolled student within threshold", async () => {
      const students = await getAllStudents();
      expect(students.length).toBeGreaterThan(0);

      const targetStudent = students[0];
      // Input descriptor matching student 0 exactly
      const inputVector = targetStudent.descriptor;

      const result = matchFaceDescriptor(inputVector, students, 0.6);
      expect(result.matchedStudent).not.toBeNull();
      expect(result.matchedStudent.studentId).toBe(targetStudent.studentId);
      expect(result.confidence).toBeGreaterThan(80);
    });

    it("should return null matchedStudent when distance exceeds threshold", async () => {
      const students = await getAllStudents();
      // Completely distinct vector
      const orthogonalVector = Array.from({ length: 128 }, () => 99.0);

      const result = matchFaceDescriptor(orthogonalVector, students, 0.6);
      expect(result.matchedStudent).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe("Firestore Session Service (sessionService.js)", () => {
    it("should create a session document conforming to contract", async () => {
      const { id, session } = await createSession("STU_999", "Test Student");
      expect(id).toBeDefined();
      expect(session.studentName).toBe("Test Student");
      
      const fetched = await getSession(id);
      expect(fetched).not.toBeNull();
      expect(fetched.studentId).toBe("STU_999");
    });

    it("should update session score and step results", async () => {
      const { id } = await createSession("STU_999", "Test Student");
      
      const updatedSteps = WHO_STEPS.map(s => ({
        stepNumber: s.stepNumber,
        completed: true,
        durationMs: 5000,
        avgConfidence: 0.95
      }));

      await updateSession(id, {
        score: 95,
        steps: updatedSteps,
        status: 'completed'
      });

      const fetched = await getSession(id);
      expect(fetched.score).toBe(95);
      expect(fetched.status).toBe('completed');
      expect(fetched.steps[0].completed).toBe(true);
    });
  });

});
