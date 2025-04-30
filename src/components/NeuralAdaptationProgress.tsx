import { useEffect, useState } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';

interface NeuralAdaptationProgressProps {
  startDate: Date;
}

const NeuralAdaptationProgress = ({ startDate }: NeuralAdaptationProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const { settings } = useReaderSettings();
  
  useEffect(() => {
    if (!settings.isNeuralAdaptationEnabled) return;
    
    const calculateProgress = () => {
      const startTime = new Date(startDate).getTime();
      const currentTime = new Date().getTime();
      const daysSinceStart = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
      
      // 28 days (4 weeks) total adaptation period
      const adaptationPeriod = 28;
      const calculatedProgress = Math.min(100, (daysSinceStart / adaptationPeriod) * 100);
      const calculatedDaysRemaining = Math.max(0, adaptationPeriod - daysSinceStart);
      
      setProgress(calculatedProgress);
      setDaysRemaining(calculatedDaysRemaining);
    };
    
    calculateProgress();
    
    // Update progress daily
    const interval = setInterval(() => {
      calculateProgress();
    }, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, [startDate, settings.isNeuralAdaptationEnabled]);
  
  if (!settings.isNeuralAdaptationEnabled) return null;
  
  return (
    <div className="neural-adaptation-progress p-4 bg-gray-800 bg-opacity-50 rounded-lg">
      <h4 className="text-sm font-medium text-white mb-2">Neural Adaptation Progress</h4>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-300">
        <span>Started {new Date(startDate).toLocaleDateString()}</span>
        <span>{daysRemaining} days remaining</span>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        Your reading experience is adapting to your neural capabilities. 
        Over time, your text capacity will gradually expand.
      </p>
    </div>
  );
};

export default NeuralAdaptationProgress;
