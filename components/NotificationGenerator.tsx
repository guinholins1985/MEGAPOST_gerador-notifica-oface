import React, { useState } from 'react';
import { Bank, NotificationData, PhoneModel, StatusBarSettings, TransactionType } from '../types';
import { PHONE_MODELS } from '../data/phoneModels';
import { WALLPAPERS } from '../data/wallpapers';
import { BANKS, TRANSACTION_TYPES } from '../data/options';
import { PhoneSimulator } from './PhoneSimulator';

export const NotificationGenerator: React.FC = () => {
  const [notification, setNotification] = useState<NotificationData>({
    id: 'preview-notification',
    appName: 'Nubank',
    transactionType: 'Pix - Recebido',
    amount: 123.45,
    recipient: 'Tony Stark',
    customAppIcon: null,
    timestamp: 'agora',
  });

  const [phoneModel, setPhoneModel] = useState<PhoneModel>(PHONE_MODELS[0]);
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPERS[0].url);
  const [statusBar, setStatusBar] = useState<StatusBarSettings>({
    time: '09:41',
    wifi: true,
    signal: 4,
    battery: 88,
  });

  const handleNotificationChange = (field: keyof NotificationData, value: any) => {
    setNotification(prev => ({ ...prev, [field]: value }));
  };
  
  const handleStatusBarChange = (field: keyof StatusBarSettings, value: any) => {
    setStatusBar(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneModelChange = (id: string) => {
    const newModel = PHONE_MODELS.find(m => m.id === id);
    if (newModel) {
      setPhoneModel(newModel);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        {/* Notification Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Notificação</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aplicativo</label>
              <select
                id="appName"
                value={notification.appName}
                onChange={(e) => handleNotificationChange('appName', e.target.value as Bank)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transação</label>
              <select
                id="transactionType"
                value={notification.transactionType}
                onChange={(e) => handleNotificationChange('transactionType', e.target.value as TransactionType)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {TRANSACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
              <input
                type="number"
                id="amount"
                value={notification.amount}
                onChange={(e) => handleNotificationChange('amount', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinatário/Remetente</label>
              <input
                type="text"
                id="recipient"
                value={notification.recipient}
                onChange={(e) => handleNotificationChange('recipient', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
              />
            </div>
             <div>
              <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
              <input
                type="text"
                id="timestamp"
                value={notification.timestamp}
                onChange={(e) => handleNotificationChange('timestamp', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Phone Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Aparelho</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="phoneModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                    <select
                        id="phoneModel"
                        value={phoneModel.id}
                        onChange={(e) => handlePhoneModelChange(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {PHONE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="wallpaper" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Papel de Parede</label>
                    <select
                        id="wallpaper"
                        value={wallpaper}
                        onChange={(e) => setWallpaper(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {WALLPAPERS.map(wp => <option key={wp.name} value={wp.url}>{wp.name}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* Status Bar Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Barra de Status</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                    <input
                        type="text"
                        id="time"
                        value={statusBar.time}
                        onChange={(e) => handleStatusBarChange('time', e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bateria ({statusBar.battery}%)</label>
                    <input
                        type="range"
                        id="battery"
                        min="0"
                        max="100"
                        value={statusBar.battery}
                        onChange={(e) => handleStatusBarChange('battery', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                <div>
                    <label htmlFor="signal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sinal ({statusBar.signal}/4)</label>
                    <input
                        type="range"
                        id="signal"
                        min="0"
                        max="4"
                        step="1"
                        value={statusBar.signal}
                        onChange={(e) => handleStatusBarChange('signal', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="wifi"
                        type="checkbox"
                        checked={statusBar.wifi}
                        onChange={(e) => handleStatusBarChange('wifi', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="wifi" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">WiFi Ativado</label>
                </div>
            </div>
        </div>

      </div>

      <div className="lg:col-span-2 flex items-center justify-center">
        <PhoneSimulator 
          phoneModel={phoneModel}
          wallpaperUrl={wallpaper}
          statusBarSettings={statusBar}
          notification={notification}
        />
      </div>
    </div>
  );
};
