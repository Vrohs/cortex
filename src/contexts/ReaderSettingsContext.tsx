import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ReaderSettings } from '@/types';

// Default settings based on research
const defaultSettings: ReaderSettings = {
  // Dynamic Line Window
  lineWindowSize: 5, // Default to 5 lines (range: 3-7)
  
  // Peripheral Darkness Gradient
  peripheralDarknessLevel: 20, // Default: 20 cd/m² (80% brightness reduction)
  isDarknessGradientEnabled: true,
  
  // Smart Magnification
  magnificationLevel: 1.3, // Default: 1.3x (recommended)
  isAutoMagnificationEnabled: true,
  
  // Adaptive Spacing
  letterSpacingPercentage: 30, // Default: 30% of character width
  lineSpacingMultiplier: 1.75, // Default: 1.75x font height
  
  // Contrast Preservation
  isHighContrastEnabled: true,
  isDarkMode: true,
  
  // Smooth Scrolling
  scrollAnimationDuration: 300, // Default: 300ms
  isStabilizerBarEnabled: true,
  
  // Haptic Navigation
  isHapticFeedbackEnabled: true,
  
  // Neural Adaptation Mode
  isNeuralAdaptationEnabled: false,
  
  // Accessibility Presets
  isLowVisionProfileEnabled: false,
  isAcademicReadingModeEnabled: false,
};

type ReaderSettingsContextType = {
  settings: ReaderSettings;
  updateSettings: (newSettings: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
  toggleDarkMode: () => void;
  applyLowVisionProfile: () => void;
  applyAcademicReadingMode: () => void;
};

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(undefined);

export const ReaderSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load settings from localStorage only after hydration
  useEffect(() => {
    if (isHydrated) {
      const savedSettings = localStorage.getItem('readerSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [isHydrated]);

  // Save settings to localStorage when they change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('readerSettings', JSON.stringify(settings));
    }
  }, [settings, isHydrated]);

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // Apply Low Vision Profile
  const applyLowVisionProfile = () => {
    setSettings(prev => ({
      ...prev,
      isLowVisionProfileEnabled: true,
      isAcademicReadingModeEnabled: false,
      magnificationLevel: prev.magnificationLevel * 1.7, // 70% magnification boost
      lineWindowSize: 3, // Smaller window for better focus
      letterSpacingPercentage: 35, // Maximum letter spacing
      lineSpacingMultiplier: 2, // Maximum line spacing
      peripheralDarknessLevel: 40, // Higher darkness for better focus
    }));
  };

  // Apply Academic Reading Mode
  const applyAcademicReadingMode = () => {
    setSettings(prev => ({
      ...prev,
      isAcademicReadingModeEnabled: true,
      isLowVisionProfileEnabled: false,
      lineWindowSize: 7, // Maximum window for context
      letterSpacingPercentage: 25, // Lower letter spacing for density
      lineSpacingMultiplier: 1.5, // Lower line spacing for density
      scrollAnimationDuration: 400, // Slower scrolling for better comprehension
    }));
  };

  return (
    <ReaderSettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        resetSettings, 
        toggleDarkMode,
        applyLowVisionProfile,
        applyAcademicReadingMode
      }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  );
};

export const useReaderSettings = () => {
  const context = useContext(ReaderSettingsContext);
  if (context === undefined) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
};
