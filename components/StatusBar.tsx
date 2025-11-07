import React from 'react';
import { StatusBarSettings } from '../types';

const WifiIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
);

const SignalIcon: React.FC<{ bars: number; color: 'white' | 'black' }> = ({ bars, color }) => (
    <div className="flex items-end gap-0.5 h-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <div
                key={i}
                className={`w-1 rounded-sm ${i < bars ? (color === 'white' ? 'bg-white' : 'bg-black') : (color === 'white' ? 'bg-gray-500' : 'bg-gray-400')}`}
                style={{ height: `${(i + 1) * 25}%` }}
            />
        ))}
    </div>
);

const BatteryIcon: React.FC<{ level: number; color: 'white' | 'black' }> = ({ level, color }) => (
    <div className={`relative w-[22px] h-[12px] border-2 ${color === 'white' ? 'border-white' : 'border-black'} rounded-sm flex items-center p-0.5`}>
        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-2 ${color === 'white' ? 'bg-white' : 'bg-black'} rounded-r-sm`}></div>
        <div 
          className={`h-full rounded-sm ${level > 20 ? (color === 'white' ? 'bg-white' : 'bg-black') : 'bg-red-500'}`} 
          style={{ width: `${level}%` }}
        ></div>
    </div>
);


const StatusBar: React.FC<{ settings: StatusBarSettings }> = ({ settings }) => {
  const textColorClass = settings.color === 'white' ? 'text-white' : 'text-black';
  return (
    <div className={`absolute top-0 left-0 right-0 h-8 px-4 flex justify-between items-center ${textColorClass} text-xs font-bold z-20`}>
      <span>{settings.time}</span>
      <div className="flex items-center space-x-1">
        <SignalIcon bars={settings.signal} color={settings.color} />
        {settings.wifi && <WifiIcon />}
        <BatteryIcon level={settings.battery} color={settings.color} />
      </div>
    </div>
  );
};

export default StatusBar;