import React from 'react';
import { NotificationData, PhoneModel } from '../types';
import { phoneModels } from '../data/phoneModels';
import { StatusBar } from './StatusBar';

interface PhoneSimulatorProps {
    data: NotificationData;
    children: React.ReactNode;
    mousePosition: { x: number, y: number };
}

const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ data, children, mousePosition }) => {
    const model: PhoneModel | undefined = phoneModels.find(m => m.name === data.phoneModel);

    if (!model) {
        return <div className="text-red-500">Modelo de celular não encontrado.</div>;
    }

    const phoneStyle: React.CSSProperties = {
        width: `${model.width}px`,
        height: `${model.height}px`,
        borderRadius: `${model.bezel + 20}px`,
        padding: `${model.bezel}px`,
    };

    const tiltStyle: React.CSSProperties = {
      transform: `rotateY(${(mousePosition.x / (model.width * 2) - 10)}deg) rotateX(${-(mousePosition.y / (model.height*2) - 10)}deg)`,
      transition: 'transform 0.1s ease-out',
    };
    
    const shadowStyle: React.CSSProperties = {
      boxShadow: `${(mousePosition.x / (model.width) - 20)}px ${(mousePosition.y / (model.height) - 20)}px 40px rgba(0,0,0,0.25)`,
       transition: 'box-shadow 0.1s ease-out',
    }

    return (
        <div id="phone-simulator-for-download" className="relative transform scale-90 md:scale-100 origin-top" style={tiltStyle}>
            <div style={{...phoneStyle, ...shadowStyle}} className="bg-black transition-all duration-300 ease-in-out mx-auto">
                <div 
                    className="relative w-full h-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden" 
                    style={{ borderRadius: `${model.bezel + 10}px` }}
                >
                    <img src={data.wallpaper} alt="wallpaper" className="absolute top-0 left-0 w-full h-full object-cover" crossOrigin="anonymous" />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/10 dark:bg-black/20"></div>
                    <StatusBar settings={data.statusBar} />
                    {model.notch && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
                    )}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneSimulator;