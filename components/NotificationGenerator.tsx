import React, { useState } from 'react';
import { PhoneSimulator } from './PhoneSimulator';
import { NotificationPreview } from './NotificationPreview';
import { PHONE_MODELS } from '../data/phoneModels';
import { WALLPAPERS } from '../data/wallpapers';
import { BANKS, TRANSACTION_TYPES } from '../data/options';
import { NotificationData, StatusBarSettings, Bank } from '../types';
import { GoogleGenAI } from '@google/genai';

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" /><path d="M5 21L7 16" /><path d="M17 16L19 21" /><path d="M21 5L16 7" /><path d="M7 7L3 5" /></svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const initialNotification: NotificationData = {
    id: '1',
    appName: 'Nubank',
    transactionType: 'Pix - Recebido',
    amount: 123.45,
    recipient: 'Maria Silva',
    timestamp: 'agora',
};

export const NotificationGenerator: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([initialNotification]);
    const [formData, setFormData] = useState<Omit<NotificationData, 'id' | 'timestamp'> & { timestamp: string }>({
        appName: 'Nubank',
        transactionType: 'Pix - Enviado',
        amount: 50.00,
        recipient: 'João Souza',
        timestamp: 'agora',
        customAppIcon: null,
    });
    
    const [phoneModelId, setPhoneModelId] = useState<string>(PHONE_MODELS[0].id);
    const [wallpaperUrl, setWallpaperUrl] = useState<string>(WALLPAPERS[0].url);
    const [statusBarSettings, setStatusBarSettings] = useState<StatusBarSettings>({
        time: '09:41',
        wifi: true,
        signal: 4,
        battery: 82,
    });
    const [isGeneratingRecipient, setIsGeneratingRecipient] = useState(false);
    const [isGeneratingTimestamp, setIsGeneratingTimestamp] = useState(false);

     // FIX: Removed API key check to align with guidelines assuming it's always available.
     const handleGenerateRecipient = async () => {
        setIsGeneratingRecipient(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: 'Gere um nome completo realista de uma pessoa ou o nome de uma loja/empresa brasileira. Forneça apenas o nome, sem texto adicional.',
            });
            const generatedName = response.text.trim().replace(/"/g, '');
            setFormData(prev => ({ ...prev, recipient: generatedName }));
        } catch (error) {
            console.error("Erro ao gerar nome com IA:", error);
            alert("Falha ao gerar o nome. Tente novamente.");
        } finally {
            setIsGeneratingRecipient(false);
        }
    };
    
    // FIX: Removed API key check to align with guidelines assuming it's always available.
    const handleGenerateTimestamp = async () => {
        setIsGeneratingTimestamp(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "Gere um horário de notificação realista. Pode ser relativo (como 'agora' ou 'há 5 min') ou um horário específico (como '14:23'). Forneça apenas o texto do horário, sem explicações.",
            });
            const generatedTimestamp = response.text.trim().replace(/"/g, '');
            setFormData(prev => ({ ...prev, timestamp: generatedTimestamp }));
        } catch (error) {
            console.error("Erro ao gerar horário com IA:", error);
            alert("Falha ao gerar o horário. Tente novamente.");
        } finally {
            setIsGeneratingTimestamp(false);
        }
    };


    const handleFileRead = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await handleFileRead(file);
                setWallpaperUrl(dataUrl);
            } catch (error) {
                console.error("Erro ao ler o arquivo de papel de parede:", error);
                alert("Não foi possível carregar o papel de parede.");
            }
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await handleFileRead(file);
                setFormData(prev => ({ ...prev, customAppIcon: dataUrl }));
            } catch (error) {
                console.error("Erro ao ler o arquivo de ícone:", error);
                alert("Não foi possível carregar o ícone.");
            }
        }
    };

    const handleRemoveIcon = () => {
        const input = document.getElementById('icon-upload') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
        setFormData(prev => ({ ...prev, customAppIcon: null }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        }
        
        if (name === 'appName') {
            handleRemoveIcon();
            setFormData(prev => ({ ...prev, [name]: processedValue as Bank, customAppIcon: null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: processedValue }));
        }
    };

    const handleAddNotification = (e: React.FormEvent) => {
        e.preventDefault();
        const newNotification: NotificationData = {
            ...formData,
            id: new Date().getTime().toString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };
    
    const handleDeleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const selectedPhoneModel = PHONE_MODELS.find(m => m.id === phoneModelId) || PHONE_MODELS[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleAddNotification} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-bold mb-4">Criar Notificação</h2>
                    
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco/App</label>
                        <select id="appName" name="appName" value={formData.appName} onChange={handleFormChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="icon-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ícone Personalizado (Opcional)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label htmlFor="icon-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <span>Importar Ícone</span>
                            </label>
                            <input id="icon-upload" name="icon-upload" type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
                            {formData.customAppIcon && (
                                <div className="flex items-center gap-2">
                                    <img src={formData.customAppIcon} alt="Ícone" className="w-8 h-8 rounded-md object-cover" />
                                    <button type="button" onClick={handleRemoveIcon} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                        Remover
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transação</label>
                        <select id="transactionType" name="transactionType" value={formData.transactionType} onChange={handleFormChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {TRANSACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
                        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleFormChange} step="0.01" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinatário/Origem</label>
                         <div className="mt-1 flex rounded-md shadow-sm">
                            <input 
                                type="text" 
                                id="recipient" 
                                name="recipient" 
                                value={formData.recipient} 
                                onChange={handleFormChange} 
                                className="block w-full flex-1 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={isGeneratingRecipient}
                                placeholder={isGeneratingRecipient ? 'Gerando...' : ''}
                            />
                            <button 
                                type="button" 
                                onClick={handleGenerateRecipient}
                                disabled={isGeneratingRecipient}
                                className="relative inline-flex items-center justify-center w-12 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                aria-label="Gerar nome com IA"
                            >
                                {isGeneratingRecipient ? <SpinnerIcon /> : <SparkleIcon />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input 
                                type="text" 
                                id="timestamp" 
                                name="timestamp" 
                                value={formData.timestamp} 
                                onChange={handleFormChange} 
                                className="block w-full flex-1 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={isGeneratingTimestamp}
                                placeholder={isGeneratingTimestamp ? 'Gerando...' : ''}
                            />
                            <button 
                                type="button" 
                                onClick={handleGenerateTimestamp}
                                disabled={isGeneratingTimestamp}
                                className="relative inline-flex items-center justify-center w-12 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                aria-label="Gerar horário com IA"
                            >
                                {isGeneratingTimestamp ? <SpinnerIcon /> : <SparkleIcon />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">Adicionar Notificação</button>
                </form>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                     <h2 className="text-xl font-bold mb-4">Personalizar Celular</h2>
                     <div>
                        <label htmlFor="phoneModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo de Celular</label>
                        <select id="phoneModel" name="phoneModel" value={phoneModelId} onChange={(e) => setPhoneModelId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {PHONE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="wallpaper" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Papel de Parede</label>
                        <div className="flex items-center gap-2 mt-1">
                            <select id="wallpaper" name="wallpaper" value={wallpaperUrl} onChange={(e) => setWallpaperUrl(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                {WALLPAPERS.map(wp => <option key={wp.url} value={wp.url}>{wp.name}</option>)}
                            </select>
                            <label htmlFor="wallpaper-upload" className="cursor-pointer whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                Importar
                            </label>
                            <input id="wallpaper-upload" type="file" className="hidden" accept="image/*" onChange={handleWallpaperUpload} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                             <input type="text" id="time" value={statusBarSettings.time} onChange={(e) => setStatusBarSettings(s => ({...s, time: e.target.value}))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                             <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bateria (%)</label>
                             <input type="number" id="battery" value={statusBarSettings.battery} max="100" min="0" onChange={(e) => setStatusBarSettings(s => ({...s, battery: parseInt(e.target.value, 10)}))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="signal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sinal (0-4)</label>
                            <input type="number" id="signal" value={statusBarSettings.signal} max="4" min="0" onChange={(e) => setStatusBarSettings(s => ({...s, signal: parseInt(e.target.value, 10)}))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex items-center pt-6">
                            <input id="wifi" type="checkbox" checked={statusBarSettings.wifi} onChange={(e) => setStatusBarSettings(s => ({...s, wifi: e.target.checked}))} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label htmlFor="wifi" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Wi-Fi Ativo</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1">
                <div className="sticky top-8">
                    <PhoneSimulator
                        model={selectedPhoneModel}
                        wallpaperUrl={wallpaperUrl}
                        statusBarSettings={statusBarSettings}
                    >
                        {notifications.map(notification => (
                          <div key={notification.id} className="relative group w-full mb-2 last:mb-0">
                            <NotificationPreview notification={notification} />
                             <button onClick={() => handleDeleteNotification(notification.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              &times;
                            </button>
                          </div>
                        ))}
                    </PhoneSimulator>
                </div>
            </div>
        </div>
    );
};