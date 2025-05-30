import { useState } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import { ReaderSettings } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalibration?: () => void;
}

const SettingsPanel = ({ isOpen, onClose, onOpenCalibration }: SettingsPanelProps) => {
  const { settings, updateSettings, resetSettings, applyLowVisionProfile, applyAcademicReadingMode } = useReaderSettings();
  const [tempSettings, setTempSettings] = useState<ReaderSettings>(settings);

  // Handle settings changes
  const handleChange = (key: keyof ReaderSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  // Apply settings changes
  const applySettings = () => {
    updateSettings(tempSettings);
    onClose();
  };

  // Cancel changes
  const cancelChanges = () => {
    setTempSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div 
        className={`w-full max-w-md bg-${settings.isDarkMode ? 'gray-900' : 'white'} h-full overflow-y-auto p-6 shadow-lg`}
        style={{
          color: settings.isDarkMode ? '#E6E6E6' : '#121212',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Reader Settings</h2>
          <button 
            onClick={cancelChanges}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Presets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Presets</h3>
            <div className="flex space-x-3">
              <button 
                onClick={resetSettings}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Default
              </button>
              <button 
                onClick={applyLowVisionProfile}
                className={`px-3 py-2 ${tempSettings.isLowVisionProfileEnabled ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded hover:bg-blue-700`}
              >
                Low Vision
              </button>
              <button 
                onClick={applyAcademicReadingMode}
                className={`px-3 py-2 ${tempSettings.isAcademicReadingModeEnabled ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded hover:bg-blue-700`}
              >
                Academic
              </button>
            </div>
          </div>

          {/* Core Display Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Core Display</h3>
            
            {/* Dynamic Line Window */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                🔍 Dynamic Line Window ({tempSettings.lineWindowSize} lines)
              </label>
              <input
                type="range"
                min="3"
                max="7"
                step="1"
                value={tempSettings.lineWindowSize}
                onChange={(e) => handleChange('lineWindowSize', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjusts visible text range (perceptual span)
              </p>
            </div>
            
            {/* Peripheral Darkness Gradient */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🌑 Peripheral Darkness Gradient
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isDarknessGradientEnabled}
                    onChange={(e) => handleChange('isDarknessGradientEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {tempSettings.isDarknessGradientEnabled && (
                <div className="mt-2">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={tempSettings.peripheralDarknessLevel}
                    onChange={(e) => handleChange('peripheralDarknessLevel', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dimming level: {tempSettings.peripheralDarknessLevel}%
                  </p>
                </div>
              )}
            </div>
            
            {/* Smart Magnification */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🔎 Smart Magnification
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isAutoMagnificationEnabled}
                    onChange={(e) => handleChange('isAutoMagnificationEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="1.25"
                  max="1.5"
                  step="0.05"
                  value={tempSettings.magnificationLevel}
                  onChange={(e) => handleChange('magnificationLevel', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Magnification: {tempSettings.magnificationLevel}×
                </p>
              </div>
            </div>
          </div>

          {/* Text Presentation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Text Presentation</h3>
            
            {/* Adaptive Spacing System */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                📏 Letter Spacing ({tempSettings.letterSpacingPercentage}%)
              </label>
              <input
                type="range"
                min="25"
                max="35"
                step="1"
                value={tempSettings.letterSpacingPercentage}
                onChange={(e) => handleChange('letterSpacingPercentage', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                📏 Line Spacing ({tempSettings.lineSpacingMultiplier}×)
              </label>
              <input
                type="range"
                min="1.5"
                max="2"
                step="0.1"
                value={tempSettings.lineSpacingMultiplier}
                onChange={(e) => handleChange('lineSpacingMultiplier', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Contrast Preservation Mode */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🎨 High Contrast Mode
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isHighContrastEnabled}
                    onChange={(e) => handleChange('isHighContrastEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🎨 Dark Mode
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isDarkMode}
                    onChange={(e) => handleChange('isDarkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Interaction Design */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Interaction Design</h3>
            
            {/* Smooth Scrolling Transitions */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                🔄 Scroll Animation Duration ({tempSettings.scrollAnimationDuration}ms)
              </label>
              <input
                type="range"
                min="200"
                max="500"
                step="50"
                value={tempSettings.scrollAnimationDuration}
                onChange={(e) => handleChange('scrollAnimationDuration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🔄 Stabilizer Bar
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isStabilizerBarEnabled}
                    onChange={(e) => handleChange('isStabilizerBarEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {/* Haptic Navigation */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  ✋ Haptic Feedback
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isHapticFeedbackEnabled}
                    onChange={(e) => handleChange('isHapticFeedbackEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Advanced Features</h3>
            
            {/* Neural Adaptation Mode */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  🧠 Neural Adaptation Mode
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isNeuralAdaptationEnabled}
                    onChange={(e) => {
                      const value = e.target.checked;
                      handleChange('isNeuralAdaptationEnabled', value);
                      
                      // Set adaptation start date if enabling and no date set previously
                      if (value && !tempSettings.adaptationStartDate) {
                        const today = new Date();
                        handleChange('adaptationStartDate', today);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {tempSettings.isNeuralAdaptationEnabled && (
                <>
                  <p className="text-xs text-gray-500 mt-1">
                    Progressive text expansion over 2-4 weeks to strengthen dorsal-ventral stream connectivity.
                    The system will gradually adapt text presentation to your neural reading capacity.
                  </p>
                  
                  {tempSettings.adaptationStartDate && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Adaptation Progress</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        {/* Calculate progress based on start date */}
                        {(() => {
                          const startDate = new Date(tempSettings.adaptationStartDate);
                          const currentDate = new Date();
                          const daysSinceStart = Math.floor(
                            (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                          );
                          const adaptationPeriod = 28; // 4 weeks
                          const progress = Math.min(100, (daysSinceStart / adaptationPeriod) * 100);
                          return (
                            <div 
                              className="bg-green-500 h-2.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 mt-1">
                          Started {new Date(tempSettings.adaptationStartDate).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleChange('adaptationStartDate', new Date())}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Reset Progress
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Self-Calibration Toolkit */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                🔧 Self-Calibration Toolkit
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Test your fixation stability, crowding threshold, and preferred saccade amplitude
              </p>
              {onOpenCalibration && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCalibration();
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Start Calibration
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              onClick={cancelChanges}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              style={{
                color: settings.isDarkMode ? '#E6E6E6' : '#121212',
                borderColor: settings.isDarkMode ? '#555' : '#E0E0E0',
              }}
            >
              Cancel
            </button>
            <button
              onClick={applySettings}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
