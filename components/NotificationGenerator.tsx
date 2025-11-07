import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Bank, NotificationData, PhoneModel, StatusBarSettings, TransactionType } from '../types';
import { PHONE_MODELS } from '../data/phoneModels';
import { WALLPAPERS } from '../data/wallpapers';
import { BANKS, TRANSACTION_TYPES } from '../data/options';
import { PhoneSimulator } from './PhoneSimulator';
import { MagicWandIcon, UploadIcon, DownloadIcon, TrashIcon, ZoomInIcon, ZoomOutIcon, ExternalLinkIcon, SpinnerIcon } from './icons';

declare const htmlToImage: any;
declare const html2canvas: any;
declare const GIF: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createNewNotification = (data: Partial<NotificationData> = {}): NotificationData => ({
  id: crypto.randomUUID(),
  appName: 'Nubank',
  transactionType: 'Pix - Recebido',
  amount: 123.45,
  recipient: 'Tony Stark',
  customAppIcon: null,
  timestamp: 'agora',
  ...data,
});


export const NotificationGenerator: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([createNewNotification()]);
  const [selectedId, setSelectedId] = useState<string>(notifications[0].id);
  
  const [phoneModel, setPhoneModel] = useState<PhoneModel>(PHONE_MODELS[0]);
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPERS[0].url);
  const [statusBar, setStatusBar] = useState<StatusBarSettings>({
    time: '09:41', wifi: true, signal: 4, battery: 88,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wallpaperPrompt, setWallpaperPrompt] = useState('A beautiful abstract wallpaper');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  const phoneRef = useRef<HTMLDivElement>(null);
  
  const selectedNotification = notifications.find(n => n.id === selectedId) || null;

  const setLoading = (key: string, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  };
  
  const handleAddNotification = () => {
    if (!selectedNotification) return;

    const newNotif: NotificationData = {
        ...selectedNotification,
        id: crypto.randomUUID(),
        recipient: "Novo Destinatário",
        timestamp: 'agora',
    };

    setNotifications(prev => [...prev, newNotif]);
    setSelectedId(newNotif.id);
  };

  const handleDeleteNotification = (idToDelete: string) => {
    const newNotifications = notifications.filter(n => n.id !== idToDelete);
    if (newNotifications.length === 0) {
      const newNotif = createNewNotification();
      setNotifications([newNotif]);
      setSelectedId(newNotif.id);
    } else {
      setNotifications(newNotifications);
      if (selectedId === idToDelete) {
        setSelectedId(newNotifications[0].id);
      }
    }
  };

  const handleGenerateWithAI = async (field: 'recipient' | 'timestamp' | 'all') => {
    setLoading(field, true);
    try {
      if (field === 'all') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Gere os detalhes para uma notificação de transação financeira falsa. Preciso do tipo de transação, valor, e nome do destinatário/remetente. O nome deve ser de uma pessoa famosa ou personagem. O valor deve ser um número entre 1 e 5000.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transactionType: { type: Type.STRING, enum: TRANSACTION_TYPES as any },
                amount: { type: Type.NUMBER },
                recipient: { type: Type.STRING }
              },
              required: ['transactionType', 'amount', 'recipient']
            }
          }
        });
        const data = JSON.parse(response.text);
        if (!selectedNotification) return;

        const newNotif: NotificationData = {
          ...selectedNotification, 
          id: crypto.randomUUID(),
          ...data,
          timestamp: 'agora'
        };

        setNotifications(prev => [...prev, newNotif]);
        setSelectedId(newNotif.id);

      } else {
        const prompt = field === 'recipient'
          ? "Gere um nome completo de uma pessoa, real ou fictícia. Retorne apenas o nome."
          : "Gere um texto de carimbo de data/hora para uma notificação. Retorne APENAS o texto. Exemplos de formatos aceitáveis: 'agora', 'há 5 minutos', '15:30', 'ontem às 21:00', 'agora mesmo'. Varie entre esses formatos.";
        const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt });
        handleNotificationChange(field, response.text.trim());
      }
    } catch (error) {
      console.error(`Error generating ${field} with AI:`, error);
      alert('Ocorreu um erro ao gerar com a IA. Tente novamente.');
    } finally {
      setLoading(field, false);
    }
  };

  const handleGenerateWallpaper = async () => {
    if (!wallpaperPrompt) return;
    setLoading('wallpaper', true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: wallpaperPrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          setWallpaper(`data:image/png;base64,${base64ImageBytes}`);
        }
      }
    } catch (error) {
      console.error("Error generating wallpaper:", error);
      alert('Ocorreu um erro ao gerar o papel de parede. Tente novamente.');
    } finally {
      setLoading('wallpaper', false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'wallpaper') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'icon') {
          handleNotificationChange('customAppIcon', reader.result as string);
        } else {
          setWallpaper(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (format: 'png' | 'gif') => {
    if (!phoneRef.current) return;
    setLoading(format, true);
    const element = phoneRef.current;
  
    try {
      if (format === 'png') {
        const dataUrl = await htmlToImage.toPng(element, { quality: 1 });
        const link = document.createElement('a');
        link.download = 'notificacao.png';
        link.href = dataUrl;
        link.click();
      } else if (format === 'gif') {
        setIsAnimating(true);
        const gif = new GIF({ workers: 2, quality: 10, workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js' });
        const animationDuration = 4000; // ms
        const frameRate = 15;
        const frameDelay = 1000 / frameRate;
        const frameCount = animationDuration / frameDelay;
  
        for (let i = 0; i < frameCount; i++) {
          await new Promise(resolve => setTimeout(resolve, frameDelay));
          const canvas = await html2canvas(element, { useCORS: true, backgroundColor: null });
          gif.addFrame(canvas, { delay: frameDelay });
        }
  
        gif.on('finished', (blob: Blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'notificacao-animada.gif';
          link.click();
          setLoading(format, false);
        });
        gif.render();
        setTimeout(() => setIsAnimating(false), animationDuration);
      }
    } catch (error) {
      console.error(`Error downloading as ${format}:`, error);
      alert(`Ocorreu um erro ao baixar o ${format}. Tente novamente.`);
      setLoading(format, false);
      setIsAnimating(false);
    }
    if (format === 'png') setLoading(format, false);
  };
  
  const handleOpenInTab = async () => {
    if (!phoneRef.current) return;
    const dataUrl = await htmlToImage.toPng(phoneRef.current, { quality: 1 });
    const newWindow = window.open();
    newWindow?.document.write(`<img src="${dataUrl}" alt="Notificação Gerada" style="max-width: 100%; height: auto;"/>`);
  };

  const handleNotificationChange = (field: keyof Omit<NotificationData, 'id'>, value: any) => {
    setNotifications(currentNotifications => 
        currentNotifications.map(n => 
            n.id === selectedId ? { ...n, [field]: value } : n
        )
    );
  };

  const handleStatusBarChange = (field: keyof StatusBarSettings, value: any) => setStatusBar(prev => ({ ...prev, [field]: value }));
  const handlePhoneModelChange = (id: string) => {
    const newModel = PHONE_MODELS.find(m => m.id === id);
    if (newModel) setPhoneModel(newModel);
  };

  if (!selectedNotification) {
      return (
        <div className="flex items-center justify-center h-full text-center">
            <p>Nenhuma notificação selecionada. Adicione uma para começar.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Notificação (Editando)</h2>
            <button onClick={() => handleGenerateWithAI('all')} disabled={isLoading.all} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isLoading.all ? <SpinnerIcon /> : <MagicWandIcon />} Adicionar com IA
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aplicativo</label>
              <div className="flex items-center gap-2 mt-1">
                <select id="appName" value={selectedNotification.appName} onChange={(e) => handleNotificationChange('appName', e.target.value as Bank)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                </select>
                <label htmlFor="customAppIcon" className="cursor-pointer p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <UploadIcon /><input id="customAppIcon" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'icon')} />
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transação</label>
              <select id="transactionType" value={selectedNotification.transactionType} onChange={(e) => handleNotificationChange('transactionType', e.target.value as TransactionType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {TRANSACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
              <input type="number" id="amount" value={selectedNotification.amount} onChange={(e) => handleNotificationChange('amount', parseFloat(e.target.value) || 0)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md" />
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinatário/Remetente</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="text" id="recipient" value={selectedNotification.recipient} onChange={(e) => handleNotificationChange('recipient', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md" />
                <button onClick={() => handleGenerateWithAI('recipient')} disabled={isLoading.recipient} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                   {isLoading.recipient ? <SpinnerIcon /> : <MagicWandIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="text" id="timestamp" value={selectedNotification.timestamp} onChange={(e) => handleNotificationChange('timestamp', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md" />
                <button onClick={() => handleGenerateWithAI('timestamp')} disabled={isLoading.timestamp} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                  {isLoading.timestamp ? <SpinnerIcon /> : <MagicWandIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Fila de Notificações</h2>
                <button onClick={handleAddNotification} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">+ Adicionar Nova</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {notifications.map(notif => (
                    <div key={notif.id} onClick={() => setSelectedId(notif.id)} className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedId === notif.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                        <div className="flex flex-col text-sm">
                            <span className="font-semibold">{notif.appName}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{notif.recipient} - R$ {notif.amount}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Aparelho</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="phoneModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                    <select id="phoneModel" value={phoneModel.id} onChange={(e) => handlePhoneModelChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        {PHONE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="wallpaper" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Papel de Parede</label>
                    <div className="flex items-center gap-2 mt-1">
                      <select id="wallpaper" value={wallpaper} onChange={(e) => setWallpaper(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                          {WALLPAPERS.map(wp => <option key={wp.name} value={wp.url}>{wp.name}</option>)}
                      </select>
                      <label htmlFor="customWallpaper" className="cursor-pointer p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        <UploadIcon /><input id="customWallpaper" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'wallpaper')} />
                      </label>
                    </div>
                    <div className="mt-2 space-y-2">
                        <label htmlFor="wallpaper-prompt" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gerar papel de parede com IA</label>
                        <div className="flex gap-2">
                          <input id="wallpaper-prompt" type="text" value={wallpaperPrompt} onChange={(e) => setWallpaperPrompt(e.target.value)} placeholder="Descreva o papel de parede..." className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md" />
                          <button onClick={handleGenerateWallpaper} disabled={isLoading.wallpaper} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading.wallpaper ? <SpinnerIcon /> : <MagicWandIcon />}
                          </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Barra de Status</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                    <input type="text" id="time" value={statusBar.time} onChange={(e) => handleStatusBarChange('time', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md" />
                </div>
                <div>
                    <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bateria ({statusBar.battery}%)</label>
                    <input type="range" id="battery" min="0" max="100" value={statusBar.battery} onChange={(e) => handleStatusBarChange('battery', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div>
                    <label htmlFor="signal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sinal ({statusBar.signal}/4)</label>
                    <input type="range" id="signal" min="0" max="4" step="1" value={statusBar.signal} onChange={(e) => handleStatusBarChange('signal', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div className="flex items-center">
                    <input id="wifi" type="checkbox" checked={statusBar.wifi} onChange={(e) => handleStatusBarChange('wifi', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <label htmlFor="wifi" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">WiFi Ativado</label>
                </div>
            </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4">
        <PhoneSimulator 
          ref={phoneRef}
          phoneModel={phoneModel}
          wallpaperUrl={wallpaper}
          statusBarSettings={statusBar}
          notifications={notifications}
          zoomLevel={zoomLevel}
          isAnimating={isAnimating}
        />
        <div className="flex items-center flex-wrap justify-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-md backdrop-blur-sm">
          <button onClick={() => setZoomLevel(z => z + 0.1)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"><ZoomInIcon/></button>
          <button onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.1))} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"><ZoomOutIcon/></button>
          
          <button onClick={() => handleDownload('png')} disabled={isLoading.png} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 bg-blue-600 text-white disabled:bg-blue-400">
              {isLoading.png ? <SpinnerIcon/> : <DownloadIcon/>}
              <span>Baixar PNG</span>
          </button>
          <button onClick={() => handleDownload('gif')} disabled={isLoading.gif} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 bg-purple-600 text-white disabled:bg-purple-400">
              {isLoading.gif ? <SpinnerIcon/> : <DownloadIcon/>}
              <span>Baixar GIF</span>
          </button>
          
          <button onClick={handleOpenInTab} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"><ExternalLinkIcon/></button>
          <button onClick={() => handleDeleteNotification(selectedId)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"><TrashIcon/></button>
        </div>
        {isLoading.gif && (
            <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                <p>Gerando GIF... Isso pode levar alguns segundos.</p>
            </div>
        )}
      </div>
    </div>
  );
};