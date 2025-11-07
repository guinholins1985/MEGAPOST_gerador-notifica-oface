import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import NotificationGenerator from './components/NotificationGenerator';
import { NotificationData, Preset } from './types';
import { phoneModels } from './data/phoneModels';

const initialNotificationData: NotificationData = {
  id: uuidv4(),
  bank: 'Nubank',
  customBankName: '',
  customBankIcon: null,
  transactionType: 'PIX Recebido',
  value: 'R$ 1.234,56',
  recipient: 'Tony Stark',
  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  wallpaper: '',
  phoneModel: phoneModels[0].name,
  statusBar: {
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    signal: 4,
    wifi: 3,
    battery: 80,
    color: 'white',
  },
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<NotificationData[]>([initialNotificationData]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(initialNotificationData.id);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const selectedNotification = notifications.find(n => n.id === selectedNotificationId) || null;

  const updateSelectedNotification = (data: NotificationData) => {
    setNotifications(prev => prev.map(n => n.id === selectedNotificationId ? data : n));
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-neutral-800">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <NotificationGenerator
        notifications={notifications}
        setNotifications={setNotifications}
        selectedNotification={selectedNotification}
        setSelectedNotificationId={setSelectedNotificationId}
        updateSelectedNotification={updateSelectedNotification}
        presets={presets}
        setPresets={setPresets}
      />
    </div>
  );
}

export default App;