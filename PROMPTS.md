# SMART WASH — Team Prompt Log (`PROMPTS.md`)

This log records the prompts used by each team member during agentic development ("vibe coding") with Google Antigravity.

---

## 🔐 Jesty — Face ID & Firebase Backend

### Prompt 1: Initial Backend & Face Recognition Hook Setup
> **Prompt:**  
> "Create a Firebase project config file and a React hook `useFaceRecognition()` using face-api.js that loads models, detects a face from a video element, computes its descriptor, and matches it against a list of enrolled student descriptors, returning the matched studentId or null."

### Prompt 2: Data Contracts & Session Management Services
> **Prompt:**  
> "Implement `shared/types.js` with standard session and student shapes, and create `sessionService.js` and `studentService.js` supporting Firestore CRUD and high-performance Euclidean vector distance matching for 128-d face descriptors with a local mock fallback for offline development."

---

## 🧠 Jobiya — Hand Landmark Extraction + Step Recognition Model

### Prompt 1: Landmark Extraction & Dataset Pipeline Setup
> **Prompt:**  
> "In `ml/training`, set up a Python project with MediaPipe, TensorFlow, and scikit-learn. Write `extract_landmarks.py` to extract and normalize 21 3D hand landmarks per frame relative to wrist location and hand scale, and export feature sequences for Keras model training."

### Prompt 2: Keras/TF.js LSTM Model Trainer & Inference Engine
> **Prompt:**  
> "Build `train_lstm.py` in `ml/training` to train a Keras Sequential LSTM classifier on 30-frame landmark sequences for 6 WHO handwashing steps, export the model for TensorFlow.js, and implement `stepModelService.js` and `useStepRecognition.js` with sliding-window majority voting smoothing to eliminate prediction jitter."


---

## 🖥️ Joel — Frontend Shell (Student Kiosk App)

### Prompt 1: Student Kiosk App Shell & State Machine
> **Prompt:**  
> "Scaffold `apps/student-app` with a full-screen kiosk state machine (`idle` -> `identifying` -> `washing` -> `scoring` -> `feedback` -> `idle`) using React state or a reducer. Build `StudentKioskApp.jsx`, `KioskCamera.jsx`, `WashingView.jsx`, and `FeedbackView.jsx` to integrate Jesty's face-api hook and Jobiya's hand-tracking hook."

---


## 📊 Rahul — Scoring Logic & Dashboard
*(To be populated by Rahul)*
