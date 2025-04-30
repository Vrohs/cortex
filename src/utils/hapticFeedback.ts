/**
 * Haptic feedback utilities for the PDF reader that supports the neurological research specs
 * 
 * Uses the Web Vibration API (if available) to provide tactile feedback during reading
 * This preserves visual attention through somatosensory feedback
 */

// Check if vibration is supported
const isVibrationSupported = () => {
  return 'navigator' in window && 'vibrate' in navigator;
};

/**
 * Trigger a short vibration for page turns (100ms)
 */
export const vibratePageTurn = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(100);
  }
};

/**
 * Trigger a longer pulse for chapter breaks (300ms)
 */
export const vibrateChapterBreak = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(300);
  }
};

/**
 * Trigger a pattern vibration for important notifications
 * Pattern: 100ms on, 50ms off, 100ms on
 */
export const vibrateNotification = () => {
  if (isVibrationSupported()) {
    navigator.vibrate([100, 50, 100]);
  }
};

/**
 * Trigger a calibration-specific vibration pattern
 * Pattern: 50ms on, 50ms off, repeated 3 times
 */
export const vibrateCalibrationFeedback = () => {
  if (isVibrationSupported()) {
    navigator.vibrate([50, 50, 50, 50, 50]);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelVibration = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
};
