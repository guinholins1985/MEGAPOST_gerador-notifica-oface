import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import * as htmlToImage from 'html-to-image';
import { PHONE_MODELS } from '../data/phoneModels';
import { WALLPAPERS } from '../data/wallpapers';
import { BANKS, TRANSACTION_TYPES } from '../data/options';
import { PhoneModel, NotificationData, StatusBarSettings, Bank, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import PhoneSimulator from './PhoneSimulator';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- Helper Components ---
const Fieldset: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
    <legend className="text-sm font-semibold px-2 text-gray-800 dark:text-gray-200">{legend}</legend>
    {children}
  </fieldset>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, id, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input ref={ref} id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" />
  </div>
));

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select id={id} {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors">
      {children}
    </select>
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
  const variantClasses = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-indigo-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>;
};


export const NotificationGenerator: React.FC = () => {
    // --- State ---
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [currentNotification, setCurrentNotification] = useState<Omit<NotificationData, 'id'>>({
        appName: 'Nubank',
        transactionType: 'Pix - Recebido',
        amount: 150.75,
        recipient: 'Padaria Pão Quente',
        customAppIcon: null,
        timestamp: 'agora',
    });
    const [statusBar, setStatusBar] = useState<StatusBarSettings>({
        time: '09:41',
        wifi: true,
        signal: 4,
        battery: 85,
    });
    const [selectedPhone, setSelectedPhone] = useState<PhoneModel>(PHONE_MODELS[0]);
    const [wallpaper, setWallpaper] = useState(WALLPAPERS[0].url);
    const [isZoomed, setIsZoomed] = useState(false);
    const [loadingStates, setLoadingStates] = useState({ name: false, wallpaper: false });

    const phoneRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setCurrentNotification(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
    };

    const handleStatusBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setStatusBar(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'range' ? parseInt(value, 10) : value,
        }));
    };

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentNotification(prev => ({ ...prev, customAppIcon: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const addNotification = () => {
        if (!currentNotification.amount || !currentNotification.recipient) {
            alert("Por favor, preencha o valor e o remetente/loja.");
            return;
        }
        setNotifications(prev => [
            ...prev,
            { ...currentNotification, id: new Date().toISOString() + Math.random() },
        ]);
    };

    const generateRecipientName = useCallback(async () => {
        if (!process.env.API_KEY) {
            alert("API Key não configurada.");
            return;
        }
        setLoadingStates(prev => ({ ...prev, name: true }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "Gere um nome completo e realista de uma pessoa brasileira ou o nome de um estabelecimento comercial brasileiro comum (ex: 'Supermercado Confiança', 'Farmácia Bem Estar'). Retorne apenas o nome, sem aspas ou texto adicional.",
            });
            setCurrentNotification(prev => ({ ...prev, recipient: response.text.trim() }));
        } catch (error) {
            console.error("Error generating recipient name:", error);
            alert("Falha ao gerar nome com IA.");
        } finally {
            setLoadingStates(prev => ({ ...prev, name: false }));
        }
    }, []);

    const handleAmountBlur = () => {
        if (currentNotification.recipient === '' || currentNotification.recipient === 'Padaria Pão Quente') {
            generateRecipientName();
        }
    };
    
    const generateWallpaper = async (prompt: string) => {
        if (!prompt) {
             alert("Por favor, descreva o papel de parede.");
             return;
        }
        setLoadingStates(prev => ({...prev, wallpaper: true}));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `Um papel de parede abstrato para celular com o tema: ${prompt}. Estilo minimalista, elegante.` }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const firstPart = response.candidates?.[0]?.content?.parts[0];
            if (firstPart && firstPart.inlineData) {
                const base64 = firstPart.inlineData.data;
                const mimeType = firstPart.inlineData.mimeType;
                setWallpaper(`data:${mimeType};base64,${base64}`);
            } else {
                throw new Error("Nenhuma imagem foi gerada.");
            }
        } catch(e) {
            console.error("Erro ao gerar papel de parede", e);
            alert("Falha ao gerar papel de parede com IA.");
        } finally {
            setLoadingStates(prev => ({...prev, wallpaper: false}));
        }
    }

    const handleAction = async (action: 'download' | 'new_tab' | 'zoom') => {
        if (!phoneRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(phoneRef.current, { quality: 1, pixelRatio: 2 });
            if (action === 'download') {
                const link = document.createElement('a');
                link.download = 'notificacao.png';
                link.href = dataUrl;
                link.click();
            } else if (action === 'new_tab') {
                const newWindow = window.open();
                newWindow?.document.write(`<img src="${dataUrl}" alt="Visualização da Notificação" />`);
            } else {
                setIsZoomed(true);
            }
        } catch (error) {
            console.error('Oops, something went wrong!', error);
        }
    };


    // --- Render ---
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* --- Form Panel --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personalizar Notificação</h2>
                
                <Fieldset legend="Conteúdo da Notificação">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select id="appName" name="appName" label="Nome do Banco/App" value={currentNotification.appName} onChange={handleInputChange}>
                            {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                        </Select>
                        <Select id="transactionType" name="transactionType" label="Tipo de Transação" value={currentNotification.transactionType} onChange={handleInputChange}>
                            {TRANSACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </Select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <Input ref={amountInputRef} label="Valor (R$)" id="amount" name="amount" type="number" step="0.01" value={currentNotification.amount} onChange={handleInputChange} onBlur={handleAmountBlur} />
                        <div className="relative">
                             <Input label="Remetente / Loja" id="recipient" name="recipient" value={currentNotification.recipient} onChange={handleInputChange} />
                             <button onClick={generateRecipientName} disabled={loadingStates.name} className="absolute right-2 bottom-1.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500" title="Gerar nome com IA">
                                {loadingStates.name ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1.8 0-3.6.6-5 1.7-1.4 1.1-2.5 2.6-3.2 4.3-.7 1.7-1 3.5-1 5.3 0 3.6 1.2 7 3.5 9.5s5.9 3.5 9.5 3.5c1.8 0 3.6-.3 5.3-1 1.7-.7 3.2-1.8 4.3-3.2 2.5-3.5 2.5-7.9 0-11.4C21.9 5.4 19.3 3 15.7 3Z"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>}
                            </button>
                        </div>
                    </div>
                     <Input label="Timestamp (ex: agora, há 5m)" id="timestamp" name="timestamp" value={currentNotification.timestamp} onChange={handleInputChange} />
                </Fieldset>

                <Fieldset legend="Aparência do Celular">
                     <Select id="phoneModel" name="phoneModel" label="Modelo do Celular" value={selectedPhone.id} onChange={(e) => setSelectedPhone(PHONE_MODELS.find(p => p.id === e.target.value)!)}>
                        {PHONE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </Select>
                    <Select id="wallpaper" name="wallpaper" label="Papel de Parede" value={wallpaper} onChange={(e) => setWallpaper(e.target.value)}>
                        {WALLPAPERS.map(wp => <option key={wp.name} value={wp.url}>{wp.name}</option>)}
                    </Select>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gerar Papel de Parede com IA</label>
                        <div className="flex gap-2">
                            <input id="wallpaper-prompt" placeholder="Ex: ondas azuis e douradas" className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            <Button type="button" onClick={() => generateWallpaper((document.getElementById('wallpaper-prompt') as HTMLInputElement).value)} disabled={loadingStates.wallpaper}>
                                {loadingStates.wallpaper ? 'Gerando...' : 'Gerar'}
                            </Button>
                        </div>
                    </div>
                </Fieldset>
                
                <Fieldset legend="Barra de Status">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Horário" id="time" name="time" type="text" value={statusBar.time} onChange={handleStatusBarChange} />
                         <div className="flex items-center justify-center pt-5">
                            <input id="wifi" name="wifi" type="checkbox" checked={statusBar.wifi} onChange={handleStatusBarChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="wifi" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Wi-Fi Visível</label>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="signal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sinal de Celular ({statusBar.signal}/4)</label>
                        <input id="signal" name="signal" type="range" min="0" max="4" step="1" value={statusBar.signal} onChange={handleStatusBarChange} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                     <div>
                        <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível da Bateria ({statusBar.battery}%)</label>
                        <input id="battery" name="battery" type="range" min="0" max="100" step="1" value={statusBar.battery} onChange={handleStatusBarChange} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </Fieldset>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button type="button" onClick={addNotification} variant="primary">Adicionar Notificação</Button>
                    <Button type="button" onClick={() => setNotifications([])} variant="danger">Limpar Notificações</Button>
                </div>

            </div>

            {/* --- Preview Panel --- */}
            <div className="space-y-4 lg:sticky lg:top-8">
                <div className="flex items-center justify-center gap-2">
                     <button onClick={() => handleAction('download')} title="Baixar Imagem" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                     <button onClick={() => handleAction('zoom')} title="Zoom" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
                     <button onClick={() => handleAction('new_tab')} title="Abrir em Nova Aba" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                </div>
                <div className="flex justify-center items-center h-full">
                    <PhoneSimulator ref={phoneRef} phoneModel={selectedPhone} wallpaperUrl={wallpaper} statusBarSettings={statusBar} notifications={notifications.length > 0 ? notifications : [{ ...currentNotification, id: 'preview-0' }]} />
                </div>
            </div>

            {/* Zoom Modal */}
            {isZoomed && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsZoomed(false)}>
                    <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                        <img src={phoneRef.current && htmlToImage.toPng(phoneRef.current, { pixelRatio: 2 }).then(url => (document.querySelector('#zoom-img') as HTMLImageElement).src = url)} id="zoom-img" alt="Visualização Ampliada" className="max-w-[90vw] max-h-[90vh] object-contain"/>
                    </div>
                </div>
            )}
        </div>
    );
};
