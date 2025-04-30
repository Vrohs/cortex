import { useEffect, useState } from 'react';
import { ReaderSettings } from '@/types';

interface UseNeuralAdaptationProps {
  settings: ReaderSettings;
  updateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

// Neural adaptation progression over time
// This simulates a gradual expansion of reading capacity over 2-4 weeks
export const useNeuralAdaptation = ({ 
  settings, 
  updateSettings 
}: UseNeuralAdaptationProps) => {
  const [adaptationProgress, setAdaptationProgress] = useState(0); // 0-100%

  useEffect(() => {
    if (!settings.isNeuralAdaptationEnabled || !settings.adaptationStartDate) {
      return;
    }

    // Calculate days since adaptation started
    const startDate = new Date(settings.adaptationStartDate);
    const currentDate = new Date();
    const daysSinceStart = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Target: Complete adaptation in 28 days (4 weeks)
    const adaptationPeriod = 28;
    const newProgress = Math.min(100, (daysSinceStart / adaptationPeriod) * 100);
    setAdaptationProgress(newProgress);

    // Apply progressive changes based on adaptation progress
    if (daysSinceStart > 0) {
      // Gradually expand line window size from 3 to 7
      const baseLineWindow = 3;
      const maxLineWindowIncrease = 4; // from 3 to 7
      const newLineWindowSize = Math.min(
        7,
        baseLineWindow + (maxLineWindowIncrease * newProgress) / 100
      );

      // Gradually reduce peripheral darkness
      const baseDarkness = 20;
      const minDarkness = 10;
      const darknessDifference = baseDarkness - minDarkness;
      const newDarknessLevel = baseDarkness - (darknessDifference * newProgress) / 100;

      // Gradually increase reading speed through spacing adjustments
      const baseLetterSpacing = 30;
      const minLetterSpacing = 25;
      const spacingDifference = baseLetterSpacing - minLetterSpacing;
      const newLetterSpacing = baseLetterSpacing - (spacingDifference * newProgress) / 100;

      // Apply the updates
      updateSettings({
        lineWindowSize: Math.round(newLineWindowSize),
        peripheralDarknessLevel: Math.round(newDarknessLevel),
        letterSpacingPercentage: Math.round(newLetterSpacing),
      });
    }
  }, [settings.isNeuralAdaptationEnabled, settings.adaptationStartDate]);

  return {
    adaptationProgress,
    daysRemaining: 28 - Math.floor(adaptationProgress * 28 / 100),
  };
};
