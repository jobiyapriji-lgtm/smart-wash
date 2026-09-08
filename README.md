# SMART WASH — Monorepo

Autonomous AI Handwashing Compliance & Identification Kiosk.

## 📁 Project Architecture & Team Roles

- **🧠 Jobiya**: Hand landmark extraction & Keras/TF.js LSTM step recognition model (`ml/`)
- **🔐 Jesty**: Face ID recognition hook (`useFaceRecognition`), Firebase config, shared data contract (`shared/types.js`), student enrollment, and session management (`shared/services/`)
- **🖥️ Joel**: Kiosk App frontend shell (`apps/student-app`)
- **📊 Rahul**: Handwash scoring formula, voice/feedback system, and teacher dashboard (`apps/teacher-dashboard`)

---

## 🚀 Jesty's Module Integration Guide

### 1. Shared Data Contract (`shared/types.js`)
All team members must use the agreed `Session` shape:
```js
{
  studentId: string,
  studentName: string,
  timestamp: Timestamp | string,
  steps: [
    { stepNumber: number, completed: boolean, durationMs: number, avgConfidence: number }
  ],
  score: number   // 0 - 100
}
```

### 2. Using `useFaceRecognition()` in Student App (Joel)
```jsx
import { useFaceRecognition } from '../../shared/hooks/useFaceRecognition.js';

const { matchedStudent, confidence, isDetecting } = useFaceRecognition({
  videoRef,
  enabled: state === 'identifying'
});
```

### 3. Creating & Updating Sessions (Joel & Rahul)
```js
import { createSession, updateSession } from '../../shared/services/sessionService.js';

// When student identified:
const { id, session } = await createSession(student.studentId, student.name);

// When washing completes:
await updateSession(id, {
  score: finalScore,
  steps: completedSteps,
  status: 'completed'
});
```

---

## 🛠️ Dev & Testing Commands

```bash
# Install dependencies
npm install

# Start local interactive test workbench
npm run dev

# Run automated tests for Jesty's module
npm test
```
