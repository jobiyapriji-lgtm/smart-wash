/**
 * SMART WASH — Student & Face Descriptor Service
 * Owned by Jesty (Face ID + Backend)
 * 
 * Handles enrollment of students, storage of 128-d face descriptors,
 * and high-performance Euclidean distance vector matching.
 */

import { db, isMockFirebase } from '../firebaseConfig.js';
import { collection, doc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// Sample seed students with synthetic 128-d descriptors for testing/demonstration
const SEED_STUDENTS = [
  {
    studentId: 'STU_101',
    name: 'Alex River',
    classId: 'Grade 5-A',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    // Normalized synthetic 128-d face vector pattern A
    descriptor: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.5 + 0.5)
  },
  {
    studentId: 'STU_102',
    name: 'Jordan Taylor',
    classId: 'Grade 5-A',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    // Normalized synthetic 128-d face vector pattern B
    descriptor: Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.15) * 0.5 + 0.5)
  },
  {
    studentId: 'STU_103',
    name: 'Sam Chen',
    classId: 'Grade 5-B',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    // Normalized synthetic 128-d face vector pattern C
    descriptor: Array.from({ length: 128 }, (_, i) => ((i * 37) % 100) / 100)
  }
];

// In-memory store initialized with seed students
const mockStudentsStore = new Map(SEED_STUDENTS.map(s => [s.studentId, s]));

/**
 * Calculates Euclidean distance between two 128-dimensional face feature vectors
 * @param {number[]} desc1 
 * @param {number[]} desc2 
 * @returns {number} distance (0.0 = identical, >0.6 usually distinct)
 */
export function calculateEuclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    return Infinity;
  }
  let sumSquare = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sumSquare += diff * diff;
  }
  return Math.sqrt(sumSquare);
}

/**
 * Matches an input face descriptor against enrolled students
 * @param {number[]} inputDescriptor - 128-float array
 * @param {import('../types.js').Student[]} enrolledStudents 
 * @param {number} threshold - Maximum Euclidean distance threshold (default: 0.6)
 * @returns {{ matchedStudent: import('../types.js').Student | null, distance: number, confidence: number }}
 */
export function matchFaceDescriptor(inputDescriptor, enrolledStudents = [], threshold = 0.6) {
  if (!inputDescriptor || inputDescriptor.length === 0 || enrolledStudents.length === 0) {
    return { matchedStudent: null, distance: Infinity, confidence: 0 };
  }

  let bestMatch = null;
  let minDistance = Infinity;

  for (const student of enrolledStudents) {
    if (!student.descriptor || !Array.isArray(student.descriptor)) continue;
    const distance = calculateEuclideanDistance(inputDescriptor, student.descriptor);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = student;
    }
  }

  if (minDistance <= threshold && bestMatch) {
    // Confidence formula: 100% at distance 0, dropping linearly to 0% at distance threshold
    const confidence = Math.max(0, Math.min(100, Math.round((1 - minDistance / threshold) * 100)));
    return { matchedStudent: bestMatch, distance: minDistance, confidence };
  }

  return { matchedStudent: null, distance: minDistance, confidence: 0 };
}

/**
 * Enrolls a new student in Firestore / mock store
 * @param {import('../types.js').Student} studentData 
 * @returns {Promise<boolean>}
 */
export async function enrollStudent(studentData) {
  if (!studentData.studentId || !studentData.name) {
    throw new Error('studentId and name are required for enrollment');
  }

  const record = {
    ...studentData,
    createdAt: new Date().toISOString()
  };

  if (db && !isMockFirebase) {
    try {
      const studentRef = doc(db, 'students', studentData.studentId);
      await setDoc(studentRef, {
        ...record,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.warn('[studentService] Firestore setDoc failed:', err.message);
    }
  }

  mockStudentsStore.set(studentData.studentId, record);
  return true;
}

/**
 * Gets all enrolled students
 * @returns {Promise<import('../types.js').Student[]>}
 */
export async function getAllStudents() {
  if (db && !isMockFirebase) {
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn('[studentService] Firestore getDocs failed:', err.message);
    }
  }

  return Array.from(mockStudentsStore.values());
}

/**
 * Gets a student by ID
 * @param {string} studentId 
 * @returns {Promise<import('../types.js').Student | null>}
 */
export async function getStudentById(studentId) {
  if (db && !isMockFirebase) {
    try {
      const docRef = doc(db, 'students', studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { studentId: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('[studentService] Firestore getStudentById failed:', err.message);
    }
  }

  return mockStudentsStore.get(studentId) || null;
}
