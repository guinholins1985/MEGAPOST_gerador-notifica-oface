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
  isAnimating: boolean;
}

export const PhoneSimulator = forwardRef<HTMLDivElement, PhoneSimulatorProps>(({
  phoneModel,
  wallpaperUrl,
  statusBarSettings,
  notifications,
  zoomLevel,
  isAnimating,
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
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
    <div style={containerStyle}>
        <div style={frameStyle} ref={ref}>
          <div style={screenStyle}>
            <div style={wallpaperStyle}></div>
            <StatusBar settings={statusBarSettings} />
            {phoneModel.styles.notch && <div style={notchStyle}></div>}
            <div className="absolute inset-0 top-10 overflow-y-auto p-4 scrollbar-hide">
              <div className={isAnimating ? 'animate-scroll-list' : ''}>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                        <NotificationPreview key={notification.id} notification={notification} />
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
});