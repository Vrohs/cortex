import { useReaderSettings } from '@/contexts/ReaderSettingsContext';

interface StabilizerBarProps {
  isEnabled?: boolean;
}

const StabilizerBar = ({ isEnabled }: StabilizerBarProps) => {
  const { settings } = useReaderSettings();
  
  // If explicitly disabled or settings have it disabled, don't render
  if (isEnabled === false || !settings.isStabilizerBarEnabled) {
    return null;
  }
  
  return (
    <div
      className="absolute left-1/2 h-0.5 z-10 transition-opacity duration-300"
      style={{
        width: '15%',
        transform: 'translateX(-50%)',
        top: '50%',
        opacity: 0.5,
        backgroundColor: settings.isDarkMode ? '#3B82F6' : '#1D4ED8',
      }}
    ></div>
  );
};

export default StabilizerBar;
