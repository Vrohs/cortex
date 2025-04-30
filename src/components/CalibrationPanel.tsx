import { useState, useEffect, useRef } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import { CalibrationResult } from '@/types';

interface CalibrationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationComplete: (result: CalibrationResult) => void;
}

const CalibrationPanel = ({ 
  isOpen, 
  onClose, 
  onCalibrationComplete 
}: CalibrationPanelProps) => {
  const { settings, updateSettings } = useReaderSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<CalibrationResult>({
    fixationStability: 50,
    crowdingThreshold: 30,
    preferredSaccadeAmplitude: 15,
  });
  
  const [fixationPosition, setFixationPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle step completion
  const completeStep = (value: number) => {
    switch(currentStep) {
      case 0: // Fixation stability
        setResults(prev => ({ ...prev, fixationStability: value }));
        break;
      case 1: // Crowding threshold
        setResults(prev => ({ ...prev, crowdingThreshold: value }));
        break;
      case 2: // Preferred saccade amplitude
        setResults(prev => ({ ...prev, preferredSaccadeAmplitude: value }));
        break;
    }
    
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calibration complete
      onCalibrationComplete(results);
      
      // Apply settings based on calibration
      const newMagnification = 1.3 - (results.preferredSaccadeAmplitude - 15) * 0.01;
      const newLetterSpacing = 30 - (results.crowdingThreshold - 30) * 0.5;
      
      updateSettings({
        magnificationLevel: Math.max(1.25, Math.min(1.5, newMagnification)),
        letterSpacingPercentage: Math.max(25, Math.min(35, newLetterSpacing)),
      });
      
      onClose();
    }
  };
  
  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setResults({
        fixationStability: 50,
        crowdingThreshold: 30,
        preferredSaccadeAmplitude: 15,
      });
    }
  }, [isOpen]);
  
  // Fixation stability test
  useEffect(() => {
    if (!isOpen || currentStep !== 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Center position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw fixation cross
    const drawFixationCross = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the cross
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.strokeStyle = settings.isDarkMode ? '#E6E6E6' : '#121212';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    // Initial draw
    drawFixationCross();
    
    // Simulate eye movement for demonstration
    let stabilityScore = 0;
    let deviations = 0;
    let measurements = 0;
    
    const simulateEyeMovement = () => {
      measurements++;
      
      // Random deviation (simulating eye movement)
      const deviation = Math.random() * 10;
      deviations += deviation;
      
      // Calculate stability (inverse of average deviation)
      stabilityScore = 100 - (deviations / measurements);
      
      if (measurements >= 20) {
        completeStep(Math.round(stabilityScore));
      }
    };
    
    const interval = setInterval(simulateEyeMovement, 200);
    
    return () => {
      clearInterval(interval);
    };
  }, [isOpen, currentStep, settings.isDarkMode]);
  
  if (!isOpen) return null;
  
  // Content for each calibration step
  const stepContent = [
    // Step 1: Fixation Stability Test
    <div key="fixation" className="text-center">
      <h3 className="text-lg font-semibold mb-4">Fixation Stability Test</h3>
      <p className="mb-6">Focus on the cross in the center without moving your eyes.</p>
      <div className="w-full h-40 border border-gray-300 dark:border-gray-700 rounded mb-4">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
      <p className="text-sm text-gray-500">Testing... {results.fixationStability}% stable</p>
    </div>,
    
    // Step 2: Crowding Threshold Assessment
    <div key="crowding" className="text-center">
      <h3 className="text-lg font-semibold mb-4">Crowding Threshold Assessment</h3>
      <p className="mb-6">Move the slider until you can comfortably distinguish the letters.</p>
      <div className="w-full flex justify-center mb-8">
        <div 
          className="py-4 px-8 rounded-lg bg-gray-100 dark:bg-gray-800"
          style={{ letterSpacing: `${results.crowdingThreshold / 100}em` }}
        >
          <span className="text-xl font-mono">OVERI</span>
        </div>
      </div>
      <input
        type="range"
        min="10"
        max="50"
        value={results.crowdingThreshold}
        onChange={(e) => setResults(prev => ({ 
          ...prev, 
          crowdingThreshold: parseInt(e.target.value) 
        }))}
        className="w-full mb-2"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Tight</span>
        <span>Comfortable</span>
        <span>Spaced</span>
      </div>
      <button
        onClick={() => completeStep(results.crowdingThreshold)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Next
      </button>
    </div>,
    
    // Step 3: Preferred Saccade Amplitude Selector
    <div key="saccade" className="text-center">
      <h3 className="text-lg font-semibold mb-4">Preferred Saccade Amplitude</h3>
      <p className="mb-6">Select your preferred text block size for comfortable reading.</p>
      
      <div className="space-y-4 mb-6">
        {[10, 15, 20].map((amplitude) => (
          <div 
            key={amplitude}
            className={`p-4 border rounded cursor-pointer transition-colors ${
              results.preferredSaccadeAmplitude === amplitude
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onClick={() => setResults(prev => ({ 
              ...prev, 
              preferredSaccadeAmplitude: amplitude 
            }))}
          >
            <div 
              className="text-left"
              style={{ 
                width: `${amplitude * 10}px`,
                maxWidth: '100%' 
              }}
            >
              Sample text block
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => completeStep(results.preferredSaccadeAmplitude)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Complete Calibration
      </button>
    </div>
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div 
        className={`w-full max-w-md bg-${settings.isDarkMode ? 'gray-900' : 'white'} rounded-lg shadow-lg p-6 m-4`}
        style={{
          color: settings.isDarkMode ? '#E6E6E6' : '#121212',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Self-Calibration Toolkit</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Progress steps */}
        <div className="flex mb-8">
          {[0, 1, 2].map((step) => (
            <div key={step} className="flex-1 relative">
              <div 
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {step + 1}
              </div>
              {step < 2 && (
                <div 
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    currentStep > step 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              )}
              <div className="text-xs text-center mt-2">
                {['Fixation', 'Crowding', 'Saccade'][step]}
              </div>
            </div>
          ))}
        </div>
        
        {/* Step content */}
        <div className="py-4">
          {stepContent[currentStep]}
        </div>
      </div>
    </div>
  );
};

export default CalibrationPanel;
