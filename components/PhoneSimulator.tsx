import React, { forwardRef } from 'react';
import { PhoneModel, StatusBarSettings, NotificationData, CSSProperties } from '../types';
import StatusBar from './StatusBar';
import { NotificationPreview } from './NotificationPreview';

interface PhoneSimulatorProps {
  phoneModel: PhoneModel;
  wallpaperUrl: string;
  statusBarSettings: StatusBarSettings;
  notifications: NotificationData[];
  zoomLevel: number;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const PhoneSimulator = forwardRef<HTMLDivElement, PhoneSimulatorProps>(({
  phoneModel,
  wallpaperUrl,
  statusBarSettings,
  notifications,
  zoomLevel,
  scrollRef,
}, ref) => {
  const containerStyle: CSSProperties = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center',
    transition: 'transform 0.2s ease-out',
  };

  const frameStyle: CSSProperties = {
    ...phoneModel.styles.frame,
    position: 'relative',
    backgroundColor: '#111',
    border: '8px solid #111',
    overflow: 'hidden',
  };

  const screenStyle: CSSProperties = {
    ...phoneModel.styles.screen,
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  };

  const wallpaperStyle: CSSProperties = {
    backgroundImage: `url(${wallpaperUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  };
  
  const notchStyle: CSSProperties = {
    ...phoneModel.styles.notch,
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#111',
    borderRadius: '0 0 1rem 1rem',
    zIndex: 10,
  }

  return (
    <div style={containerStyle} className="drop-shadow-2xl dark:drop-shadow-[0_25px_25px_rgba(29,78,216,0.15)]">
        <div style={frameStyle} ref={ref}>
          <div style={screenStyle}>
            <div style={wallpaperStyle}></div>
            <StatusBar settings={statusBarSettings} />
            {phoneModel.styles.notch && <div style={notchStyle}></div>}
            <div 
              ref={scrollRef} 
              className="absolute inset-0 top-10 overflow-y-auto p-4 scrollbar-hide"
              style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
            >
              <div className="space-y-3">
                {notifications.map(notification => (
                    <NotificationPreview key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
});