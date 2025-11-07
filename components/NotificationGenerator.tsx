import React, { useState } from 'react';
import { NotificationData, Preset } from '../types';
import QueuePanel from './QueuePanel';
import PhoneSimulator from './PhoneSimulator';
import InspectorPanel from './InspectorPanel';
import NotificationPreview from './NotificationPreview';

interface NotificationGeneratorProps {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  selectedNotification: NotificationData | null;
  setSelectedNotificationId: React.Dispatch<React.SetStateAction<string | null>>;
  updateSelectedNotification: (data: NotificationData) => void;
  presets: Preset[];
  setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
}

const NotificationGenerator: React.FC<NotificationGeneratorProps> = ({
  notifications,
  setNotifications,
  selectedNotification,
  setSelectedNotificationId,
  updateSelectedNotification,
  presets,
  setPresets,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };
  
  if (!selectedNotification) {
      return (
        <div className="flex-grow flex items-center justify-center text-neutral-500">
            Selecione uma notificação ou crie uma nova para começar.
        </div>
      );
  }

  return (
    <main 
      className="flex-grow grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] xl:grid-cols-[320px_1fr_360px] gap-4 p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <QueuePanel
        notifications={notifications}
        setNotifications={setNotifications}
        selectedNotificationId={selectedNotification?.id || null}
        setSelectedNotificationId={setSelectedNotificationId}
      />
      
      <div className="flex items-center justify-center h-full relative overflow-hidden">
        <PhoneSimulator data={selectedNotification} mousePosition={mousePosition}>
          <NotificationPreview data={selectedNotification} />
        </PhoneSimulator>
      </div>

      <InspectorPanel
        data={selectedNotification}
        setData={updateSelectedNotification}
        presets={presets}
        setPresets={setPresets}
      />
    </main>
  );
};

export default NotificationGenerator;
