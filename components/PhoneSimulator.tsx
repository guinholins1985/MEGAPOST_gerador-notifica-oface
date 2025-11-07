import React from 'react';
import { PhoneModel, NotificationData, StatusBarSettings } from '../types';
import StatusBar from './StatusBar';
import NotificationPreview from './NotificationPreview';

interface PhoneSimulatorProps {
  phoneModel: PhoneModel;
  notifications: NotificationData[];
  wallpaperUrl: string;
  statusBarSettings: StatusBarSettings;
}

const PhoneSimulator = React.forwardRef<HTMLDivElement, PhoneSimulatorProps>(
  ({ phoneModel, notifications, wallpaperUrl, statusBarSettings }, ref) => {
    return (
      <div className="flex-shrink-0">
        <div
          className="bg-black dark:bg-gray-800 shadow-2xl mx-auto relative transition-all duration-300 ring-4 ring-gray-300 dark:ring-gray-700"
          style={phoneModel.styles.frame}
          ref={ref}
        >
          <div
            className="bg-cover bg-center h-full w-full relative overflow-hidden bg-gray-300 dark:bg-gray-900"
            style={{
              ...phoneModel.styles.screen,
              backgroundImage: `url(${wallpaperUrl})`,
            }}
          >
            {phoneModel.styles.notch && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-30"
                style={phoneModel.styles.notch}
              ></div>
            )}
            <StatusBar settings={statusBarSettings} />
            <div className="pt-8 px-2 relative z-10 h-full overflow-y-auto no-scrollbar">
              {notifications.map((notif) => (
                <NotificationPreview key={notif.id} notification={notif} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default PhoneSimulator;
