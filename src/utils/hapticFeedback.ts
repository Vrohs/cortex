/**
 * Haptic feedback utilities for the PDF reader that supports the neurological research specs
 * 
 * Uses the Web Vibration API (if available) to provide tactile feedback during reading
 * This preserves visual attention through somatosensory feedback
 */

// Check if vibration is supported
const isVibrationSupported = () => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger a short vibration for page turns (100ms)
 * Research shows this helps maintain focus during page transitions
 */
export const vibratePageTurn = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(100);
    return true;
  }
  return false;
};

/**
 * Trigger a longer pulse for chapter breaks (300ms)
 * Provides a distinctive tactile cue for major content transitions
 */
export const vibrateChapterBreak = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(300);
    return true;
  }
  return false;
};

/**
 * Trigger a pattern vibration for important notifications
 * Pattern: 100ms on, 50ms off, 100ms on
 */
export const vibrateNotification = () => {
  if (isVibrationSupported()) {
    navigator.vibrate([100, 50, 100]);
    return true;
  }
  return false;
};

/**
 * Trigger a calibration-specific vibration pattern
 * Pattern: 50ms on, 50ms off, repeated 3 times
 * Used during calibration exercises to provide feedback
 */
export const vibrateCalibrationFeedback = () => {
  if (isVibrationSupported()) {
    navigator.vibrate([50, 50, 50, 50, 50]);
    return true;
  }
  return false;
};

/**
 * Trigger a short vibration pattern for errors
 * Pattern: 70ms on, 30ms off, 70ms on
 */
export const vibrateError = () => {
  if (isVibrationSupported()) {
    navigator.vibrate([70, 30, 70]);
    return true;
  }
  return false;
};

/**
 * Cancel any ongoing vibration
 * Use when interrupting the current reading flow
 */
export const cancelVibration = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
    return true;
  }
  return false;
};
