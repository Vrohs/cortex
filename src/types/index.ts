export interface ReaderSettings {
  // Dynamic Line Window
  lineWindowSize: number; // 3-7 adjustable lines
  
  // Peripheral Darkness Gradient
  peripheralDarknessLevel: number; // 20-60% (20 default)
  isDarknessGradientEnabled: boolean;
  
  // Smart Magnification
  magnificationLevel: number; // 1.25-1.5x (1.3x default)
  isAutoMagnificationEnabled: boolean;
  
  // Adaptive Spacing
  letterSpacingPercentage: number; // 25-35% of character width
  lineSpacingMultiplier: number; // 1.5-2x font height
  
  // Contrast Preservation
  isHighContrastEnabled: boolean;
  isDarkMode: boolean;
  
  // Smooth Scrolling
  scrollAnimationDuration: number; // in ms (default 300ms)
  isStabilizerBarEnabled: boolean;
  
  // Haptic Navigation
  isHapticFeedbackEnabled: boolean;
  
  // Neural Adaptation Mode
  isNeuralAdaptationEnabled: boolean;
  adaptationStartDate?: Date;
  
  // Accessibility Presets
  isLowVisionProfileEnabled: boolean;
  isAcademicReadingModeEnabled: boolean;
}

export interface PDFDocument {
  id: string;
  title: string;
  author?: string;
  pageCount: number;
  currentPage: number;
  file: File | string; // Can be a File object or a URL
  lastOpened?: Date;
}

export interface ReaderStats {
  wordsPerMinute: number;
  readingTime: number; // in seconds
  completionPercentage: number;
  pagesRead: number;
}

export interface CalibrationResult {
  fixationStability: number;
  crowdingThreshold: number;
  preferredSaccadeAmplitude: number;
}

// Self-Calibration Toolkit types
export interface CalibrationResult {
  fixationStability: number; // 0-100%
  crowdingThreshold: number; // in pixels
  preferredSaccadeAmplitude: number; // in degrees
}
