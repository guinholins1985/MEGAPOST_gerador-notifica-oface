import React from 'react';
import { StatusBarSettings } from '../types';
import { SignalIcon, WifiIcon, BatteryIcon } from './icons';

interface StatusBarProps {
  settings: StatusBarSettings;
}

export const StatusBar: React.FC<StatusBarProps> = ({ settings }) => {
  const { time, signal, wifi, battery, color } = settings;
  const colorClass = color === 'white' ? 'text-white' : 'text-black';

  return (
    <div className={`absolute top-0 left-0 right-0 h-10 px-4 flex justify-between items-center z-20`}>
      <span className={`font-semibold text-sm ${colorClass}`}>{time}</span>
      <div className={`flex items-center space-x-1.5 ${colorClass}`}>
        <SignalIcon bars={signal} />
        <WifiIcon bars={wifi} />
        <BatteryIcon level={battery} />
      </div>
    </div>
  );
};