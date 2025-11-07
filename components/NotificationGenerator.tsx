import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Bank, NotificationData, PhoneModel, StatusBarSettings, TransactionType } from '../types';
import { PHONE_MODELS } from '../data/phoneModels';
import { WALLPAPERS } from '../data/wallpapers';
import { BANKS, TRANSACTION_TYPES } from '../data/options';
import { PhoneSimulator } from './PhoneSimulator';
import { MagicWandIcon, UploadIcon, DownloadIcon, TrashIcon, ZoomInIcon, ZoomOutIcon, ExternalLinkIcon, SpinnerIcon, ChevronDownIcon } from './icons';

declare const html2canvas: any;

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

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-soft overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <h3 className="text-lg font-bold">{title}</h3>
        <ChevronDownIcon className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export const NotificationGenerator: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([createNewNotification()]);
  const [selectedId, setSelectedId] = useState<string>(notifications[0].id);
  
  const [phoneModel, setPhoneModel] = useState<PhoneModel>(PHONE_MODELS[0]);
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPERS[0].url);
  const [processedWallpaperUrl, setProcessedWallpaperUrl] = useState<string>(wallpaper);
  const [wallpaperError, setWallpaperError] = useState(false);

  const [statusBar, setStatusBar] = useState<StatusBarSettings>({ time: '09:41', wifi: true, signal: 4, battery: 88 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [wallpaperPrompt, setWallpaperPrompt] = useState('A beautiful abstract wallpaper');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  const phoneRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const selectedNotification = notifications.find(n => n.id === selectedId) || null;

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | undefined;

    setWallpaperError(false);
    if (!wallpaper) return;

    const process = () => {
        if (wallpaper.startsWith('http')) {
            fetch(wallpaper).then(res => res.blob()).then(blob => {
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) setProcessedWallpaperUrl(objectUrl);
            }).catch(err => {
                console.error("Failed to process wallpaper:", err);
                if (isMounted) {
                    setWallpaperError(true);
                    setProcessedWallpaperUrl(wallpaper);
                }
            });
        } else {
            setProcessedWallpaperUrl(wallpaper);
        }
    }
    process();

    return () => {
        isMounted = false;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        if (processedWallpaperUrl.startsWith('blob:')) URL.revokeObjectURL(processedWallpaperUrl);
    };
  }, [wallpaper]);

  const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));
  
  const handleAddNotification = () => {
    const baseNotification = selectedNotification || notifications[notifications.length - 1] || {};
    const newNotif: NotificationData = createNewNotification({
        ...baseNotification,
        recipient: "Novo Destinatário",
        timestamp: 'agora',
    });
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
      if (selectedId === idToDelete) setSelectedId(newNotifications[0].id);
    }
  };

  const handleGenerateWithAI = async (field: 'recipient' | 'timestamp' | 'all') => {
    setLoading(field, true);
    try {
      if (field === 'all') {
        const baseNotification = selectedNotification || notifications[notifications.length - 1] || {};
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Gere detalhes para uma notificação de transação: tipo, valor (entre 1 e 5000), e destinatário (pessoa famosa/personagem).`,
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
        const newNotif = createNewNotification({ ...baseNotification, ...data });
        setNotifications(prev => [...prev, newNotif]);
        setSelectedId(newNotif.id);
      } else {
        const prompt = field === 'recipient'
          ? "Gere um nome completo de uma pessoa, real ou fictícia. Apenas o nome."
          : "Gere um horário para uma notificação (ex: 'agora', 'há 5 minutos', '15:30'). Apenas o texto.";
        const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt });
        const cleanedText = response.text.trim().replace(/['"`*]/g, '');
        handleNotificationChange(field, cleanedText);
      }
    } catch (error) {
      console.error(`Error generating ${field} with AI:`, error);
      alert('Ocorreu um erro ao gerar com a IA.');
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
          setWallpaper(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (error) {
      console.error("Error generating wallpaper:", error);
      alert('Ocorreu um erro ao gerar o papel de parede.');
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

  const handleDownloadPng = async () => {
    if (!phoneRef.current) return;
    setLoading('png', true);
    const element = phoneRef.current;
  
    try {
      const canvas = await html2canvas(element, { allowTaint: true, useCORS: true, backgroundColor: null, scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'notificacao.png';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading as png:`, error);
      alert(`Erro ao baixar PNG. Verifique o console para detalhes.`);
    }
    setLoading('png', false);
  };
  
  const handleOpenInTab = async () => {
    if (!phoneRef.current) return;
    try {
      const canvas = await html2canvas(phoneRef.current, { allowTaint: true, useCORS: true, backgroundColor: null, scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const newWindow = window.open();
      newWindow?.document.write(`<body style="margin:0; background: #222;"><img src="${dataUrl}" alt="Notificação Gerada" style="max-width: 100%; height: auto;"/></body>`);
    } catch(error) {
       console.error("Error opening in new tab:", error);
       alert("Não foi possível abrir a imagem em uma nova aba.");
    }
  };

  const handleNotificationChange = (field: keyof Omit<NotificationData, 'id'>, value: any) => {
    setNotifications(current => current.map(n => n.id === selectedId ? { ...n, [field]: value } : n));
  };
  const handleStatusBarChange = (field: keyof StatusBarSettings, value: any) => setStatusBar(prev => ({ ...prev, [field]: value }));
  const handlePhoneModelChange = (id: string) => {
    const newModel = PHONE_MODELS.find(m => m.id === id);
    if (newModel) setPhoneModel(newModel);
  };

  if (!selectedNotification) {
      return <div className="flex items-center justify-center h-full text-center"><p>Adicione uma notificação para começar.</p></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="lg:col-span-1 space-y-6">

        {/* Painel de Edição e Fila */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Fila de Notificações</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => handleGenerateWithAI('all')} disabled={isLoading.all} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors">
                {isLoading.all ? <SpinnerIcon /> : <MagicWandIcon />} Gerar com IA
              </button>
              <button onClick={handleAddNotification} className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-200 rounded-lg hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600 transition-colors">+ Adicionar Nova</button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-6">
            {notifications.map(notif => (
              <div key={notif.id} onClick={() => setSelectedId(notif.id)} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${selectedId === notif.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                <div className="flex items-center gap-3 text-sm">
                  <img src={notif.customAppIcon || `https://ui-avatars.com/api/?name=${notif.appName.charAt(0)}&background=random&color=fff`} alt="ícone" className="w-8 h-8 rounded-md object-cover"/>
                  <div>
                    <span className="font-semibold block">{notif.appName}</span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{notif.recipient}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }} className="p-1 text-neutral-400 hover:text-red-500 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-bold mb-4 border-t border-neutral-200 dark:border-neutral-700 pt-6">Editar Notificação Selecionada</h3>
          <div className="space-y-4">
            {/* Campos de Edição */}
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Aplicativo</label>
              <div className="flex items-center gap-2">
                <select id="appName" value={selectedNotification.appName} onChange={(e) => handleNotificationChange('appName', e.target.value as Bank)} className="form-select">
                  {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                </select>
                <label htmlFor="customAppIcon" className="form-button-icon"><UploadIcon /><input id="customAppIcon" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'icon')} /></label>
              </div>
            </div>
             <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Tipo de Transação</label>
              <select id="transactionType" value={selectedNotification.transactionType} onChange={(e) => handleNotificationChange('transactionType', e.target.value as TransactionType)} className="form-select">
                {TRANSACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Valor</label>
              <input type="number" id="amount" value={selectedNotification.amount} onChange={(e) => handleNotificationChange('amount', parseFloat(e.target.value) || 0)} className="form-input" />
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Destinatário/Remetente</label>
              <div className="flex items-center gap-2">
                <input type="text" id="recipient" value={selectedNotification.recipient} onChange={(e) => handleNotificationChange('recipient', e.target.value)} className="form-input" />
                <button onClick={() => handleGenerateWithAI('recipient')} disabled={isLoading.recipient} className="form-button-icon">{isLoading.recipient ? <SpinnerIcon /> : <MagicWandIcon />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="timestamp" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Horário</label>
              <div className="flex items-center gap-2">
                <input type="text" id="timestamp" value={selectedNotification.timestamp} onChange={(e) => handleNotificationChange('timestamp', e.target.value)} className="form-input" />
                <button onClick={() => handleGenerateWithAI('timestamp')} disabled={isLoading.timestamp} className="form-button-icon">{isLoading.timestamp ? <SpinnerIcon /> : <MagicWandIcon />}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações do Aparelho */}
        <Accordion title="Aparelho e Tela">
          <div className="space-y-4">
            <div>
              <label htmlFor="phoneModel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Modelo do Celular</label>
              <select id="phoneModel" value={phoneModel.id} onChange={(e) => handlePhoneModelChange(e.target.value)} className="form-select">
                {PHONE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="wallpaper" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Papel de Parede</label>
              <div className="flex items-center gap-2">
                <select id="wallpaper" value={wallpaper} onChange={(e) => setWallpaper(e.target.value)} className="form-select">
                  {WALLPAPERS.map(wp => <option key={wp.name} value={wp.url}>{wp.name}</option>)}
                </select>
                <label htmlFor="customWallpaper" className="form-button-icon"><UploadIcon /><input id="customWallpaper" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'wallpaper')} /></label>
              </div>
              {wallpaperError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Aviso: falha ao carregar papel de parede. A exportação pode não funcionar.</p>}
              <div className="mt-4 space-y-2">
                <label htmlFor="wallpaper-prompt" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gerar com IA</label>
                <div className="flex gap-2">
                  <input id="wallpaper-prompt" type="text" value={wallpaperPrompt} onChange={(e) => setWallpaperPrompt(e.target.value)} placeholder="Descreva o papel de parede..." className="form-input" />
                  <button onClick={handleGenerateWallpaper} disabled={isLoading.wallpaper} className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors">{isLoading.wallpaper ? <SpinnerIcon /> : <MagicWandIcon />}</button>
                </div>
              </div>
            </div>
          </div>
        </Accordion>
        
        {/* Configurações da Barra de Status */}
        <Accordion title="Barra de Status">
           <div className="space-y-4">
              <div>
                  <label htmlFor="time" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Hora</label>
                  <input type="text" id="time" value={statusBar.time} onChange={(e) => handleStatusBarChange('time', e.target.value)} className="form-input" />
              </div>
              <div>
                  <label htmlFor="battery" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Bateria ({statusBar.battery}%)</label>
                  <input type="range" id="battery" min="0" max="100" value={statusBar.battery} onChange={(e) => handleStatusBarChange('battery', parseInt(e.target.value, 10))} className="form-range" />
              </div>
              <div>
                  <label htmlFor="signal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Sinal ({statusBar.signal}/4)</label>
                  <input type="range" id="signal" min="0" max="4" step="1" value={statusBar.signal} onChange={(e) => handleStatusBarChange('signal', parseInt(e.target.value, 10))} className="form-range" />
              </div>
              <div className="flex items-center">
                  <input id="wifi" type="checkbox" checked={statusBar.wifi} onChange={(e) => handleStatusBarChange('wifi', e.target.checked)} className="h-4 w-4 text-primary-600 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 rounded focus:ring-primary-500" />
                  <label htmlFor="wifi" className="ml-2 block text-sm text-neutral-900 dark:text-neutral-200">WiFi Ativado</label>
              </div>
          </div>
        </Accordion>
      </div>

      <div className="lg:col-span-1 flex flex-col items-center justify-center sticky top-24">
        <PhoneSimulator 
          ref={phoneRef}
          scrollRef={scrollRef}
          phoneModel={phoneModel}
          wallpaperUrl={processedWallpaperUrl}
          statusBarSettings={statusBar}
          notifications={notifications}
          zoomLevel={zoomLevel}
        />
        <div className="mt-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-full grid grid-cols-2 gap-2 p-2 bg-white/70 dark:bg-neutral-800/70 rounded-2xl shadow-medium backdrop-blur-lg">
                <div className='flex items-center justify-center gap-1'>
                  <button onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.1))} className="toolbar-button" aria-label="Diminuir zoom"><ZoomOutIcon/></button>
                  <span className='text-xs font-mono w-10 text-center'>{Math.round(zoomLevel*100)}%</span>
                  <button onClick={() => setZoomLevel(z => z + 0.1)} className="toolbar-button" aria-label="Aumentar zoom"><ZoomInIcon/></button>
                </div>
                <div className='flex items-center justify-center gap-1'>
                  <button onClick={handleOpenInTab} className="toolbar-button" aria-label="Abrir em nova aba"><ExternalLinkIcon/></button>
                  <button onClick={() => handleDeleteNotification(selectedId)} className="toolbar-button text-red-500" aria-label="Excluir notificação selecionada"><TrashIcon/></button>
                </div>
            </div>
            <button onClick={handleDownloadPng} disabled={isLoading.png} className="w-full toolbar-button-text bg-primary-600 text-white disabled:bg-primary-400 hover:bg-primary-700">
                {isLoading.png ? <SpinnerIcon/> : <DownloadIcon/>} Baixar Imagem (PNG)
            </button>
        </div>
      </div>
       <style>{`
        .form-select, .form-input {
          @apply block w-full pl-3 pr-10 py-2.5 text-base border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm rounded-lg transition-colors;
        }
        .form-button-icon {
          @apply flex-shrink-0 cursor-pointer p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 disabled:opacity-50 transition-colors;
        }
        .form-range {
          @apply w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700;
        }
        .form-range::-webkit-slider-thumb {
          @apply w-4 h-4 bg-primary-600 rounded-full appearance-none transition-transform active:scale-125;
        }
        .toolbar-button {
          @apply p-2.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 transition-colors;
        }
        .toolbar-button-text {
          @apply w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors;
        }
       `}</style>
    </div>
  );
};