/**
 * SMART WASH — Voice & Audio Feedback Service
 * Author: Rahul (Scoring & Dashboard Lead)
 * 
 * Provides audio prompts and speech synthesis feedback for WHO handwashing steps
 * and final session encouragement.
 */

export const WHO_AUDIO_PROMPTS = {
  1: "Step 1: Rub palms together thoroughly.",
  2: "Step 2: Rub right palm over left dorsum with interlaced fingers, and vice versa.",
  3: "Step 3: Palm to palm with fingers interlaced.",
  4: "Step 4: Backs of fingers to opposing palms with fingers interlocked.",
  5: "Step 5: Rotational rubbing of left thumb clasped in right palm and vice versa.",
  6: "Step 6: Rotational rubbing of fingertips backward and forward in palms."
};

/**
 * Speaks text using Web Speech API SpeechSynthesis if available.
 * @param {string} text 
 */
export function speakText(text) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } else {
    console.log(`[AudioFeedback] Speaking: "${text}"`);
  }
}

/**
 * Speaks WHO step instruction prompt.
 * @param {number} stepNumber 
 */
export function speakStepInstruction(stepNumber) {
  const promptText = WHO_AUDIO_PROMPTS[stepNumber] || `Step ${stepNumber}`;
  speakText(promptText);
}

/**
 * Speaks score encouragement praise.
 * @param {number} score 
 * @param {string} studentName 
 */
export function speakEncouragement(score, studentName = '') {
  const namePrefix = studentName ? `Great job, ${studentName}! ` : 'Great job! ';
  let message = `${namePrefix}Your handwashing score is ${score} out of 100.`;

  if (score >= 90) {
    message += " Outstanding compliance!";
  } else if (score >= 75) {
    message += " Good technique!";
  } else {
    message += " Keep practicing all 6 WHO steps.";
  }

  speakText(message);
}
