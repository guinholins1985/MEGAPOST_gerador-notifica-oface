import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationData, Preset } from '../types';
import { phoneModels } from '../data/phoneModels';
import { wallpapers } from '../data/wallpapers';
import { bankOptions, transactionTypeOptions } from '../data/options';
import { formatCurrency } from '../utils/formatters';
import { AdjustmentsHorizontalIcon, ArrowUpTrayIcon, BellIcon, BookmarkSquareIcon, ChevronDownIcon, DevicePhoneMobileIcon, FolderOpenIcon, MagicWandIcon, SparklesIcon, TrashIcon } from './icons';

interface InspectorPanelProps {
    data: NotificationData;
    setData: (data: NotificationData) => void;
    presets: Preset[];
    setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
}

const AccordionSection: React.FC<{ title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
        <div className="flex items-center space-x-3">
          {icon}
          <span className="font-semibold text-neutral-800 dark:text-white">{title}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 pt-0 animate-[fade-in_0.3s_ease-out]">{children}</div>}
    </div>
  );
};


const InspectorPanel: React.FC<InspectorPanelProps> = ({ data, setData, presets, setPresets }) => {
    const [presetName, setPresetName] = useState('');
    const wallpaperInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, value: formatCurrency(e.target.value) });
    };
    
    const handleCustomBankIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setData({ ...data, customBankIcon: event.target?.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };

    const handleStatusBarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setData({
            ...data,
            statusBar: {
                ...data.statusBar,
                [name]: type === 'range' ? parseInt(value) : value,
            }
        });
    };
    
    const handleStatusColorChange = (color: 'white' | 'black') => {
      setData({ ...data, statusBar: { ...data.statusBar, color }});
    }

    const handlePhoneModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData({ ...data, phoneModel: e.target.value });
    };

    const handleWallpaperChange = (url: string) => {
        setData({ ...data, wallpaper: url });
    };
    
    const handleCustomWallpaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setData({ ...data, wallpaper: event.target?.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };

    const handleSavePreset = () => {
      if (presetName.trim()) {
        const presetData: Omit<NotificationData, 'id' | 'value' | 'recipient' | 'time' | 'wallpaper' | 'phoneModel' | 'statusBar' | 'presetName'> = {
          bank: data.bank,
          customBankName: data.customBankName,
          customBankIcon: data.customBankIcon,
          transactionType: data.transactionType,
        };
        const newPreset: Preset = { id: uuidv4(), name: presetName.trim(), data: presetData };
        setPresets(prev => [...prev, newPreset]);
        setPresetName('');
      }
    };

    const applyPreset = (preset: Preset) => {
      setData({ ...data, ...preset.data, presetName: preset.name });
    };

    const deletePreset = (id: string) => {
      setPresets(prev => prev.filter(p => p.id !== id));
    };
    
    const inputStyles = "w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-md text-sm shadow-soft focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col h-full animate-slide-in-from-right shadow-medium">
           <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
             <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Inspetor de Propriedades</h2>
             <p className="text-sm text-neutral-500 dark:text-neutral-400">Ajuste os detalhes da sua notificação.</p>
           </div>
           <div className="flex-grow overflow-y-auto custom-scrollbar">
              <AccordionSection title="Notificação" icon={<BellIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400"/>} defaultOpen>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Aplicativo</label>
                    <select id="bank" name="bank" value={data.bank} onChange={handleChange} className={inputStyles}>
                      {bankOptions.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  {data.bank === 'Outro' && (
                    <>
                      <div>
                        <label htmlFor="customBankName" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Nome do App</label>
                        <input type="text" name="customBankName" id="customBankName" value={data.customBankName} onChange={handleChange} className={inputStyles} />
                      </div>
                      <div>
                        <label htmlFor="customBankIcon" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Ícone (Upload)</label>
                        <input type="file" accept="image/*" onChange={handleCustomBankIconChange} className="mt-1 block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-600 dark:file:bg-primary-600/10 dark:file:text-primary-300 hover:file:bg-primary-500/20 dark:hover:file:bg-primary-600/20"/>
                      </div>
                    </>
                  )}
                   <div>
                    <label htmlFor="transactionType" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Tipo de Transação</label>
                    <select id="transactionType" name="transactionType" value={data.transactionType} onChange={handleChange} className={inputStyles}>
                      {transactionTypeOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                   <div>
                    <label htmlFor="value" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Valor</label>
                    <input type="text" name="value" id="value" value={data.value} onChange={handleValueChange} className={inputStyles} />
                  </div>
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Remetente/Destinatário</label>
                    <input type="text" name="recipient" id="recipient" value={data.recipient} onChange={handleChange} className={inputStyles} />
                  </div>
                </div>
              </AccordionSection>
              <AccordionSection title="Tela" icon={<DevicePhoneMobileIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400"/>}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="phoneModel" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Modelo</label>
                        <select id="phoneModel" value={data.phoneModel} onChange={handlePhoneModelChange} className={inputStyles}>
                            {phoneModels.map(m => <option key={m.name}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Plano de Fundo</label>
                          <button onClick={() => wallpaperInputRef.current?.click()} className="flex items-center space-x-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            <span>Importar</span>
                          </button>
                          <input 
                            type="file" 
                            ref={wallpaperInputRef}
                            accept="image/*" 
                            onChange={handleCustomWallpaperChange} 
                            className="hidden" 
                          />
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {wallpapers.map(w => (
                                <div key={w.name} onClick={() => handleWallpaperChange(w.url)} className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${data.wallpaper === w.url ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent hover:border-primary-300'}`}>
                                    <img src={w.url} alt={w.name} className="w-full h-16 object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </AccordionSection>
               <AccordionSection title="Barra de Status" icon={<AdjustmentsHorizontalIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400"/>}>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="statusBar_time" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Hora</label>
                        <input type="text" name="time" id="statusBar_time" value={data.statusBar.time} onChange={handleStatusBarChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="signal" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Sinal ({data.statusBar.signal})</label>
                        <input type="range" min="0" max="4" step="1" name="signal" id="signal" value={data.statusBar.signal} onChange={handleStatusBarChange} className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-600"/>
                    </div>
                     <div>
                        <label htmlFor="wifi" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Wi-Fi ({data.statusBar.wifi})</label>
                        <input type="range" min="0" max="3" step="1" name="wifi" id="wifi" value={data.statusBar.wifi} onChange={handleStatusBarChange} className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-600"/>
                    </div>
                    <div>
                        <label htmlFor="battery" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Bateria ({data.statusBar.battery}%)</label>
                        <input type="range" min="0" max="100" step="1" name="battery" id="battery" value={data.statusBar.battery} onChange={handleStatusBarChange} className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-600"/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Cor do Texto</label>
                         <div className="mt-2 flex space-x-2">
                            <button onClick={() => handleStatusColorChange('white')} className={`w-8 h-8 rounded-full bg-white border-2 border-neutral-300 dark:border-neutral-500 ${data.statusBar.color === 'white' ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-primary-500' : ''}`}></button>
                            <button onClick={() => handleStatusColorChange('black')} className={`w-8 h-8 rounded-full bg-black border-2 border-neutral-300 dark:border-neutral-700 ${data.statusBar.color === 'black' ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-primary-500' : ''}`}></button>
                         </div>
                    </div>
                </div>
              </AccordionSection>
              <AccordionSection title="Presets" icon={<BookmarkSquareIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400"/>}>
                 <div className="space-y-3">
                    <div className="flex space-x-2">
                        <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Nome do preset" className={`flex-grow ${inputStyles}`} />
                        <button onClick={handleSavePreset} className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-soft">
                            Salvar
                        </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {presets.length > 0 ? presets.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-neutral-100 dark:bg-neutral-800/50 rounded-md">
                                <button onClick={() => applyPreset(p)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">{p.name}</button>
                                <button onClick={() => deletePreset(p.id)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )) : <p className="text-sm text-neutral-500 dark:text-neutral-500 text-center py-2">Nenhum preset salvo.</p>}
                    </div>
                </div>
              </AccordionSection>
           </div>
        </div>
    );
};

export default InspectorPanel;