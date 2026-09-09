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

### Prompt 1: Explainable Handwash Scoring Formula & Audio Feedback
> **Prompt:**  
> "Build `shared/services/scoringService.js` to compute a 0-100 score based on WHO step completion (50%), target step duration closeness (30%), and ML landmark confidence (20%). Build `audioFeedbackService.js` for speech synthesis step guidance."

### Prompt 2: Teacher Analytics Dashboard App & Leaderboard
> **Prompt:**  
> "In `apps/teacher-dashboard`, scaffold a React app with Firebase Auth login for teachers, a student compliance roster table, an analytics trend graph of class average scores over time, and a student leaderboard sorted by score and streak count."

