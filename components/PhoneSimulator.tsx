import React from 'react';
import { PhoneModel, StatusBarSettings } from '../types';
import StatusBar from './StatusBar';

interface PhoneSimulatorProps {
  model: PhoneModel;
  wallpaperUrl: string;
  statusBarSettings: StatusBarSettings;
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ model, wallpaperUrl, statusBarSettings, children }) => {
  return (
    <div 
      className="relative bg-gray-800 p-2 shadow-2xl mx-auto"
      style={model.styles.frame}
    >
      <div 
        className="relative h-full w-full bg-black overflow-hidden"
        style={model.styles.screen}
      >
        <img 
          src={wallpaperUrl} 
          alt="Phone wallpaper" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <StatusBar settings={statusBarSettings} />

        {model.styles.notch && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-xl z-30"
            style={model.styles.notch}
          ></div>
        )}

        <div className="absolute inset-0 pt-10 px-2 flex flex-col items-center gap-2 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};
