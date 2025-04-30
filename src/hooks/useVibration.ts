// This is a simple hook for device vibration
// It's a fallback in case the browser doesn't support the Vibration API

import { useCallback } from 'react';

export const useVibration = () => {
  // Check if the Vibration API is supported
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  
  const vibrate = useCallback((pattern: number | number[]) => {
    if (isSupported) {
      navigator.vibrate(pattern);
      return true;
    }
    return false;
  }, [isSupported]);
  
  const cancelVibration = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
      return true;
    }
    return false;
  }, [isSupported]);
  
  return {
    isSupported,
    vibrate,
    cancelVibration
  };
};
